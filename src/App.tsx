import { useState } from 'react'
import { Toaster } from '@/components/ui/toaster'
import { ThemeProvider } from '@/components/theme-provider'
import { ErrorBoundary } from '@/components/error-boundary'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { AppHeader } from '@/components/layout/app-header'
import { Dashboard } from '@/components/pages/dashboard'
import { JobManagement } from '@/components/pages/job-management'
import { Analytics } from '@/components/pages/analytics'
import { Settings } from '@/components/pages/settings'
import { LoginForm } from '@/components/auth/login-form'
import { SidebarProvider } from '@/components/ui/sidebar'
import { useAuth } from '@/hooks/use-api'
import { NetworkStatus, PageLoadingSkeleton } from '@/components/ui/loading-states'
import { ApiErrorFallback } from '@/components/error-fallback'

export type Page = 'dashboard' | 'jobs' | 'analytics' | 'settings'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard')
  const [currentTenant, setCurrentTenant] = useState('Acme Corp')
  const { isAuthenticated } = useAuth()

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />
      case 'jobs':
        return <JobManagement />
      case 'analytics':
        return <Analytics />
      case 'settings':
        return <Settings />
      default:
        return <Dashboard />
    }
  }

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" storageKey="linkedagent-theme">
        {!isAuthenticated ? (
          <ErrorBoundary>
            <LoginForm />
          </ErrorBoundary>
        ) : (
          <SidebarProvider>
            <div className="min-h-screen bg-background flex w-full">
              <AppSidebar 
                currentPage={currentPage} 
                onPageChange={setCurrentPage} 
              />
              
              <div className="flex-1 flex flex-col">
                <AppHeader 
                  currentTenant={currentTenant}
                  onTenantChange={setCurrentTenant}
                />
                
                <main className="flex-1 p-6 overflow-auto">
                  <ErrorBoundary>
                    {renderPage()}
                  </ErrorBoundary>
                </main>
              </div>
            </div>
            
            <Toaster />
          </SidebarProvider>
        )}
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App