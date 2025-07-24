import React from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'

interface ErrorFallbackProps {
  error: Error
  retry: () => void
  title?: string
  description?: string
  showHomeButton?: boolean
}

export function ErrorFallback({ 
  error, 
  retry, 
  title = "Something went wrong",
  description = "An error occurred while loading this content.",
  showHomeButton = false
}: ErrorFallbackProps) {
  return (
    <div className="flex items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {import.meta.env.DEV && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm font-medium text-red-800 mb-1">Error Details:</p>
              <p className="text-xs text-red-700 font-mono break-all">
                {error.message}
              </p>
            </div>
          )}
          <div className="flex gap-2">
            <Button onClick={retry} className="flex-1">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            {showHomeButton && (
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/'}
                className="flex-1"
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Network-specific error fallback
export function NetworkErrorFallback({ error, retry }: { error: Error; retry: () => void }) {
  const isOffline = !navigator.onLine
  
  return (
    <ErrorFallback
      error={error}
      retry={retry}
      title={isOffline ? "You're offline" : "Connection failed"}
      description={
        isOffline 
          ? "Please check your internet connection and try again."
          : "Unable to connect to LinkedAgent servers. Please try again."
      }
    />
  )
}

// API-specific error fallback
export function ApiErrorFallback({ error, retry }: { error: Error; retry: () => void }) {
  const isAuthError = error.message.includes('401') || error.message.includes('Unauthorized')
  
  if (isAuthError) {
    return (
      <ErrorFallback
        error={error}
        retry={() => {
          localStorage.removeItem('linkedagent_token')
          window.location.reload()
        }}
        title="Session expired"
        description="Your session has expired. Please log in again."
        showHomeButton={true}
      />
    )
  }
  
  return (
    <ErrorFallback
      error={error}
      retry={retry}
      title="API Error"
      description="There was a problem communicating with the server."
    />
  )
}