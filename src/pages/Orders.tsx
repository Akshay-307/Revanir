import { useState } from 'react';
import { ChevronLeft, ChevronRight, ClipboardList } from 'lucide-react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { OrderCard } from '@/components/OrderCard';
import { useOrders } from '@/hooks/useOrders';
import { format, addDays, subDays } from 'date-fns';

export default function Orders() {
  const { getOrdersByDate, togglePaymentStatus } = useOrders();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const orders = getOrdersByDate(selectedDate.toISOString());
  const isToday = selectedDate.toDateString() === new Date().toDateString();

  const goToPreviousDay = () => setSelectedDate(subDays(selectedDate, 1));
  const goToNextDay = () => {
    if (!isToday) {
      setSelectedDate(addDays(selectedDate, 1));
    }
  };

  const totalUnits = orders.reduce((sum, o) => sum + o.units, 0);
  const paidUnits = orders.filter(o => o.isPaid).reduce((sum, o) => sum + o.units, 0);

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Order History" subtitle="View past deliveries" />

      <main className="px-4 py-6 max-w-md mx-auto space-y-6">
        {/* Date Navigation */}
        <div className="flex items-center justify-between bg-card rounded-2xl border-2 border-border p-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPreviousDay}
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <div className="text-center">
            <p className="font-semibold text-foreground">
              {isToday ? 'Today' : format(selectedDate, 'EEEE')}
            </p>
            <p className="text-sm text-muted-foreground">
              {format(selectedDate, 'MMMM d, yyyy')}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNextDay}
            disabled={isToday}
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>

        {/* Summary Bar */}
        {orders.length > 0 && (
          <div className="flex justify-between items-center p-4 bg-secondary rounded-2xl">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{orders.length}</p>
              <p className="text-xs text-muted-foreground">Deliveries</p>
            </div>
            <div className="h-10 w-px bg-border" />
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{totalUnits}</p>
              <p className="text-xs text-muted-foreground">Total Units</p>
            </div>
            <div className="h-10 w-px bg-border" />
            <div className="text-center">
              <p className="text-2xl font-bold text-success">{paidUnits}</p>
              <p className="text-xs text-muted-foreground">Paid Units</p>
            </div>
          </div>
        )}

        {/* Order List */}
        {orders.length === 0 ? (
          <div className="text-center py-12 px-6 bg-card rounded-2xl border-2 border-dashed border-border">
            <ClipboardList className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No orders</h3>
            <p className="text-muted-foreground text-sm">
              No deliveries recorded for this date
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.slice().reverse().map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onTogglePayment={() => togglePaymentStatus(order.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
