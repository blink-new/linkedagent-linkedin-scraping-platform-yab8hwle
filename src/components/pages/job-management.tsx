import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CreateJobWizard } from '../job/create-job-wizard'
import { useJobs, useJobUpdates, useCreateJob, useFileUpload } from '../../hooks/use-api'
import type { Job, JobStatus, WebSocketJobUpdate } from '../../types/api'
import { 
  Plus, 
  Search, 
  Filter,
  Download,
  MoreHorizontal,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react'

const getStatusIcon = (status: JobStatus) => {
  switch (status) {
    case 'success':
      return <CheckCircle className="h-4 w-4 text-green-600" />
    case 'running':
      return <Activity className="h-4 w-4 text-blue-600 animate-pulse" />
    case 'error':
      return <XCircle className="h-4 w-4 text-red-600" />
    case 'queued':
      return <Clock className="h-4 w-4 text-orange-600" />
    case 'cancelled':
      return <XCircle className="h-4 w-4 text-gray-600" />
    default:
      return <AlertCircle className="h-4 w-4 text-gray-600" />
  }
}

const getStatusBadge = (status: JobStatus) => {
  const variants = {
    success: 'default',
    running: 'secondary',
    error: 'destructive', 
    queued: 'outline',
    cancelled: 'outline'
  } as const

  const displayStatus = status === 'success' ? 'completed' : status

  return (
    <Badge variant={variants[status] || 'outline'}>
      {displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
    </Badge>
  )
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString()
}

export function JobManagement() {
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [showCreateWizard, setShowCreateWizard] = useState(false)
  
  const { 
    jobs, 
    isLoading: jobsLoading, 
    refetch: refetchJobs 
  } = useJobs({ 
    status: statusFilter === 'all' ? undefined : statusFilter,
    page: currentPage,
    pageSize: 20 
  })
  
  const { cancelJob } = useCreateJob()
  const { downloadFile } = useFileUpload()
  const [realtimeJobs, setRealtimeJobs] = useState<Job[]>([])

  // Update jobs list with real-time data
  useEffect(() => {
    setRealtimeJobs(jobs.data)
  }, [jobs.data])

  // Handle real-time job updates
  useJobUpdates((update: WebSocketJobUpdate) => {
    setRealtimeJobs(prev => 
      prev.map(job => 
        job.id === update.jobId 
          ? { ...job, processed: update.processed, status: update.status }
          : job
      )
    )
  })

  // Filter jobs by search query
  const filteredJobs = realtimeJobs.filter(job =>
    job.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCancelJob = async (jobId: string) => {
    const success = await cancelJob(jobId)
    if (success) {
      refetchJobs()
    }
  }

  const handleDownloadResults = async (job: Job) => {
    if (job.outputFileId) {
      const url = await downloadFile(job.outputFileId)
      if (url) {
        window.open(url, '_blank')
      }
    }
  }

  const handleJobCreated = () => {
    setShowCreateWizard(false)
    refetchJobs()
  }

  if (jobsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Job Management</h1>
            <p className="text-muted-foreground">
              Create, monitor, and manage your LinkedIn scraping jobs
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Job
          </Button>
        </div>

        {/* Loading skeleton */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-64" />
              </div>
              <Skeleton className="h-10 w-24" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Job Management</h1>
          <p className="text-muted-foreground">
            Create, monitor, and manage your LinkedIn scraping jobs
          </p>
        </div>
        <Button 
          className="gap-2"
          onClick={() => setShowCreateWizard(true)}
        >
          <Plus className="h-4 w-4" />
          New Job
        </Button>
      </div>

      {/* Jobs Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Jobs</CardTitle>
              <CardDescription>
                Manage and monitor your scraping operations
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={() => refetchJobs()}
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
          
          {/* Filters */}
          <div className="flex items-center gap-4 pt-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search jobs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as JobStatus | 'all')}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="queued">Queued</SelectItem>
                <SelectItem value="running">Running</SelectItem>
                <SelectItem value="success">Completed</SelectItem>
                <SelectItem value="error">Failed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredJobs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchQuery ? 'No jobs match your search criteria.' : 'No jobs found. Create your first job to get started!'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Profiles</TableHead>
                  <TableHead>Retries</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJobs.map((job) => {
                  const progress = job.totalUrls > 0 ? Math.round((job.processed / job.totalUrls) * 100) : 0
                  
                  return (
                    <TableRow key={job.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(job.status)}
                          <span className="font-mono text-sm">{job.id.slice(0, 12)}...</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(job.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={progress} className="w-20" />
                          <span className="text-sm text-muted-foreground min-w-[3rem]">
                            {progress}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <span className="font-medium">{job.processed.toLocaleString()}</span>
                          <span className="text-muted-foreground">/{job.totalUrls.toLocaleString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {job.retryCount > 0 ? (
                          <Badge variant="outline" className="gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {job.retryCount}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDateTime(job.createdAt)}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDateTime(job.updatedAt)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {job.outputFileId && (
                              <DropdownMenuItem onClick={() => handleDownloadResults(job)}>
                                <Download className="mr-2 h-4 w-4" />
                                Download Results
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem>
                              View Details
                            </DropdownMenuItem>
                            {(job.status === 'running' || job.status === 'queued') && (
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => handleCancelJob(job.id)}
                              >
                                Cancel Job
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {jobs.total > jobs.pageSize && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * jobs.pageSize) + 1} to {Math.min(currentPage * jobs.pageSize, jobs.total)} of {jobs.total} jobs
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={currentPage * jobs.pageSize >= jobs.total}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Job Wizard */}
      <CreateJobWizard 
        open={showCreateWizard}
        onOpenChange={setShowCreateWizard}
        onJobCreated={handleJobCreated}
      />
    </div>
  )
}