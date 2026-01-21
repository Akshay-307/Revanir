import { useState } from 'react';
import { ChevronLeft, ChevronRight, ClipboardList } from 'lucide-react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { OrderCard } from '@/components/OrderCard';
import { useOrders } from '@/hooks/useOrders';
import { format, addDays, subDays } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { formatDate } from '@/utils/dateUtils';
import { cn } from '@/lib/utils';

export default function Orders() {
  const { getOrdersByDate, togglePaymentStatus } = useOrders();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'local' | 'onetime'>('local');
  const { t, i18n } = useTranslation();

  const orders = getOrdersByDate(selectedDate.toISOString());
  const isToday = selectedDate.toDateString() === new Date().toDateString();

  const filteredOrders = orders.filter(o => {
    if (activeTab === 'local') return o.customer?.is_regular;
    return !o.customer?.is_regular;
  });

  const goToPreviousDay = () => setSelectedDate(subDays(selectedDate, 1));
  const goToNextDay = () => {
    if (!isToday) {
      setSelectedDate(addDays(selectedDate, 1));
    }
  };

  const totalUnits = orders.reduce((sum, o) => sum + o.units, 0);
  const paidUnits = orders.filter(o => o.is_paid).reduce((sum, o) => sum + o.units, 0);

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title={t('orders.title')} subtitle={t('orders.subtitle')} />

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
              {isToday ? t('orders.today') : formatDate(selectedDate, 'EEEE')}
            </p>
            <p className="text-sm text-muted-foreground">
              {formatDate(selectedDate, 'MMMM d, yyyy')}
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
              <p className="text-xs text-muted-foreground">{t('orders.deliveries')}</p>
            </div>
            <div className="h-10 w-px bg-border" />
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{totalUnits}</p>
              <p className="text-xs text-muted-foreground">{t('orders.total_units')}</p>
            </div>
            <div className="h-10 w-px bg-border" />
            <div className="text-center">
              <p className="text-2xl font-bold text-success">{paidUnits}</p>
              <p className="text-xs text-muted-foreground">{t('orders.paid_units')}</p>
            </div>
          </div>
        )}

        {/* Tabs for Order Type */}
        <div className="flex bg-secondary p-1 rounded-xl mb-4">
          <button
            onClick={() => setActiveTab('local')}
            className={cn(
              "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all",
              activeTab === 'local'
                ? "bg-white shadow text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t('customers.local_daily')}
          </button>
          <button
            onClick={() => setActiveTab('onetime')}
            className={cn(
              "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all",
              activeTab === 'onetime'
                ? "bg-white shadow text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t('customers.onetime')}
          </button>
        </div>

        {/* Order List */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 px-6 bg-card rounded-2xl border-2 border-dashed border-border">
            <ClipboardList className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {orders.length === 0 ? t('orders.no_orders') : (activeTab === 'local' ? t('customers.no_local_found') : t('customers.no_onetime_found'))}
            </h3>
            <p className="text-muted-foreground text-sm">
              {orders.length === 0 ? t('orders.no_orders_date') : ""}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.slice().reverse().map((order) => (
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
