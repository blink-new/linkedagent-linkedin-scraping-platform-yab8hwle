import { useState, useCallback } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'
import { Separator } from '../ui/separator'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'
import { useCreateJob, useFileUpload } from '../../hooks/use-api'
import type { JobCreateRequest } from '../../types/api'
import { 
  Upload, 
  FileSpreadsheet, 
  Settings, 
  Eye, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  X,
  Loader2
} from 'lucide-react'

interface CreateJobWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onJobCreated?: () => void
}

type WizardStep = 'upload' | 'configure' | 'preview'

interface JobConfig {
  concurrency: number
  retries: number
  timeout: number
  proxyProfileId?: string
}

// Mock preview data - in real app this would come from file analysis
const mockPreviewData = [
  { url: 'https://linkedin.com/in/john-doe', status: 'valid' },
  { url: 'https://linkedin.com/in/jane-smith', status: 'valid' },
  { url: 'https://linkedin.com/in/bob-wilson', status: 'valid' },
  { url: 'https://linkedin.com/company/acme-corp', status: 'invalid' },
  { url: 'https://linkedin.com/in/alice-johnson', status: 'valid' },
]

export function CreateJobWizard({ open, onOpenChange, onJobCreated }: CreateJobWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('upload')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadedFileId, setUploadedFileId] = useState<string | null>(null)
  const [jobConfig, setJobConfig] = useState<JobConfig>({
    concurrency: 3,
    retries: 2,
    timeout: 120
  })

  const { uploadFile, isLoading: uploadLoading, error: uploadError } = useFileUpload()
  const { createJob, isLoading: createLoading, error: createError } = useCreateJob()

  const handleClose = () => {
    setCurrentStep('upload')
    setSelectedFile(null)
    setUploadedFileId(null)
    setJobConfig({
      concurrency: 3,
      retries: 2,
      timeout: 120
    })
    onOpenChange(false)
  }

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.includes('spreadsheet') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      setSelectedFile(file)
    }
  }, [])

  const handleFileDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file && (file.type.includes('spreadsheet') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      setSelectedFile(file)
    }
  }, [])

  const handleUpload = async () => {
    if (!selectedFile) return

    const fileId = await uploadFile(selectedFile)
    if (fileId) {
      setUploadedFileId(fileId)
      setCurrentStep('configure')
    }
  }

  const handleCreateJob = async () => {
    if (!uploadedFileId) return

    const jobRequest: JobCreateRequest = {
      fileId: uploadedFileId,
      concurrency: jobConfig.concurrency,
      retries: jobConfig.retries,
      timeout: jobConfig.timeout,
      proxyProfileId: jobConfig.proxyProfileId || null
    }

    const job = await createJob(jobRequest)
    if (job) {
      onJobCreated?.()
      handleClose()
    }
  }

  const renderUploadStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Upload Excel File</h3>
        <p className="text-muted-foreground">
          Upload an Excel file containing LinkedIn profile URLs to process
        </p>
      </div>

      <div
        className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer"
        onDrop={handleFileDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => document.getElementById('file-upload')?.click()}
      >
        <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <div className="space-y-2">
          <p className="text-lg font-medium">
            {selectedFile ? selectedFile.name : 'Drop your Excel file here'}
          </p>
          <p className="text-sm text-muted-foreground">
            or click to browse files
          </p>
          <p className="text-xs text-muted-foreground">
            Supports .xlsx and .xls files up to 10MB
          </p>
        </div>
        <input
          id="file-upload"
          name="file-upload"
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileSelect}
          className="hidden"
          aria-label="Upload Excel file containing LinkedIn URLs"
        />
      </div>

      {selectedFile && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="h-8 w-8 text-green-600" />
              <div className="flex-1">
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <Badge variant="outline">Ready</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {uploadError && (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle className="h-4 w-4" />
          {uploadError}
        </div>
      )}

      <div className="flex justify-end">
        <Button 
          onClick={handleUpload}
          disabled={!selectedFile || uploadLoading}
          className="gap-2"
        >
          {uploadLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          Upload & Continue
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )

  const renderConfigureStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Configure Job Parameters</h3>
        <p className="text-muted-foreground">
          Set processing parameters and proxy configuration
        </p>
      </div>

      <div className="grid gap-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="concurrency">Concurrency</Label>
            <Select 
              value={jobConfig.concurrency.toString()} 
              onValueChange={(value) => setJobConfig(prev => ({ ...prev, concurrency: parseInt(value) }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} {num === 1 ? 'thread' : 'threads'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Number of parallel processing threads
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="retries">Max Retries</Label>
            <Select 
              value={jobConfig.retries.toString()} 
              onValueChange={(value) => setJobConfig(prev => ({ ...prev, retries: parseInt(value) }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 6 }, (_, i) => i).map(num => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} {num === 1 ? 'retry' : 'retries'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Retry failed requests automatically
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="timeout">Request Timeout (seconds)</Label>
          <Select 
            value={jobConfig.timeout.toString()} 
            onValueChange={(value) => setJobConfig(prev => ({ ...prev, timeout: parseInt(value) }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 seconds</SelectItem>
              <SelectItem value="60">60 seconds</SelectItem>
              <SelectItem value="120">120 seconds</SelectItem>
              <SelectItem value="180">180 seconds</SelectItem>
              <SelectItem value="300">300 seconds</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Maximum time to wait for each profile request
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="proxy">Proxy Profile (Optional)</Label>
          <Select 
            value={jobConfig.proxyProfileId || 'none'} 
            onValueChange={(value) => setJobConfig(prev => ({ ...prev, proxyProfileId: value === 'none' ? undefined : value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select proxy profile" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No proxy</SelectItem>
              <SelectItem value="proxy-1">US Residential Pool</SelectItem>
              <SelectItem value="proxy-2">EU Datacenter Pool</SelectItem>
              <SelectItem value="proxy-3">Global Mobile Pool</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Use proxy rotation to avoid rate limiting
          </p>
        </div>
      </div>

      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => setCurrentStep('upload')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button 
          onClick={() => setCurrentStep('preview')}
          className="gap-2"
        >
          Preview & Launch
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )

  const renderPreviewStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Review & Launch Job</h3>
        <p className="text-muted-foreground">
          Review your configuration and preview the URLs to be processed
        </p>
      </div>

      {/* Configuration Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Job Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Concurrency:</span>
              <span className="ml-2 font-medium">{jobConfig.concurrency} threads</span>
            </div>
            <div>
              <span className="text-muted-foreground">Max Retries:</span>
              <span className="ml-2 font-medium">{jobConfig.retries}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Timeout:</span>
              <span className="ml-2 font-medium">{jobConfig.timeout}s</span>
            </div>
            <div>
              <span className="text-muted-foreground">Proxy:</span>
              <span className="ml-2 font-medium">
                {jobConfig.proxyProfileId ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* URL Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">URL Preview</CardTitle>
          <CardDescription>
            First 5 URLs from your uploaded file
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>LinkedIn URL</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockPreviewData.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-mono text-sm">
                    {item.url}
                  </TableCell>
                  <TableCell>
                    {item.status === 'valid' ? (
                      <Badge variant="outline" className="gap-1">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        Valid
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Invalid
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <p className="text-xs text-muted-foreground mt-2">
            4 valid URLs found, 1 invalid URL will be skipped
          </p>
        </CardContent>
      </Card>

      {createError && (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle className="h-4 w-4" />
          {createError}
        </div>
      )}

      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => setCurrentStep('configure')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button 
          onClick={handleCreateJob}
          disabled={createLoading}
          className="gap-2"
        >
          {createLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          Launch Job
        </Button>
      </div>
    </div>
  )

  const steps = [
    { id: 'upload', title: 'Upload', icon: Upload },
    { id: 'configure', title: 'Configure', icon: Settings },
    { id: 'preview', title: 'Preview', icon: Eye }
  ]

  const currentStepIndex = steps.findIndex(step => step.id === currentStep)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Create New Scraping Job</DialogTitle>
              <DialogDescription>
                Process LinkedIn profiles in 3 simple steps
              </DialogDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => {
            const isActive = step.id === currentStep
            const isCompleted = index < currentStepIndex
            const StepIcon = step.icon

            return (
              <div key={step.id} className="flex items-center">
                <div className={`
                  flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors
                  ${isActive ? 'border-primary bg-primary text-primary-foreground' : 
                    isCompleted ? 'border-green-500 bg-green-500 text-white' : 
                    'border-muted-foreground/25 text-muted-foreground'}
                `}>
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <StepIcon className="h-5 w-5" />
                  )}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-px mx-4 ${isCompleted ? 'bg-green-500' : 'bg-muted-foreground/25'}`} />
                )}
              </div>
            )
          })}
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {currentStep === 'upload' && renderUploadStep()}
          {currentStep === 'configure' && renderConfigureStep()}
          {currentStep === 'preview' && renderPreviewStep()}
        </div>
      </DialogContent>
    </Dialog>
  )
}