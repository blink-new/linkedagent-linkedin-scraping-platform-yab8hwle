import { 
  Activity, 
  Clock, 
  Download, 
  TrendingUp, 
  Users, 
  Zap,
  AlertCircle,
  CheckCircle,
  XCircle,
  MoreHorizontal
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
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
import { useStats, useJobs, useJobUpdates, useCreateJob, useFileUpload } from '../../hooks/use-api'
import { useEffect, useState } from 'react'
import type { Job, WebSocketJobUpdate } from '../../types/api'

const getStatusIcon = (status: string) => {
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

const getStatusBadge = (status: string) => {
  const variants = {
    success: 'default',
    running: 'secondary', 
    error: 'destructive',
    queued: 'outline',
    cancelled: 'outline'
  } as const

  const displayStatus = status === 'success' ? 'completed' : status

  return (
    <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
      {displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
    </Badge>
  )
}

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
  
  if (diffInHours < 1) return 'Just now'
  if (diffInHours < 24) return `${diffInHours} hours ago`
  
  const diffInDays = Math.floor(diffInHours / 24)
  return `${diffInDays} days ago`
}

export function Dashboard() {
  const { stats, isLoading: statsLoading, error: statsError } = useStats()
  const { jobs, isLoading: jobsLoading, refetch: refetchJobs } = useJobs({ pageSize: 5 })
  const { cancelJob } = useCreateJob()
  const { downloadFile } = useFileUpload()
  const [realtimeJobs, setRealtimeJobs] = useState<Job[]>([])

  // Update jobs list with real-time data
  useEffect(() => {
    if (jobs.data && Array.isArray(jobs.data)) {
      setRealtimeJobs(jobs.data)
    }
  }, [jobs.data])

  // Handle real-time job updates
  useJobUpdates((update: WebSocketJobUpdate) => {
    setRealtimeJobs(prev => 
      (prev || []).map(job => 
        job.id === update.jobId 
          ? { ...job, processed: update.processed, status: update.status }
          : job
      )
    )
  })

  // Calculate dashboard stats from jobs data
  const dashboardStats = [
    {
      title: 'Active Jobs',
      value: (realtimeJobs || []).filter(job => job.status === 'running' || job.status === 'queued').length.toString(),
      change: '+2 from yesterday',
      icon: Activity,
      color: 'text-blue-600'
    },
    {
      title: 'Profiles Processed',
      value: (realtimeJobs || []).reduce((sum, job) => sum + job.processed, 0).toLocaleString(),
      change: '+12% from last month',
      icon: Users,
      color: 'text-green-600'
    },
    {
      title: 'Success Rate',
      value: `${stats?.successRate?.toFixed(1) || 0}%`,
      change: '+2.1% from last week',
      icon: TrendingUp,
      color: 'text-emerald-600'
    },
    {
      title: 'Avg Processing Time',
      value: `${stats?.avgDuration?.toFixed(1) || 0}s`,
      change: '-0.3s from last week',
      icon: Clock,
      color: 'text-orange-600'
    }
  ]

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

  if (statsLoading || jobsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Monitor your LinkedIn scraping operations and performance metrics
            </p>
          </div>
          <Button className="gap-2">
            <Zap className="h-4 w-4" />
            New Job
          </Button>
        </div>

        {/* Loading skeletons */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Jobs</CardTitle>
            <CardDescription>
              Your latest scraping jobs and their current status
            </CardDescription>
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
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your LinkedIn scraping operations and performance metrics
          </p>
        </div>
        <Button className="gap-2">
          <Zap className="h-4 w-4" />
          New Job
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Jobs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Jobs</CardTitle>
          <CardDescription>
            Your latest scraping jobs and their current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(!realtimeJobs || realtimeJobs.length === 0) ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No jobs found. Create your first job to get started!</p>
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
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(realtimeJobs || []).map((job) => {
                  const progress = job.totalUrls > 0 ? Math.round((job.processed / job.totalUrls) * 100) : 0
                  
                  return (
                    <TableRow key={job.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(job.status)}
                          <span className="font-mono text-sm">{job.id.slice(0, 8)}...</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(job.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={progress} className="w-16" />
                          <span className="text-sm text-muted-foreground">
                            {progress}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span>{job.processed.toLocaleString()}</span>
                        <span className="text-muted-foreground">/{job.totalUrls.toLocaleString()}</span>
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
                      <TableCell className="text-muted-foreground">
                        {formatTimeAgo(job.createdAt)}
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
        </CardContent>
      </Card>
    </div>
  )
}