import { Job, JobCreateRequest, Tenant, Stats, JobList } from '../types/api'
import { mockApiClient } from './mock-api'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.linkedagent.com/v1'
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true' || !import.meta.env.VITE_API_BASE_URL

class ApiClient {
  private token: string | null = null
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
    // Load token from localStorage on initialization
    this.token = localStorage.getItem('linkedagent_token')
    
    // Initialize mock client with the same token if using mock API
    if (USE_MOCK_API && this.token) {
      mockApiClient.setToken(this.token)
    }
  }

  async login(credentials: { email: string; password: string }): Promise<{ token: string }> {
    if (USE_MOCK_API) {
      const data = await mockApiClient.login(credentials.email, credentials.password)
      this.setToken(data.token)
      return data
    }
    
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
    
    const data = await response.json()
    this.setToken(data.token)
    return data
  }

  async getTenants(): Promise<Tenant[]> {
    const response = await this.request('/tenants')
    return response.json()
  }

  async getJobs(params?: { 
    status?: string
    page?: number
    pageSize?: number 
  }): Promise<JobList> {
    const searchParams = new URLSearchParams()
    
    if (params?.status) searchParams.set('status', params.status)
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.pageSize) searchParams.set('pageSize', params.pageSize.toString())
    
    const url = `/jobs${searchParams.toString() ? '?' + searchParams.toString() : ''}`
    const response = await this.request(url)
    return response.json()
  }

  async getJob(jobId: string): Promise<Job> {
    const response = await this.request(`/jobs/${jobId}`)
    return response.json()
  }

  async createJob(request: JobCreateRequest): Promise<Job> {
    const response = await this.request('/jobs', {
      method: 'POST',
      body: JSON.stringify(request),
    })
    return response.json()
  }

  async cancelJob(jobId: string): Promise<void> {
    await this.request(`/jobs/${jobId}`, {
      method: 'POST',
    })
  }

  async uploadFile(file: File, onProgress?: (progress: number) => void): Promise<{ fileId: string }> {
    const formData = new FormData()
    formData.append('file', file)

    // For mock API, use the mock client
    if (USE_MOCK_API) {
      return mockApiClient.uploadFile(file)
    }

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      
      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = (e.loaded / e.total) * 100
            onProgress(progress)
          }
        })
      }

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText)
            resolve(data)
          } catch (error) {
            reject(new Error('Invalid response format'))
          }
        } else {
          reject(new Error(`Upload failed: ${xhr.statusText}`))
        }
      })

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'))
      })

      xhr.open('POST', `${this.baseUrl}/files/upload`)
      
      if (this.token) {
        xhr.setRequestHeader('Authorization', `Bearer ${this.token}`)
      }
      
      xhr.send(formData)
    })
  }

  async downloadFile(fileId: string): Promise<string> {
    const response = await this.request(`/files/${fileId}`)
    
    if (response.status === 302) {
      return response.headers.get('Location') || response.url
    }
    
    throw new Error('File not found')
  }

  async getStats(): Promise<Stats> {
    const response = await this.request('/stats')
    return response.json()
  }

  setToken(token: string | null) {
    this.token = token
    if (token) {
      localStorage.setItem('linkedagent_token', token)
    } else {
      localStorage.removeItem('linkedagent_token')
    }
    
    // Also set token in mock client for consistency
    if (USE_MOCK_API) {
      mockApiClient.setToken(token)
    }
  }

  getToken(): string | null {
    return this.token
  }

  isAuthenticated(): boolean {
    if (USE_MOCK_API) {
      return mockApiClient.isAuthenticated()
    }
    return this.token !== null
  }

  logout(): void {
    this.setToken(null)
    if (USE_MOCK_API) {
      mockApiClient.logout()
    }
  }

  createWebSocket(): WebSocket {
    if (USE_MOCK_API) {
      // Return a mock WebSocket for demo mode
      const mockWs = {
        onopen: null as ((event: Event) => void) | null,
        onmessage: null as ((event: MessageEvent) => void) | null,
        onclose: null as ((event: CloseEvent) => void) | null,
        onerror: null as ((event: Event) => void) | null,
        close: () => {},
        send: () => {},
        readyState: WebSocket.OPEN,
        CONNECTING: WebSocket.CONNECTING,
        OPEN: WebSocket.OPEN,
        CLOSING: WebSocket.CLOSING,
        CLOSED: WebSocket.CLOSED,
      } as WebSocket

      // Simulate connection
      setTimeout(() => {
        if (mockWs.onopen) mockWs.onopen(new Event('open'))
      }, 100)

      return mockWs
    }

    const wsUrl = this.baseUrl.replace('http', 'ws') + '/jobs/stream'
    return new WebSocket(wsUrl)
  }

  parseWebSocketMessage(data: string): any {
    try {
      return JSON.parse(data)
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error)
      return null
    }
  }

  subscribeToJobUpdates(callback: (update: any) => void): () => void {
    if (USE_MOCK_API) {
      return mockApiClient.subscribeToJobUpdates(callback)
    }

    const wsUrl = this.baseUrl.replace('http', 'ws') + '/jobs/stream'
    const ws = new WebSocket(wsUrl)
    
    ws.onmessage = (event) => {
      try {
        const update = JSON.parse(event.data)
        callback(update)
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
    
    return () => {
      ws.close()
    }
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<Response> {
    // Use mock API if configured
    if (USE_MOCK_API) {
      return this.handleMockRequest(endpoint, options)
    }

    const url = `${this.baseUrl}${endpoint}`
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }
    
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }
    
    const response = await fetch(url, {
      ...options,
      headers,
    })
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }))
      throw new Error(error.message || `HTTP ${response.status}`)
    }
    
    return response
  }

  private async handleMockRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const method = options.method || 'GET'
    
    try {
      let data: any
      
      if (endpoint === '/auth/login' && method === 'POST') {
        const body = JSON.parse(options.body as string)
        data = await mockApiClient.login(body.email, body.password)
      } else if (endpoint === '/tenants') {
        data = await mockApiClient.getTenants()
      } else if (endpoint.startsWith('/jobs/') && endpoint !== '/jobs') {
        const jobId = endpoint.split('/')[2]
        if (method === 'POST') {
          await mockApiClient.cancelJob(jobId)
          return new Response(null, { status: 204 })
        } else {
          data = await mockApiClient.getJob(jobId)
        }
      } else if (endpoint === '/jobs') {
        if (method === 'POST') {
          const body = JSON.parse(options.body as string)
          data = await mockApiClient.createJob(body)
        } else {
          const url = new URL('http://localhost' + endpoint)
          const params = {
            status: url.searchParams.get('status') || undefined,
            page: url.searchParams.get('page') ? parseInt(url.searchParams.get('page')!) : undefined,
            pageSize: url.searchParams.get('pageSize') ? parseInt(url.searchParams.get('pageSize')!) : undefined,
          }
          data = await mockApiClient.getJobs(params)
        }
      } else if (endpoint.startsWith('/files/')) {
        const fileId = endpoint.split('/')[2]
        data = await mockApiClient.downloadFile(fileId)
        return new Response(null, { 
          status: 302, 
          headers: { Location: data }
        })
      } else if (endpoint === '/stats') {
        data = await mockApiClient.getStats()
      } else {
        throw new Error('Not found')
      }
      
      return new Response(JSON.stringify(data), {
        status: method === 'POST' ? 201 : 200,
        headers: { 'Content-Type': 'application/json' }
      })
    } catch (error) {
      return new Response(JSON.stringify({ message: error.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  }
}

export const apiClient = new ApiClient(API_BASE_URL)