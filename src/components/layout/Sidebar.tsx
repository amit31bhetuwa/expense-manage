
import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  ArrowUpDown,
  CreditCard,
  PieChart,
  Settings,
  LogOut,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';

export function Sidebar() {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const sidebarItems = [
    {
      name: 'Dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      path: '/dashboard',
    },
    {
      name: 'Transactions',
      icon: <ArrowUpDown className="h-5 w-5" />,
      path: '/transactions',
    },
    {
      name: 'Budget',
      icon: <CreditCard className="h-5 w-5" />,
      path: '/budget',
    },
    {
      name: 'Reports',
      icon: <PieChart className="h-5 w-5" />,
      path: '/reports',
    },
    {
      name: 'Settings',
      icon: <Settings className="h-5 w-5" />,
      path: '/settings',
    },
  ];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-10 flex h-screen w-64 flex-col border-r bg-background">
      <div className="flex items-center justify-between border-b p-4">
        <Link to="/" className="flex items-center gap-2">
          <CreditCard className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">PocketWise</span>
        </Link>
      </div>

      <div className="space-y-4 p-4">
        {user && (
          <div className="flex items-center gap-3 mb-6">
            <Avatar>
              <AvatarImage src={user.avatarUrl} />
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium">{user.name}</span>
              <span className="text-xs text-muted-foreground">{user.email}</span>
            </div>
          </div>
        )}

        <nav className="space-y-1">
          {sidebarItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 transition-colors',
                location.pathname === item.path
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-secondary'
              )}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-auto border-t p-4 flex items-center justify-between">
        <ThemeToggle />
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={signOut}
          aria-label="Log out"
        >
          <LogOut className="h-5 w-5" />
          <span className="sr-only">Log out</span>
        </Button>
      </div>
    </aside>
  );
}
