import { User, Droplets, Clock } from 'lucide-react';
import { Order } from '@/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface OrderCardProps {
  order: Order;
  onTogglePayment?: () => void;
}

export function OrderCard({ order, onTogglePayment }: OrderCardProps) {
  return (
    <div className="p-4 rounded-2xl bg-card border-2 border-border animate-slide-up">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
            <User className="w-6 h-6 text-secondary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">{order.customerName}</h3>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Droplets className="w-4 h-4 text-primary" />
                <span className="font-medium">{order.units} units</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{format(new Date(order.createdAt), 'h:mm a')}</span>
              </div>
            </div>
          </div>
        </div>
        <Button
          variant={order.isPaid ? "success" : "warning"}
          size="sm"
          onClick={onTogglePayment}
          className={cn(
            "text-sm font-semibold min-w-[80px]",
            order.isPaid ? "status-paid" : "status-pending"
          )}
        >
          {order.isPaid ? 'Paid' : 'Pending'}
        </Button>
      </div>
    </div>
  );
}
