import { 
  BarChart3, 
  Briefcase, 
  Home, 
  Settings,
  ChevronRight,
  Users,
  Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { 
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter
} from '@/components/ui/sidebar'
import { Page } from '@/App'

interface AppSidebarProps {
  currentPage: Page
  onPageChange: (page: Page) => void
}

const navigation = [
  {
    id: 'dashboard' as Page,
    name: 'Dashboard',
    icon: Home,
    description: 'Overview & recent activity'
  },
  {
    id: 'jobs' as Page,
    name: 'Job Management',
    icon: Briefcase,
    description: 'Create & monitor scraping jobs'
  },
  {
    id: 'analytics' as Page,
    name: 'Analytics',
    icon: BarChart3,
    description: 'Performance & usage metrics'
  }
]

export function AppSidebar({ currentPage, onPageChange }: AppSidebarProps) {
  return (
    <Sidebar className="border-r bg-card">
      <SidebarHeader className="border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <h1 className="font-semibold text-lg">LinkedAgent</h1>
            <p className="text-xs text-muted-foreground">Scraping Platform</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4 py-4">
        <SidebarMenu>
          {navigation.map((item) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton
                onClick={() => onPageChange(item.id)}
                className={cn(
                  "w-full justify-start gap-3 px-3 py-2.5 text-left transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  currentPage === item.id && "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
              >
                <item.icon className="h-4 w-4" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {item.description}
                  </div>
                </div>
                {currentPage === item.id && (
                  <ChevronRight className="h-4 w-4" />
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t px-4 py-4">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-secondary/50">
          <Users className="h-4 w-4 text-muted-foreground" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium">Multi-tenant</div>
            <div className="text-xs text-muted-foreground">Enterprise ready</div>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange('settings')}
          className={cn(
            "w-full justify-start gap-3 mt-2",
            currentPage === 'settings' && "bg-accent"
          )}
        >
          <Settings className="h-4 w-4" />
          Settings
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}