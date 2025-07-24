import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { useStats, useJobs } from '../../hooks/use-api'
import { 
  TrendingUp, 
  Users, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity
} from 'lucide-react'

// Mock data for charts - in real app this would come from API
const performanceData = [
  { month: 'Jan', jobs: 45, success: 42, failed: 3 },
  { month: 'Feb', jobs: 52, success: 48, failed: 4 },
  { month: 'Mar', jobs: 38, success: 35, failed: 3 },
  { month: 'Apr', jobs: 61, success: 58, failed: 3 },
  { month: 'May', jobs: 55, success: 51, failed: 4 },
  { month: 'Jun', jobs: 67, success: 63, failed: 4 }
]

const processingTimeData = [
  { day: 'Mon', avgTime: 2.3 },
  { day: 'Tue', avgTime: 2.1 },
  { day: 'Wed', avgTime: 2.8 },
  { day: 'Thu', avgTime: 2.2 },
  { day: 'Fri', avgTime: 2.6 },
  { day: 'Sat', avgTime: 1.9 },
  { day: 'Sun', avgTime: 2.0 }
]

const errorBreakdown = [
  { name: 'Rate Limited', value: 35, color: '#ef4444' },
  { name: 'Network Timeout', value: 25, color: '#f97316' },
  { name: 'Invalid Profile', value: 20, color: '#eab308' },
  { name: 'Access Denied', value: 15, color: '#8b5cf6' },
  { name: 'Other', value: 5, color: '#6b7280' }
]

export function Analytics() {
  const { stats, isLoading: statsLoading, error: statsError } = useStats()
  const { jobs, isLoading: jobsLoading } = useJobs({ pageSize: 100 }) // Get more jobs for analytics

  // Calculate analytics from jobs data
  const jobsByStatus = jobs.data.reduce((acc, job) => {
    acc[job.status] = (acc[job.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const totalProfiles = jobs.data.reduce((sum, job) => sum + job.totalUrls, 0)
  const processedProfiles = jobs.data.reduce((sum, job) => sum + job.processed, 0)
  const successfulJobs = jobsByStatus.success || 0
  const failedJobs = jobsByStatus.error || 0
  const activeJobs = (jobsByStatus.running || 0) + (jobsByStatus.queued || 0)

  if (statsLoading || jobsLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Performance insights and usage statistics
          </p>
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

        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const analyticsStats = [
    {
      title: 'Total Jobs',
      value: jobs.total.toString(),
      change: `${stats?.jobsLast30Days || 0} in last 30 days`,
      icon: Activity,
      color: 'text-blue-600'
    },
    {
      title: 'Profiles Processed',
      value: processedProfiles.toLocaleString(),
      change: `${totalProfiles.toLocaleString()} total URLs`,
      icon: Users,
      color: 'text-green-600'
    },
    {
      title: 'Success Rate',
      value: `${stats?.successRate?.toFixed(1) || 0}%`,
      change: `${successfulJobs}/${successfulJobs + failedJobs} jobs completed`,
      icon: CheckCircle,
      color: 'text-emerald-600'
    },
    {
      title: 'Avg Processing Time',
      value: `${stats?.avgDuration?.toFixed(1) || 0}s`,
      change: 'per profile',
      icon: Clock,
      color: 'text-orange-600'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Performance insights and usage statistics for your LinkedIn scraping operations
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {analyticsStats.map((stat) => (
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

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Job Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Job Performance</CardTitle>
            <CardDescription>
              Monthly job completion trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="success" fill="#22c55e" name="Successful" />
                <Bar dataKey="failed" fill="#ef4444" name="Failed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Processing Time Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Processing Time</CardTitle>
            <CardDescription>
              Average processing time per profile (seconds)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={processingTimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="avgTime" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Avg Time (s)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Error Breakdown Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Error Breakdown</CardTitle>
            <CardDescription>
              Common failure reasons and their frequency
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={errorBreakdown}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {errorBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Current Status Overview</CardTitle>
            <CardDescription>
              Real-time job status distribution
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Active Jobs</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">{activeJobs}</span>
                  <Badge variant="secondary">{activeJobs > 0 ? 'Running' : 'Idle'}</Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">{successfulJobs}</span>
                  <Progress 
                    value={jobs.total > 0 ? (successfulJobs / jobs.total) * 100 : 0} 
                    className="w-16" 
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium">Failed</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">{failedJobs}</span>
                  <Badge variant="destructive">{failedJobs > 0 ? 'Needs Attention' : 'All Good'}</Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium">Queued</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">{jobsByStatus.queued || 0}</span>
                  <Badge variant="outline">Waiting</Badge>
                </div>
              </div>
            </div>

            {failedJobs > 0 && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {failedJobs} job{failedJobs > 1 ? 's' : ''} need{failedJobs === 1 ? 's' : ''} attention
                  </span>
                </div>
                <p className="text-xs text-red-600 dark:text-red-300 mt-1">
                  Check the Job Management page for details and retry options.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}