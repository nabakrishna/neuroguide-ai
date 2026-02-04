import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Brain,
  LayoutDashboard,
  FolderKanban,
  BookOpen,
  
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { getInitials } from '@/lib/utils';
import { useState } from 'react';

interface SidebarProps {
  className?: string;
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/projects', label: 'Projects', icon: FolderKanban },
  { href: '/research', label: 'Research', icon: BookOpen },
];

export function Sidebar({ className }: SidebarProps) {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'flex flex-col h-screen bg-gradient-sidebar border-r border-border transition-all duration-300',
        collapsed ? 'w-[72px]' : 'w-64',
        className
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-border">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary">
            <Brain className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="font-semibold text-lg gradient-text">NeuroGuide</span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href || 
            (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                'hover:bg-sidebar-accent',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-primary font-medium'
                  : 'text-sidebar-foreground/70'
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="px-3 py-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-center"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 mr-2" />
              <span>Collapse</span>
            </>
          )}
        </Button>
      </div>

      {/* User section */}
      <div className="p-3 border-t border-border">
        <Link
          to="/settings"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
            'hover:bg-sidebar-accent',
            location.pathname.startsWith('/settings')
              ? 'bg-sidebar-accent'
              : ''
          )}
        >
          <Avatar className="w-8 h-8">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback className="text-xs bg-sidebar-accent">
              {getInitials(user?.user_metadata?.full_name || user?.email || 'U')}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.user_metadata?.full_name || 'User'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email}
              </p>
            </div>
          )}
        </Link>

        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'w-full mt-2 text-muted-foreground hover:text-destructive',
            collapsed ? 'px-0' : 'justify-start'
          )}
          onClick={() => signOut()}
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && <span className="ml-2">Sign out</span>}
        </Button>
      </div>
    </aside>
  );
}
