import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useAuth, useJobs, useCreateJob, useFileUpload, useStats } from '../hooks/use-api'
import { mockApiClient } from '../lib/mock-api'

// Mock the API client
vi.mock('../lib/api-client', () => ({
  apiClient: mockApiClient
}))

describe('API Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe('useAuth', () => {
    it('should handle successful login', async () => {
      const { result } = renderHook(() => useAuth())

      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.loading).toBe(false)

      const loginPromise = result.current.login('demo@linkedagent.com', 'demo123')

      expect(result.current.loading).toBe(true)

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const loginResult = await loginPromise
      expect(loginResult).toBeDefined()
      expect(result.current.isAuthenticated).toBe(true)
    })

    it('should handle login failure', async () => {
      const { result } = renderHook(() => useAuth())

      await expect(
        result.current.login('invalid@email.com', 'wrongpassword')
      ).rejects.toThrow('Invalid credentials')

      expect(result.current.isAuthenticated).toBe(false)
    })

    it('should handle logout', async () => {
      const { result } = renderHook(() => useAuth())

      // First login
      await result.current.login('demo@linkedagent.com', 'demo123')
      expect(result.current.isAuthenticated).toBe(true)

      // Then logout
      result.current.logout()
      expect(result.current.isAuthenticated).toBe(false)
    })
  })

  describe('useJobs', () => {
    beforeEach(async () => {
      // Login before testing jobs
      mockApiClient.setToken('test-token')
    })

    it('should fetch jobs successfully', async () => {
      const { result } = renderHook(() => useJobs())

      expect(result.current.loading).toBe(true)

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.jobs).toBeDefined()
      expect(Array.isArray(result.current.jobs?.data)).toBe(true)
      expect(result.current.error).toBeNull()
    })

    it('should handle job filtering', async () => {
      const { result } = renderHook(() => useJobs({ status: 'running' }))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.jobs?.data.every(job => job.status === 'running')).toBe(true)
    })

    it('should handle pagination', async () => {
      const { result } = renderHook(() => useJobs({ page: 1, pageSize: 10 }))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.jobs?.page).toBe(1)
      expect(result.current.jobs?.pageSize).toBe(10)
    })

    it('should handle refresh', async () => {
      const { result } = renderHook(() => useJobs())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const initialJobs = result.current.jobs
      
      result.current.refresh()
      
      expect(result.current.loading).toBe(true)

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.jobs).toBeDefined()
    })
  })

  describe('useCreateJob', () => {
    beforeEach(() => {
      mockApiClient.setToken('test-token')
    })

    it('should create job successfully', async () => {
      const { result } = renderHook(() => useCreateJob())

      expect(result.current.loading).toBe(false)

      const jobRequest = {
        fileId: 'test-file-id',
        concurrency: 3,
        retries: 2,
        timeout: 120,
      }

      const createPromise = result.current.createJob(jobRequest)

      expect(result.current.loading).toBe(true)

      const job = await createPromise

      expect(job).toBeDefined()
      expect(job.status).toBe('queued')
      expect(result.current.loading).toBe(false)
    })

    it('should handle job creation failure', async () => {
      const { result } = renderHook(() => useCreateJob())

      // Mock API to throw error
      const originalCreateJob = mockApiClient.createJob
      mockApiClient.createJob = vi.fn().mockRejectedValue(new Error('Creation failed'))

      await expect(
        result.current.createJob({ fileId: 'invalid-file' })
      ).rejects.toThrow('Creation failed')

      expect(result.current.loading).toBe(false)

      // Restore original method
      mockApiClient.createJob = originalCreateJob
    })

    it('should cancel job successfully', async () => {
      const { result } = renderHook(() => useCreateJob())

      await expect(
        result.current.cancelJob('test-job-id')
      ).resolves.toBeUndefined()
    })
  })

  describe('useFileUpload', () => {
    beforeEach(() => {
      mockApiClient.setToken('test-token')
    })

    it('should upload file successfully', async () => {
      const { result } = renderHook(() => useFileUpload())

      const mockFile = new File(['test content'], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })

      const uploadPromise = result.current.uploadFile(mockFile)

      expect(result.current.uploading).toBe(true)

      const uploadResult = await uploadPromise

      expect(uploadResult).toBeDefined()
      expect(uploadResult.fileId).toBeDefined()
      expect(result.current.uploading).toBe(false)
    })

    it('should handle upload progress', async () => {
      const { result } = renderHook(() => useFileUpload())
      const progressCallback = vi.fn()

      const mockFile = new File(['test content'], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })

      await result.current.uploadFile(mockFile, progressCallback)

      // Note: In a real test, you'd mock XMLHttpRequest to trigger progress events
      expect(result.current.uploading).toBe(false)
    })

    it('should download file successfully', async () => {
      const { result } = renderHook(() => useFileUpload())

      const downloadUrl = await result.current.downloadFile('test-file-id')

      expect(downloadUrl).toBeDefined()
      expect(typeof downloadUrl).toBe('string')
    })
  })

  describe('useStats', () => {
    beforeEach(() => {
      mockApiClient.setToken('test-token')
    })

    it('should fetch stats successfully', async () => {
      const { result } = renderHook(() => useStats())

      expect(result.current.loading).toBe(true)

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.stats).toBeDefined()
      expect(typeof result.current.stats?.jobsLast30Days).toBe('number')
      expect(typeof result.current.stats?.successRate).toBe('number')
      expect(typeof result.current.stats?.avgDuration).toBe('number')
      expect(result.current.error).toBeNull()
    })

    it('should handle stats fetch failure', async () => {
      const { result } = renderHook(() => useStats())

      // Mock API to throw error
      const originalGetStats = mockApiClient.getStats
      mockApiClient.getStats = vi.fn().mockRejectedValue(new Error('Stats fetch failed'))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBeDefined()
      expect(result.current.stats).toBeNull()

      // Restore original method
      mockApiClient.getStats = originalGetStats
    })

    it('should refresh stats', async () => {
      const { result } = renderHook(() => useStats())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const initialStats = result.current.stats

      result.current.refresh()

      expect(result.current.loading).toBe(true)

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.stats).toBeDefined()
    })
  })
})