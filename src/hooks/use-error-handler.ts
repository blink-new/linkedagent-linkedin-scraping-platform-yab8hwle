import { useCallback } from 'react'
import { useToast } from './use-toast'

export interface ErrorHandlerOptions {
  showToast?: boolean
  logError?: boolean
  fallbackMessage?: string
}

export function useErrorHandler() {
  const { toast } = useToast()

  const handleError = useCallback((
    error: Error | unknown,
    options: ErrorHandlerOptions = {}
  ) => {
    const {
      showToast = true,
      logError = true,
      fallbackMessage = 'An unexpected error occurred'
    } = options

    // Extract error message
    let message = fallbackMessage
    if (error instanceof Error) {
      message = error.message
    } else if (typeof error === 'string') {
      message = error
    }

    // Log error for debugging
    if (logError) {
      console.error('Error handled:', error)
    }

    // Show toast notification
    if (showToast) {
      // Determine toast variant based on error type
      let variant: 'default' | 'destructive' = 'destructive'
      let title = 'Error'

      if (message.includes('network') || message.includes('fetch')) {
        title = 'Connection Error'
        message = 'Please check your internet connection and try again.'
      } else if (message.includes('401') || message.includes('unauthorized')) {
        title = 'Authentication Error'
        message = 'Your session has expired. Please log in again.'
        variant = 'destructive'
      } else if (message.includes('403') || message.includes('forbidden')) {
        title = 'Access Denied'
        message = 'You do not have permission to perform this action.'
      } else if (message.includes('404') || message.includes('not found')) {
        title = 'Not Found'
        message = 'The requested resource was not found.'
      } else if (message.includes('429') || message.includes('rate limit')) {
        title = 'Rate Limited'
        message = 'Too many requests. Please wait a moment and try again.'
      } else if (message.includes('500') || message.includes('server error')) {
        title = 'Server Error'
        message = 'A server error occurred. Please try again later.'
      }

      toast({
        title,
        description: message,
        variant,
      })
    }

    // Report to monitoring service in production
    if (import.meta.env.PROD && error instanceof Error) {
      // window.Sentry?.captureException(error)
    }

    return message
  }, [toast])

  const handleAsyncError = useCallback(async (
    asyncFn: () => Promise<any>,
    options: ErrorHandlerOptions = {}
  ) => {
    try {
      return await asyncFn()
    } catch (error) {
      handleError(error, options)
      throw error // Re-throw so calling code can handle it
    }
  }, [handleError])

  return {
    handleError,
    handleAsyncError,
  }
}