import { 
  LayoutDashboard, 
  FolderOpen, 
  FileText, 
  Bot, 
  Settings, 
  ChevronRight,
  Workflow,
  Users,
  Calendar,
  BarChart3
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import logoBlue from '@/assets/logo-blue.png';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

const mainNavigation = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Workflows', url: '/generate', icon: Workflow },
  { title: 'My Projects', url: '/my-projects', icon: FolderOpen },
  { title: 'Customers', url: '/customers', icon: Users },
  { title: 'Calendar', url: '/calendar', icon: Calendar },
];

const toolsNavigation = [
  { title: 'Templates', url: '/templates', icon: FileText },
  { title: 'AI Tools', url: '/ai-tools', icon: Bot },
  { title: 'Analytics', url: '/analytics', icon: BarChart3 },
];

const adminNavigation = [
  { title: 'Settings', url: '/settings', icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const isCollapsed = state === 'collapsed';

  const isActive = (path: string) => location.pathname === path;

  const renderNavItems = (items: typeof mainNavigation) => (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton
            asChild
            className={`
              w-full justify-start gap-3 h-11 px-3 rounded-lg transition-all duration-200
              ${isActive(item.url) 
                ? 'bg-primary text-primary-foreground shadow-sm' 
                : 'hover:bg-accent hover:text-accent-foreground'
              }
            `}
          >
            <NavLink to={item.url} className="flex items-center gap-3 w-full">
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && (
                <>
                  <span className="flex-1 text-sm font-medium">{item.title}</span>
                  {isActive(item.url) && (
                    <ChevronRight className="w-4 h-4 opacity-60" />
                  )}
                </>
              )}
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );

  return (
    <Sidebar className="border-r border-border bg-surface">
      <SidebarContent>
        {/* Logo/Brand Section */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <img src={logoBlue} alt="SyncFloww" className="w-8 h-8" />
            {!isCollapsed && (
              <div>
                <h2 className="text-lg font-bold text-foreground">SyncFloww</h2>
                <p className="text-xs text-muted-foreground">Marketing Suite</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          {!isCollapsed && <SidebarGroupLabel className="text-xs text-muted-foreground uppercase tracking-wider">Main</SidebarGroupLabel>}
          <SidebarGroupContent>
            {renderNavItems(mainNavigation)}
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Tools */}
        <SidebarGroup>
          {!isCollapsed && <SidebarGroupLabel className="text-xs text-muted-foreground uppercase tracking-wider">Tools</SidebarGroupLabel>}
          <SidebarGroupContent>
            {renderNavItems(toolsNavigation)}
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin */}
        <SidebarGroup className="mt-auto">
          {!isCollapsed && <SidebarGroupLabel className="text-xs text-muted-foreground uppercase tracking-wider">Admin</SidebarGroupLabel>}
          <SidebarGroupContent>
            {renderNavItems(adminNavigation)}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
