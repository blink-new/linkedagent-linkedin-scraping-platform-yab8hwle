import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAuth, useJobs, useCreateJob, useFileUpload, useStats } from '../../hooks/use-api'
import { apiClient } from '../../lib/api-client'

// Mock the API client
vi.mock('../../lib/api-client', () => ({
  apiClient: {
    login: vi.fn(),
    getJobs: vi.fn(),
    createJob: vi.fn(),
    uploadFile: vi.fn(),
    getStats: vi.fn(),
    setToken: vi.fn(),
    getToken: vi.fn(),
  },
}))

const mockApiClient = apiClient as any

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('should handle successful login', async () => {
    const mockToken = 'mock-token-123'
    mockApiClient.login.mockResolvedValue({ token: mockToken })
    mockApiClient.getToken.mockReturnValue(null)

    const { result } = renderHook(() => useAuth())

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.loading).toBe(false)

    await result.current.login('test@example.com', 'password')

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true)
    })

    expect(mockApiClient.login).toHaveBeenCalledWith('test@example.com', 'password')
    expect(mockApiClient.setToken).toHaveBeenCalledWith(mockToken)
  })

  it('should handle login failure', async () => {
    const mockError = new Error('Invalid credentials')
    mockApiClient.login.mockRejectedValue(mockError)
    mockApiClient.getToken.mockReturnValue(null)

    const { result } = renderHook(() => useAuth())

    await expect(result.current.login('test@example.com', 'wrong')).rejects.toThrow('Invalid credentials')

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.error).toBe('Invalid credentials')
  })

  it('should handle logout', async () => {
    mockApiClient.getToken.mockReturnValue('existing-token')

    const { result } = renderHook(() => useAuth())

    expect(result.current.isAuthenticated).toBe(true)

    result.current.logout()

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(false)
    })

    expect(mockApiClient.setToken).toHaveBeenCalledWith(null)
  })
})

describe('useJobs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch jobs successfully', async () => {
    const mockJobs = {
      data: [
        {
          id: '1',
          tenantId: '1',
          status: 'running',
          totalUrls: 100,
          processed: 50,
          retryCount: 2,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T01:00:00Z',
          outputFileId: null,
        },
      ],
      page: 1,
      pageSize: 20,
      total: 1,
    }

    mockApiClient.getJobs.mockResolvedValue(mockJobs)

    const { result } = renderHook(() => useJobs())

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.jobs).toEqual(mockJobs.data)
    expect(result.current.pagination).toEqual({
      page: 1,
      pageSize: 20,
      total: 1,
    })
    expect(result.current.error).toBeNull()
  })

  it('should handle jobs fetch error', async () => {
    const mockError = new Error('Network error')
    mockApiClient.getJobs.mockRejectedValue(mockError)

    const { result } = renderHook(() => useJobs())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.jobs).toEqual([])
    expect(result.current.error).toBe('Network error')
  })

  it('should refetch jobs when filters change', async () => {
    const mockJobs = { data: [], page: 1, pageSize: 20, total: 0 }
    mockApiClient.getJobs.mockResolvedValue(mockJobs)

    const { result } = renderHook(() => useJobs())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockApiClient.getJobs).toHaveBeenCalledWith({})

    result.current.setFilters({ status: 'running' })

    await waitFor(() => {
      expect(mockApiClient.getJobs).toHaveBeenCalledWith({ status: 'running' })
    })
  })
})

describe('useCreateJob', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create job successfully', async () => {
    const mockJob = {
      id: 'new-job-1',
      tenantId: '1',
      status: 'queued' as const,
      totalUrls: 100,
      processed: 0,
      retryCount: 0,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      outputFileId: null,
    }

    mockApiClient.createJob.mockResolvedValue(mockJob)

    const { result } = renderHook(() => useCreateJob())

    expect(result.current.loading).toBe(false)

    const jobRequest = {
      fileId: 'file-123',
      concurrency: 3,
      retries: 2,
      timeout: 120,
    }

    const createdJob = await result.current.createJob(jobRequest)

    expect(createdJob).toEqual(mockJob)
    expect(mockApiClient.createJob).toHaveBeenCalledWith(jobRequest)
    expect(result.current.loading).toBe(false)
  })

  it('should handle job creation error', async () => {
    const mockError = new Error('Validation failed')
    mockApiClient.createJob.mockRejectedValue(mockError)

    const { result } = renderHook(() => useCreateJob())

    const jobRequest = {
      fileId: 'invalid-file',
      concurrency: 3,
      retries: 2,
      timeout: 120,
    }

    await expect(result.current.createJob(jobRequest)).rejects.toThrow('Validation failed')
    expect(result.current.error).toBe('Validation failed')
  })
})

describe('useFileUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should upload file successfully', async () => {
    const mockResponse = { fileId: 'uploaded-file-123' }
    mockApiClient.uploadFile.mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useFileUpload())

    expect(result.current.loading).toBe(false)
    expect(result.current.progress).toBe(0)

    const mockFile = new File(['test content'], 'test.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })

    const fileId = await result.current.uploadFile(mockFile)

    expect(fileId).toBe('uploaded-file-123')
    expect(mockApiClient.uploadFile).toHaveBeenCalledWith(mockFile, expect.any(Function))
  })

  it('should handle file upload error', async () => {
    const mockError = new Error('File too large')
    mockApiClient.uploadFile.mockRejectedValue(mockError)

    const { result } = renderHook(() => useFileUpload())

    const mockFile = new File(['test content'], 'test.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })

    await expect(result.current.uploadFile(mockFile)).rejects.toThrow('File too large')
    expect(result.current.error).toBe('File too large')
  })
})

describe('useStats', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch stats successfully', async () => {
    const mockStats = {
      jobsLast30Days: 25,
      successRate: 0.88,
      avgDuration: 1800,
    }

    mockApiClient.getStats.mockResolvedValue(mockStats)

    const { result } = renderHook(() => useStats())

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.stats).toEqual(mockStats)
    expect(result.current.error).toBeNull()
  })

  it('should handle stats fetch error', async () => {
    const mockError = new Error('Unauthorized')
    mockApiClient.getStats.mockRejectedValue(mockError)

    const { result } = renderHook(() => useStats())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.stats).toBeNull()
    expect(result.current.error).toBe('Unauthorized')
  })
})