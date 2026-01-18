import { Droplets, Package, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import { Header } from '@/components/Header';
import { StatCard } from '@/components/StatCard';
import { OrderCard } from '@/components/OrderCard';
import { useOrders } from '@/hooks/useOrders';
import { format } from 'date-fns';

export default function Dashboard() {
  const { getTodaysOrders, todaysSummary, togglePaymentStatus } = useOrders();
  const todaysOrders = getTodaysOrders();

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header 
        title="AquaTrack" 
        subtitle={format(new Date(), 'EEEE, MMMM d')} 
      />
      
      <main className="px-4 py-6 max-w-md mx-auto space-y-6">
        {/* Daily Summary */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Today's Summary
          </h2>
          
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="Total Units"
              value={todaysSummary.totalUnits}
              icon={Droplets}
              variant="primary"
            />
            <StatCard
              label="Deliveries"
              value={todaysSummary.orderCount}
              icon={Package}
              variant="default"
            />
            <StatCard
              label="Paid Units"
              value={todaysSummary.totalPaid}
              icon={CheckCircle2}
              variant="success"
            />
            <StatCard
              label="Pending Units"
              value={todaysSummary.totalPending}
              icon={Clock}
              variant="warning"
            />
          </div>
        </section>

        {/* Recent Deliveries */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Today's Deliveries
          </h2>
          
          {todaysOrders.length === 0 ? (
            <div className="text-center py-12 px-6 bg-card rounded-2xl border-2 border-dashed border-border">
              <Droplets className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No deliveries yet</h3>
              <p className="text-muted-foreground text-sm">
                Start logging your water deliveries for today
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {todaysOrders.slice().reverse().map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onTogglePayment={() => togglePaymentStatus(order.id)}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
