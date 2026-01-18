import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  variant?: 'default' | 'primary' | 'success' | 'warning';
}

export function StatCard({ label, value, icon: Icon, variant = 'default' }: StatCardProps) {
  return (
    <div className={cn(
      "dashboard-stat animate-slide-up",
      variant === 'primary' && "bg-primary/10 border-primary/20",
      variant === 'success' && "bg-success/10 border-success/20",
      variant === 'warning' && "bg-warning/10 border-warning/20"
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{label}</p>
          <p className={cn(
            "text-3xl font-bold mt-1",
            variant === 'default' && "text-foreground",
            variant === 'primary' && "text-primary",
            variant === 'success' && "text-success",
            variant === 'warning' && "text-warning"
          )}>
            {value}
          </p>
        </div>
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center",
          variant === 'default' && "bg-muted",
          variant === 'primary' && "bg-primary/20",
          variant === 'success' && "bg-success/20",
          variant === 'warning' && "bg-warning/20"
        )}>
          <Icon className={cn(
            "w-6 h-6",
            variant === 'default' && "text-muted-foreground",
            variant === 'primary' && "text-primary",
            variant === 'success' && "text-success",
            variant === 'warning' && "text-warning"
          )} />
        </div>
      </div>
    </div>
  );
}
