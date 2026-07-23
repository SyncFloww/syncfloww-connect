import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { User, LogOut } from 'lucide-react';
import { useWorkspace } from '@/contexts/WorkspaceContext';

export const Layout = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { workspaces, currentWorkspace, selectWorkspace } = useWorkspace();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (!error) {
      navigate('/auth');
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />

        <main className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="h-14 border-b border-border bg-surface flex items-center justify-between gap-2 px-3 sm:px-6">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <SidebarTrigger />

              <h1 className="text-base sm:text-lg font-semibold text-foreground truncate">
                {location.pathname === '/dashboard' && 'Dashboard'}
                {location.pathname === '/my-projects' && 'My Projects'}
                {location.pathname === '/generate' && 'Workflows'}
                {location.pathname === '/idea-generator' && 'Idea Generator'}
                {location.pathname === '/templates' && 'Templates'}
                {location.pathname === '/ai-tools' && 'AI Tools'}
                {location.pathname === '/settings' && 'Settings'}
                {location.pathname === '/customers' && 'Customers'}
                {location.pathname === '/calendar' && 'Calendar'}
                {location.pathname === '/analytics' && 'Analytics'}
              </h1>
              {currentWorkspace && (
                <select
                  value={currentWorkspace.id}
                  onChange={(event) => {
                    const workspace = workspaces.find((item) => item.id === event.target.value);
                    if (workspace) selectWorkspace(workspace);
                  }}
                  className="hidden rounded-md border bg-background px-2 py-1 text-sm md:block"
                >
                  <option value={currentWorkspace.id}>{currentWorkspace.name}</option>
                  {workspaces
                    .filter((item) => item.id !== currentWorkspace.id)
                    .map((workspace) => (
                      <option key={workspace.id} value={workspace.id}>
                        {workspace.name}
                      </option>
                    ))}
                </select>
              )}
            </div>

            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                <span className="max-w-[10rem] truncate">
                  {user?.full_name?.split(' ')[0] || user?.email?.split('@')[0]}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </header>

          {/* Main Content */}
          <div className="flex-1 min-w-0 p-4 sm:p-6 overflow-x-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};
