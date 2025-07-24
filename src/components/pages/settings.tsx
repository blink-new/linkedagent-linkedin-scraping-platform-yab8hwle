import { 
  Settings2, 
  Shield, 
  Globe, 
  Users, 
  Bell,
  Key,
  Database,
  Zap,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Edit,
  Eye,
  EyeOff
} from 'lucide-react'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

const proxyPools = [
  {
    id: 'premium',
    name: 'Premium Pool',
    status: 'active',
    proxies: 150,
    successRate: 98.2,
    avgLatency: '120ms',
    cost: '$0.05/request'
  },
  {
    id: 'standard',
    name: 'Standard Pool',
    status: 'active',
    proxies: 75,
    successRate: 94.8,
    avgLatency: '180ms',
    cost: '$0.03/request'
  },
  {
    id: 'basic',
    name: 'Basic Pool',
    status: 'inactive',
    proxies: 25,
    successRate: 89.1,
    avgLatency: '250ms',
    cost: '$0.01/request'
  }
]

const teamMembers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@acmecorp.com',
    role: 'Admin',
    status: 'active',
    lastActive: '2 hours ago'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@acmecorp.com',
    role: 'Operator',
    status: 'active',
    lastActive: '1 day ago'
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike@acmecorp.com',
    role: 'Viewer',
    status: 'inactive',
    lastActive: '1 week ago'
  }
]

export function Settings() {
  const [showApiKey, setShowApiKey] = useState(false)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [slackNotifications, setSlackNotifications] = useState(false)
  const [autoRetry, setAutoRetry] = useState(true)
  const [dataRetention, setDataRetention] = useState('90')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Configure your LinkedAgent platform settings and preferences
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Reset to Defaults
          </Button>
          <Button className="gap-2">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general" className="gap-2">
            <Settings2 className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="proxy" className="gap-2">
            <Globe className="h-4 w-4" />
            Proxy
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="team" className="gap-2">
            <Users className="h-4 w-4" />
            Team
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Organization Settings</CardTitle>
              <CardDescription>
                Basic configuration for your organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="orgName">Organization Name</Label>
                  <Input 
                    id="orgName" 
                    name="organizationName"
                    defaultValue="Acme Corp" 
                    autoComplete="organization"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select defaultValue="utc-8">
                    <SelectTrigger id="timezone" name="timezone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="utc-8">Pacific Time (UTC-8)</SelectItem>
                      <SelectItem value="utc-5">Eastern Time (UTC-5)</SelectItem>
                      <SelectItem value="utc+0">UTC</SelectItem>
                      <SelectItem value="utc+1">Central European Time (UTC+1)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  name="organizationDescription"
                  placeholder="Brief description of your organization..."
                  defaultValue="Leading recruitment agency specializing in tech talent acquisition."
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Default Job Settings</h4>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="defaultConcurrency">Default Concurrency</Label>
                    <Select defaultValue="5">
                      <SelectTrigger id="defaultConcurrency" name="defaultConcurrency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 parallel request</SelectItem>
                        <SelectItem value="3">3 parallel requests</SelectItem>
                        <SelectItem value="5">5 parallel requests</SelectItem>
                        <SelectItem value="10">10 parallel requests</SelectItem>
                        <SelectItem value="20">20 parallel requests</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="defaultRetries">Default Retry Attempts</Label>
                    <Select defaultValue="3">
                      <SelectTrigger id="defaultRetries" name="defaultRetries">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">No retries</SelectItem>
                        <SelectItem value="1">1 retry</SelectItem>
                        <SelectItem value="3">3 retries</SelectItem>
                        <SelectItem value="5">5 retries</SelectItem>
                        <SelectItem value="10">10 retries</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="defaultTimeout">Default Timeout</Label>
                    <Select defaultValue="30">
                      <SelectTrigger id="defaultTimeout" name="defaultTimeout">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 seconds</SelectItem>
                        <SelectItem value="30">30 seconds</SelectItem>
                        <SelectItem value="60">60 seconds</SelectItem>
                        <SelectItem value="120">120 seconds</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Auto-retry Failed Jobs</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically retry jobs that fail due to temporary issues
                    </p>
                  </div>
                  <Switch
                    checked={autoRetry}
                    onCheckedChange={setAutoRetry}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>
                Configure data retention and storage preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="dataRetention">Data Retention Period</Label>
                <Select value={dataRetention} onValueChange={setDataRetention}>
                  <SelectTrigger id="dataRetention" name="dataRetention">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="180">180 days</SelectItem>
                    <SelectItem value="365">1 year</SelectItem>
                    <SelectItem value="forever">Forever</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  How long to keep job results and logs before automatic deletion
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 p-4 bg-secondary/50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold">2.4 GB</div>
                  <div className="text-sm text-muted-foreground">Storage Used</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">127,543</div>
                  <div className="text-sm text-muted-foreground">Profiles Stored</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">1,247</div>
                  <div className="text-sm text-muted-foreground">Job Records</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Proxy Settings */}
        <TabsContent value="proxy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Proxy Configuration</CardTitle>
              <CardDescription>
                Manage proxy pools and rotation settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pool Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Proxies</TableHead>
                    <TableHead>Success Rate</TableHead>
                    <TableHead>Avg Latency</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {proxyPools.map((pool) => (
                    <TableRow key={pool.id}>
                      <TableCell className="font-medium">{pool.name}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={pool.status === 'active' ? 'default' : 'secondary'}
                        >
                          {pool.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{pool.proxies}</TableCell>
                      <TableCell>
                        <span className={pool.successRate > 95 ? 'text-green-600' : 'text-orange-600'}>
                          {pool.successRate}%
                        </span>
                      </TableCell>
                      <TableCell>{pool.avgLatency}</TableCell>
                      <TableCell>{pool.cost}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex justify-between items-center mt-4">
                <p className="text-sm text-muted-foreground">
                  Proxy pools help distribute requests and avoid rate limiting
                </p>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Proxy Pool
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>
                Manage API keys for external integrations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="primaryApiKey">Primary API Key</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    id="primaryApiKey"
                    name="primaryApiKey"
                    type={showApiKey ? 'text' : 'password'}
                    value="la_sk_1234567890abcdef"
                    readOnly
                    className="font-mono"
                    autoComplete="off"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button variant="outline">
                    Regenerate
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Use this key to authenticate API requests to LinkedAgent
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Webhook Settings</h4>
                <div className="space-y-2">
                  <Label htmlFor="webhookUrl">Webhook URL</Label>
                  <Input 
                    id="webhookUrl" 
                    name="webhookUrl"
                    type="url"
                    placeholder="https://your-app.com/webhooks/linkedagent"
                    autoComplete="url"
                  />
                  <p className="text-sm text-muted-foreground">
                    Receive real-time notifications about job status changes
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Access Control</CardTitle>
              <CardDescription>
                Configure IP restrictions and access policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="allowedIps">Allowed IP Addresses</Label>
                <Textarea 
                  id="allowedIps"
                  name="allowedIps"
                  placeholder="192.168.1.0/24&#10;10.0.0.1&#10;203.0.113.0/24"
                  rows={4}
                  autoComplete="off"
                />
                <p className="text-sm text-muted-foreground">
                  One IP address or CIDR block per line. Leave empty to allow all IPs.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Settings */}
        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>
                Manage team access and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.name}</TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{member.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={member.status === 'active' ? 'default' : 'secondary'}
                        >
                          {member.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {member.lastActive}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove {member.name} from your team? 
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction>Remove</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex justify-between items-center mt-4">
                <p className="text-sm text-muted-foreground">
                  Team members can access jobs and analytics based on their role
                </p>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Invite Member
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Configure how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email updates about job status and system alerts
                    </p>
                  </div>
                  <Switch
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Slack Integration</Label>
                    <p className="text-sm text-muted-foreground">
                      Send notifications to your Slack workspace
                    </p>
                  </div>
                  <Switch
                    checked={slackNotifications}
                    onCheckedChange={setSlackNotifications}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Notification Types</h4>
                
                <div className="space-y-3">
                  {[
                    { label: 'Job Completed', description: 'When a scraping job finishes successfully' },
                    { label: 'Job Failed', description: 'When a scraping job encounters errors' },
                    { label: 'Rate Limit Warnings', description: 'When approaching rate limits' },
                    { label: 'System Maintenance', description: 'Scheduled maintenance notifications' },
                    { label: 'Weekly Reports', description: 'Weekly performance summary' }
                  ].map((notification) => (
                    <div key={notification.label} className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>{notification.label}</Label>
                        <p className="text-sm text-muted-foreground">
                          {notification.description}
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  ))}
                </div>
              </div>

              {slackNotifications && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Label htmlFor="slackWebhook">Slack Webhook URL</Label>
                    <Input 
                      id="slackWebhook" 
                      name="slackWebhook"
                      type="url"
                      placeholder="https://hooks.slack.com/services/..."
                      autoComplete="url"
                    />
                    <p className="text-sm text-muted-foreground">
                      Get this URL from your Slack app configuration
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}