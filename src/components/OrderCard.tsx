import { User, Droplets, Clock, Package, Banknote } from 'lucide-react';
import { Order } from '@/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

interface OrderCardProps {
  order: Order;
  onTogglePayment?: () => void;
}

export function OrderCard({ order, onTogglePayment }: OrderCardProps) {
  const { isAdmin } = useAuth();
  const customerName = order.customer?.name || 'Unknown Customer';
  const isBulk = order.order_type === 'bulk';
  const canEdit = !isBulk || isAdmin;

  return (
    <div className={cn(
      "p-4 rounded-2xl border-2 animate-slide-up",
      isBulk ? "bg-purple-50 border-purple-200" : "bg-card border-border"
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0",
            isBulk ? "bg-purple-100" : "bg-secondary"
          )}>
            {isBulk ?
              <Package className="w-6 h-6 text-purple-600" /> :
              <User className="w-6 h-6 text-secondary-foreground" />
            }
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate flex items-center gap-2">
              {customerName}
              {isBulk && <span className="text-xs bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full">Bulk</span>}
            </h3>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Droplets className="w-4 h-4 text-primary" />
                <span className="font-medium">
                  {order.units} {order.product_type === 'jug' ? 'Jugs' : 'Bottles'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Banknote className="w-4 h-4 text-green-600" />
                <span>₹{order.price * order.units}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{format(new Date(order.delivered_at), 'h:mm a')}</span>
              </div>
            </div>
          </div>
        </div>
        <Button
          variant={order.is_paid ? "success" : "warning"}
          size="sm"
          onClick={onTogglePayment}
          disabled={!canEdit}
          className={cn(
            "text-sm font-semibold min-w-[80px]",
            order.is_paid ? "status-paid" : "status-pending",
            !canEdit && "opacity-50 cursor-not-allowed"
          )}
        >
          {order.is_paid ? 'Paid' : 'Pending'}
        </Button>
      </div>
    </div>
  );
}
