import { 
  Bell, 
  ChevronDown, 
  Moon, 
  Sun, 
  Building2,
  LogOut,
  User,
  Settings
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { useTheme } from '@/hooks/use-theme'
import { SidebarTrigger } from '@/components/ui/sidebar'

interface AppHeaderProps {
  currentTenant: string
  onTenantChange: (tenant: string) => void
}

const tenants = [
  { id: 'acme', name: 'Acme Corp', plan: 'Enterprise' },
  { id: 'globex', name: 'Globex Inc', plan: 'Pro' },
  { id: 'initech', name: 'Initech LLC', plan: 'Starter' }
]

export function AppHeader({ currentTenant, onTenantChange }: AppHeaderProps) {
  const { theme, setTheme } = useTheme()

  const currentTenantData = tenants.find(t => t.name === currentTenant) || tenants[0]

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        
        {/* Tenant Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Building2 className="h-4 w-4" />
              <span className="font-medium">{currentTenant}</span>
              <Badge variant="secondary" className="text-xs">
                {currentTenantData.plan}
              </Badge>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            <DropdownMenuLabel>Switch Organization</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {tenants.map((tenant) => (
              <DropdownMenuItem
                key={tenant.id}
                onClick={() => onTenantChange(tenant.name)}
                className="flex items-center justify-between"
              >
                <div>
                  <div className="font-medium">{tenant.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {tenant.plan} Plan
                  </div>
                </div>
                {tenant.name === currentTenant && (
                  <Badge variant="default" className="text-xs">Current</Badge>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
          >
            3
          </Badge>
        </Button>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2">
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                JD
              </div>
              <div className="text-left">
                <div className="text-sm font-medium">John Doe</div>
                <div className="text-xs text-muted-foreground">Admin</div>
              </div>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}