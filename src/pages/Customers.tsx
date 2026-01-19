import { useState } from 'react';
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

export default function Customers() {
  const { isAdmin } = useAuth();
  const { customers, searchCustomers } = useCustomers();
  const { orders, settleCustomerBill } = useOrders();
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [view, setView] = useState<'list' | 'billing'>('list');

  const filteredCustomers = searchCustomers(searchQuery);

  // Filter customers with bills for billing view
  const customersWithBills = customers.filter(customer => {
    const unpaid = orders.filter(
      o => o.customer_id === customer.id && !o.is_paid && o.order_type === 'regular'
    );
    return unpaid.length > 0;
  });

  const displayCustomers = view === 'list' ? filteredCustomers :
    (searchQuery ? searchCustomers(searchQuery).filter(c => customersWithBills.includes(c)) : customersWithBills);

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Customers" subtitle={`${customers.length} registered`} />

      <main className="px-4 py-6 max-w-md mx-auto space-y-4">
        {/* Toggle View */}
        <div className="flex bg-secondary p-1 rounded-xl mb-4">
          <button
            onClick={() => setView('list')}
            className={cn(
              "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all",
              view === 'list'
                ? "bg-white shadow text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            All Customers
          </button>
          <button
            onClick={() => setView('billing')}
            className={cn(
              "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all",
              view === 'billing'
                ? "bg-white shadow text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Billing ({customersWithBills.length})
          </button>
        </div>

        {/* Search and Add */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12"
            />
          </div>
          {isAdmin && view === 'list' && (
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
                    Add New Customer
                  </DialogTitle>
                </DialogHeader>
                <AddCustomerForm onSuccess={() => setDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* List Content */}
        {displayCustomers.length === 0 ? (
          <div className="text-center py-12 px-6 bg-card rounded-2xl border-2 border-dashed border-border">
            <Users className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {view === 'billing' ? 'No pending bills' : (searchQuery ? 'No customers found' : 'No customers yet')}
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              {view === 'billing'
                ? 'All regular customers are settled up!'
                : (searchQuery ? 'Try a different search term' : 'Add your first customer to get started')}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayCustomers.map((customer, index) => (
              <div key={customer.id} style={{ animationDelay: `${index * 50}ms` }}>
                {view === 'list' ? (
                  <CustomerCard customer={customer} />
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
