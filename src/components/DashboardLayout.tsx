import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard as DashboardIcon, FileText, Target, BarChart2, BookOpen, Settings as SettingsIcon, LogOut } from 'lucide-react';
import { ShinyButton } from '@/components/ui/shiny-button';
import { useAuth } from '@/hooks/useAuth';

const SidebarLink = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => {
  const location = useLocation();
  const active = location.pathname === to;
  return (
    <Link to={to} className={`flex items-center gap-3 px-4 py-2 rounded-md ${active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-white/5 hover:text-white/90'}`}>
      <Icon className="w-4 h-4" />
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
};

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="lg:col-span-1 space-y-6">
          <div className="p-4 bg-white/3 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <DashboardIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="font-semibold text-white">{user?.email || 'Member'}</div>
                <div className="text-xs text-white/60">Member</div>
              </div>
            </div>
          </div>

          <nav className="p-4 bg-white/3 rounded-lg space-y-2">
            <SidebarLink to="/dashboard" icon={DashboardIcon} label="Overview" />
            <SidebarLink to="/dashboard/business-tools" icon={FileText} label="Business Plan" />
            <SidebarLink to="/dashboard/funding" icon={Target} label="Funding" />
            <SidebarLink to="/dashboard/analytics" icon={BarChart2} label="Impact" />
            <SidebarLink to="/dashboard/learning" icon={BookOpen} label="My Learning" />
            <SidebarLink to="/dashboard/settings" icon={SettingsIcon} label="Settings" />
          </nav>

          <div className="p-4 bg-white/3 rounded-lg">
            <ShinyButton size="sm" className="w-full" onClick={() => signOut()}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </ShinyButton>
          </div>
        </aside>

        <div className="lg:col-span-3">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
