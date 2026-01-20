import { useState, useEffect } from 'react';
import { Search, UserPlus, Users } from 'lucide-react';
import { Header } from '@/components/Header';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CustomerCard } from '@/components/CustomerCard';
import { AddCustomerForm } from '@/components/AddCustomerForm';
import { useCustomers } from '@/hooks/useCustomers';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useOrders } from '@/hooks/useOrders';
import { CustomerBillingCard } from '@/components/CustomerBillingCard';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export default function Customers() {
  const { isAdmin } = useAuth();
  const { customers, searchCustomers, updateContainerCount } = useCustomers();
  const { orders, settleCustomerBill } = useOrders();
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'local' | 'onetime'>('local');
  const [view, setView] = useState<'list' | 'billing'>('list');
  const { t } = useTranslation();

  // Reset tab if not admin
  useEffect(() => {
    if (!isAdmin && activeTab === 'onetime') {
      setActiveTab('local');
    }
  }, [isAdmin, activeTab]);

  const filteredCustomers = searchCustomers(searchQuery);

  // Filter customers based on tab
  const displayCustomers = filteredCustomers.filter(c => {
    if (activeTab === 'local') return c.is_regular;
    return !c.is_regular;
  });

  // Calculate customers with bills for badge or info (optional)
  const customersWithBills = customers.filter(customer => {
    const unpaid = orders.filter(
      o => o.customer_id === customer.id && !o.is_paid && o.order_type === 'regular'
    );
    return unpaid.length > 0;
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title={t('customers.title')} subtitle={`${customers.length} ${t('customers.registered')}`} />

      <main className="px-4 py-6 max-w-md mx-auto space-y-4">
        {/* Toggle Tabs */}
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
          {isAdmin && (
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
          )}
        </div>

        {/* View Toggle (Only for Local) */}
        {activeTab === 'local' && (
          <div className="flex justify-end mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView(view === 'list' ? 'billing' : 'list')}
              className="text-primary hover:text-primary/80 hover:bg-primary/10"
            >
              {view === 'list' ? t('customers.view_billing') : t('customers.view_all')}
            </Button>
          </div>
        )}

        {/* Search and Add */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder={activeTab === 'local' ? t('customers.search_daily') : t('customers.search_onetime')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12"
            />
          </div>
          {isAdmin && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="water" size="icon">
                  <UserPlus className="w-5 h-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="mx-4 max-w-[calc(100%-2rem)] rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-primary" />
                    {t('customers.add_customer')}
                  </DialogTitle>
                </DialogHeader>
                <AddCustomerForm onSuccess={() => setDialogOpen(false)} forceType={activeTab === 'local' ? 'regular' : 'onetime'} />
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* List Content */}
        {displayCustomers.length === 0 ? (
          <div className="text-center py-12 px-6 bg-card rounded-2xl border-2 border-dashed border-border">
            <Users className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {activeTab === 'local' ? t('customers.no_local_found') : t('customers.no_onetime_found')}
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              {t('customers.add_to_start')}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayCustomers.map((customer, index) => (
              <div key={customer.id} style={{ animationDelay: `${index * 50}ms` }}>
                {view === 'list' || activeTab === 'onetime' ? (
                  <CustomerCard
                    customer={customer}
                    showContainerCount={activeTab === 'onetime'}
                    onReturnContainer={activeTab === 'onetime' ? () => updateContainerCount(customer.id, -1) : undefined}
                  />
                ) : (
                  <CustomerBillingCard
                    customer={customer}
                    orders={orders}
                    onSettle={settleCustomerBill}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
