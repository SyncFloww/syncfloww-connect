import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { User, LogOut } from 'lucide-react';

export const Layout = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (!error) {
      navigate('/auth');
    }
  };

  // Layout now only renders for authenticated users (protected by ProtectedRoute in App.tsx)

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <main className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-14 border-b border-border bg-surface flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-foreground">
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
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                <span>{user?.full_name?.split(' ')[0] || user?.email?.split('@')[0]}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </header>

          {/* Main Content */}
          <div className="flex-1 p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};