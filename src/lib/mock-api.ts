// Mock API for development and testing
import { Job, JobCreateRequest, JobList, Tenant, Stats } from '../types/api'

// Mock data
const mockTenants: Tenant[] = [
  { id: '550e8400-e29b-41d4-a716-446655440000', name: 'Acme Corp' },
  { id: '550e8400-e29b-41d4-a716-446655440001', name: 'TechStart Inc' },
]

const mockJobs: Job[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440010',
    tenantId: '550e8400-e29b-41d4-a716-446655440000',
    status: 'running',
    totalUrls: 1000,
    processed: 750,
    retryCount: 12,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    outputFileId: null,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440011',
    tenantId: '550e8400-e29b-41d4-a716-446655440000',
    status: 'success',
    totalUrls: 500,
    processed: 500,
    retryCount: 8,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
    outputFileId: 'file-123',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440012',
    tenantId: '550e8400-e29b-41d4-a716-446655440000',
    status: 'error',
    totalUrls: 200,
    processed: 150,
    retryCount: 25,
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 47 * 60 * 60 * 1000).toISOString(),
    outputFileId: null,
  },
]

const mockStats: Stats = {
  jobsLast30Days: 45,
  successRate: 0.87,
  avgDuration: 1800, // 30 minutes in seconds
}

// Mock API implementation
export class MockApiClient {
  private token: string | null = null
  private currentTenant: string = mockTenants[0].id

  async login(email: string, password: string): Promise<{ token: string }> {
    // Accept demo credentials
    if (email === 'demo@linkedagent.com' && password === 'demo123') {
      this.token = 'mock-jwt-token-' + Date.now()
      return { token: this.token }
    }
    throw new Error('Invalid credentials')
  }

  async getTenants(): Promise<Tenant[]> {
    this.ensureAuthenticated()
    return mockTenants
  }

  async getJobs(params?: {
    status?: string
    page?: number
    pageSize?: number
  }): Promise<JobList> {
    this.ensureAuthenticated()
    
    let filteredJobs = [...mockJobs]
    
    if (params?.status) {
      filteredJobs = filteredJobs.filter(job => job.status === params.status)
    }
    
    const page = params?.page || 1
    const pageSize = params?.pageSize || 20
    const start = (page - 1) * pageSize
    const end = start + pageSize
    
    return {
      data: filteredJobs.slice(start, end),
      page,
      pageSize,
      total: filteredJobs.length,
    }
  }

  async getJob(jobId: string): Promise<Job> {
    this.ensureAuthenticated()
    const job = mockJobs.find(j => j.id === jobId)
    if (!job) throw new Error('Job not found')
    return job
  }

  async createJob(request: JobCreateRequest): Promise<Job> {
    this.ensureAuthenticated()
    
    const newJob: Job = {
      id: '550e8400-e29b-41d4-a716-' + Date.now(),
      tenantId: this.currentTenant,
      status: 'queued',
      totalUrls: Math.floor(Math.random() * 1000) + 100,
      processed: 0,
      retryCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      outputFileId: null,
    }
    
    mockJobs.unshift(newJob)
    
    // Simulate job progression
    setTimeout(() => {
      newJob.status = 'running'
      newJob.updatedAt = new Date().toISOString()
    }, 1000)
    
    return newJob
  }

  async cancelJob(jobId: string): Promise<void> {
    this.ensureAuthenticated()
    const job = mockJobs.find(j => j.id === jobId)
    if (job) {
      job.status = 'cancelled'
      job.updatedAt = new Date().toISOString()
    }
  }

  async uploadFile(file: File): Promise<{ fileId: string }> {
    this.ensureAuthenticated()
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return {
      fileId: 'file-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
    }
  }

  async downloadFile(fileId: string): Promise<string> {
    this.ensureAuthenticated()
    // Return a mock download URL
    return `https://api.linkedagent.com/v1/files/${fileId}/download?token=${this.token}`
  }

  async getStats(): Promise<Stats> {
    this.ensureAuthenticated()
    return mockStats
  }

  setToken(token: string | null) {
    this.token = token
  }

  getToken(): string | null {
    return this.token
  }

  isAuthenticated(): boolean {
    return this.token !== null
  }

  logout(): void {
    this.setToken(null)
  }

  setCurrentTenant(tenantId: string) {
    this.currentTenant = tenantId
  }

  private ensureAuthenticated() {
    if (!this.token) {
      throw new Error('Not authenticated')
    }
  }

  // WebSocket simulation
  subscribeToJobUpdates(callback: (update: { jobId: string; processed: number; status: string }) => void) {
    const interval = setInterval(() => {
      const runningJobs = mockJobs.filter(job => job.status === 'running')
      
      runningJobs.forEach(job => {
        if (job.processed < job.totalUrls) {
          job.processed = Math.min(job.totalUrls, job.processed + Math.floor(Math.random() * 50) + 10)
          job.updatedAt = new Date().toISOString()
          
          if (job.processed >= job.totalUrls) {
            job.status = Math.random() > 0.1 ? 'success' : 'error'
            job.outputFileId = job.status === 'success' ? 'file-' + Date.now() : null
          }
          
          callback({
            jobId: job.id,
            processed: job.processed,
            status: job.status,
          })
        }
      })
    }, 2000)

    return () => clearInterval(interval)
  }
}

export const mockApiClient = new MockApiClient()