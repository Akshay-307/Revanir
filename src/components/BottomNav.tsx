import { Home, Users, Plus, ClipboardList, Shield } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const baseNavItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/customers', icon: Users, label: 'Customers' },
    { path: '/new-order', icon: Plus, label: 'New Order' },
    { path: '/orders', icon: ClipboardList, label: 'Orders' },
  ];

  const navItems = isAdmin
    ? [...baseNavItems, { path: '/admin', icon: Shield, label: 'Admin' }]
    : baseNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-area-inset z-50">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 min-w-[64px]",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Icon className={cn("w-6 h-6", isActive && "stroke-[2.5]")} />
              <span className="text-xs font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
