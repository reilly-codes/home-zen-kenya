import { useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  Wallet,
  Wrench,
  BarChart3,
  Settings,
  Home,
  FileText,
  ClipboardList,
  CreditCard,
  LogOut,
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const landlordNavItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Properties', url: '/properties', icon: Building2 },
  { title: 'Tenants', url: '/tenants', icon: Users },
  { title: 'Financials', url: '/financials', icon: Wallet },
  { title: 'Maintenance', url: '/maintenance', icon: Wrench },
  { title: 'Reports', url: '/reports', icon: BarChart3 },
  { title: 'Settings', url: '/settings', icon: Settings },
];

const tenantNavItems = [
  { title: 'My Home', url: '/', icon: Home },
  { title: 'My Invoices', url: '/invoices', icon: FileText },
  { title: 'Requests', url: '/maintenance', icon: ClipboardList },
  { title: 'Payments', url: '/financials', icon: CreditCard },
  { title: 'Settings', url: '/settings', icon: Settings },
];

export function AppSidebar() {
  const { role, setRole } = useUser();
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const navItems = role === 'landlord' ? landlordNavItems : tenantNavItems;

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground font-bold text-lg">
            R
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-semibold text-sidebar-foreground">RentFlow</span>
              <span className="text-xs text-sidebar-foreground/60">Property Manager</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs uppercase tracking-wider mb-2">
            {role === 'landlord' ? 'Management' : 'Tenant Portal'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={cn(
                        "transition-all duration-200",
                        isActive
                          ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                      )}
                    >
                      <Link to={item.url} className="flex items-center gap-3">
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        {!isCollapsed && (
          <div className="space-y-4">
            {/* Role Toggle */}
            <div className="flex items-center justify-between rounded-lg bg-sidebar-accent/50 p-3">
              <Label htmlFor="role-toggle" className="text-xs text-sidebar-foreground/70">
                View as:
              </Label>
              <div className="flex items-center gap-2">
                <span className={cn("text-xs", role === 'landlord' ? 'text-sidebar-primary font-medium' : 'text-sidebar-foreground/50')}>
                  Landlord
                </span>
                <Switch
                  id="role-toggle"
                  checked={role === 'tenant'}
                  onCheckedChange={(checked) => setRole(checked ? 'tenant' : 'landlord')}
                  className="data-[state=checked]:bg-sidebar-primary"
                />
                <span className={cn("text-xs", role === 'tenant' ? 'text-sidebar-primary font-medium' : 'text-sidebar-foreground/50')}>
                  Tenant
                </span>
              </div>
            </div>

            {/* User Info */}
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-sidebar-accent flex items-center justify-center">
                <span className="text-sm font-medium text-sidebar-foreground">
                  {role === 'landlord' ? 'JK' : 'JM'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {role === 'landlord' ? 'Joseph Kariuki' : 'James Mwangi'}
                </p>
                <p className="text-xs text-sidebar-foreground/50 truncate">
                  {role === 'landlord' ? 'Property Owner' : 'Tenant - A101'}
                </p>
              </div>
              <Button variant="ghost" size="icon" className="text-sidebar-foreground/50 hover:text-sidebar-foreground">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
