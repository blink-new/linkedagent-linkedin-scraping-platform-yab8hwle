// API Types based on OpenAPI 3.1.0 spec

export interface ApiError {
  message: string;
}

export interface Tenant {
  id: string;
  name: string;
}

export interface JobCreateRequest {
  fileId: string;
  concurrency?: number; // 1-10, default 3
  retries?: number; // 0-5, default 2
  timeout?: number; // 30-300, default 120
  proxyProfileId?: string | null;
}

export type JobStatus = 'queued' | 'running' | 'success' | 'error' | 'cancelled';

export interface Job {
  id: string;
  tenantId: string;
  status: JobStatus;
  totalUrls: number;
  processed: number;
  retryCount: number;
  createdAt: string;
  updatedAt: string;
  outputFileId?: string | null;
}

export interface JobList {
  data: Job[];
  page: number;
  pageSize: number;
  total: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface FileUploadResponse {
  fileId: string;
}

export interface Stats {
  jobsLast30Days: number;
  successRate: number;
  avgDuration: number;
}

// WebSocket message types
export interface WebSocketJobUpdate {
  type: 'update';
  jobId: string;
  processed: number;
  status: JobStatus;
}

// Query parameters
export interface JobsQueryParams {
  status?: JobStatus;
  page?: number;
  pageSize?: number;
}