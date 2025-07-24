import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../lib/api-client';
import type {
  Job,
  JobList,
  JobCreateRequest,
  Tenant,
  Stats,
  JobsQueryParams,
  WebSocketJobUpdate
} from '../types/api';

// Auth hook
export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(apiClient.isAuthenticated());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await apiClient.login({ email, password });
      setIsAuthenticated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    apiClient.logout();
    setIsAuthenticated(false);
  }, []);

  return {
    isAuthenticated,
    isLoading,
    error,
    login,
    logout
  };
}

// Tenants hook
export function useTenants() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTenants = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getTenants();
      setTenants(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tenants');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (apiClient.isAuthenticated()) {
      fetchTenants();
    }
  }, [fetchTenants]);

  return {
    tenants,
    isLoading,
    error,
    refetch: fetchTenants
  };
}

// Jobs hook
export function useJobs(params?: JobsQueryParams) {
  const [jobs, setJobs] = useState<JobList>({ data: [], page: 1, pageSize: 20, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getJobs(params);
      // Ensure data has the correct structure
      const validData = {
        data: Array.isArray(data?.data) ? data.data : [],
        page: data?.page || 1,
        pageSize: data?.pageSize || 20,
        total: data?.total || 0
      };
      setJobs(validData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch jobs');
      // Set empty data on error
      setJobs({ data: [], page: 1, pageSize: 20, total: 0 });
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  useEffect(() => {
    if (apiClient.isAuthenticated()) {
      fetchJobs();
    }
  }, [fetchJobs]);

  return {
    jobs,
    isLoading,
    error,
    refetch: fetchJobs
  };
}

// Single job hook
export function useJob(jobId: string | null) {
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchJob = useCallback(async () => {
    if (!jobId) return;
    
    try {
      setIsLoading(true);
      const data = await apiClient.getJob(jobId);
      setJob(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch job');
    } finally {
      setIsLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    if (jobId && apiClient.isAuthenticated()) {
      fetchJob();
    }
  }, [fetchJob, jobId]);

  return {
    job,
    isLoading,
    error,
    refetch: fetchJob
  };
}

// Job creation hook
export function useCreateJob() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createJob = useCallback(async (jobRequest: JobCreateRequest): Promise<Job | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const job = await apiClient.createJob(jobRequest);
      return job;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create job');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const cancelJob = useCallback(async (jobId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await apiClient.cancelJob(jobId);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel job');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    createJob,
    cancelJob,
    isLoading,
    error
  };
}

// File upload hook
export function useFileUpload() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(async (file: File): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.uploadFile(file);
      return response.fileId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const downloadFile = useCallback(async (fileId: string): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const url = await apiClient.downloadFile(fileId);
      return url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download file');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    uploadFile,
    downloadFile,
    isLoading,
    error
  };
}

// Stats hook
export function useStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getStats();
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (apiClient.isAuthenticated()) {
      fetchStats();
    }
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats
  };
}

// WebSocket hook for real-time job updates
export function useJobUpdates(onUpdate?: (update: WebSocketJobUpdate) => void) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!apiClient.isAuthenticated()) return;

    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      try {
        ws = apiClient.createWebSocket();

        ws.onopen = () => {
          setIsConnected(true);
          setError(null);
        };

        ws.onmessage = (event) => {
          const update = apiClient.parseWebSocketMessage(event.data);
          if (update && onUpdate) {
            onUpdate(update);
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          // Reconnect after 3 seconds
          reconnectTimeout = setTimeout(connect, 3000);
        };

        ws.onerror = () => {
          setError('WebSocket connection error');
        };
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to connect');
      }
    };

    connect();

    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (ws) {
        ws.close();
      }
    };
  }, [onUpdate]);

  return {
    isConnected,
    error
  };
}