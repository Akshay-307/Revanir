import { useState } from 'react';
import { Search, Droplets, Check, Minus, Plus } from 'lucide-react';
import { Header } from '@/components/Header';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CustomerCard } from '@/components/CustomerCard';
import { useCustomers } from '@/hooks/useCustomers';
import { useOrders } from '@/hooks/useOrders';
import { Customer } from '@/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function NewOrder() {
  const { customers, searchCustomers } = useCustomers();
  const { addOrder } = useOrders();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [units, setUnits] = useState(1);
  const [isPaid, setIsPaid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredCustomers = searchCustomers(searchQuery);

  const handleSubmit = async () => {
    if (!selectedCustomer) {
      toast.error('Please select a customer');
      return;
    }

    if (units < 1) {
      toast.error('Units must be at least 1');
      return;
    }

    setIsSubmitting(true);

    try {
      addOrder({
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        units,
        isPaid,
        date: new Date().toISOString(),
      });

      toast.success(`Order logged for ${selectedCustomer.name}!`);
      
      // Reset form
      setSelectedCustomer(null);
      setSearchQuery('');
      setUnits(1);
      setIsPaid(false);
    } catch (error) {
      toast.error('Failed to log order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="New Delivery" subtitle="Log a water delivery" />

      <main className="px-4 py-6 max-w-md mx-auto space-y-6">
        {/* Customer Selection */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Select Customer
          </h2>

          {selectedCustomer ? (
            <div className="space-y-3">
              <CustomerCard customer={selectedCustomer} selected />
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setSelectedCustomer(null)}
              >
                Change Customer
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search customers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12"
                />
              </div>

              <div className="max-h-64 overflow-y-auto space-y-2 rounded-xl">
                {filteredCustomers.slice(0, 5).map((customer) => (
                  <CustomerCard
                    key={customer.id}
                    customer={customer}
                    onClick={() => {
                      setSelectedCustomer(customer);
                      setSearchQuery('');
                    }}
                  />
                ))}
                {customers.length === 0 && (
                  <p className="text-center py-8 text-muted-foreground text-sm">
                    No customers yet. Add one from the Customers tab.
                  </p>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Units Counter */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Water Units
          </h2>
          <div className="flex items-center justify-center gap-4 p-6 bg-card rounded-2xl border-2 border-border">
            <Button
              variant="outline"
              size="icon"
              className="h-14 w-14 rounded-xl"
              onClick={() => setUnits(Math.max(1, units - 1))}
              disabled={units <= 1}
            >
              <Minus className="w-6 h-6" />
            </Button>
            <div className="text-center min-w-[100px]">
              <div className="flex items-center justify-center gap-2">
                <Droplets className="w-8 h-8 text-primary" />
                <span className="text-5xl font-bold text-foreground">{units}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {units === 1 ? 'unit' : 'units'}
              </p>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-14 w-14 rounded-xl"
              onClick={() => setUnits(units + 1)}
            >
              <Plus className="w-6 h-6" />
            </Button>
          </div>
        </section>

        {/* Payment Status */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Payment Status
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setIsPaid(false)}
              className={cn(
                "p-4 rounded-2xl border-2 transition-all duration-200 flex items-center justify-center gap-2 font-semibold",
                !isPaid
                  ? "border-warning bg-warning/10 text-warning"
                  : "border-border bg-card text-muted-foreground hover:border-warning/50"
              )}
            >
              {!isPaid && <Check className="w-5 h-5" />}
              Pending
            </button>
            <button
              onClick={() => setIsPaid(true)}
              className={cn(
                "p-4 rounded-2xl border-2 transition-all duration-200 flex items-center justify-center gap-2 font-semibold",
                isPaid
                  ? "border-success bg-success/10 text-success"
                  : "border-border bg-card text-muted-foreground hover:border-success/50"
              )}
            >
              {isPaid && <Check className="w-5 h-5" />}
              Paid
            </button>
          </div>
        </section>

        {/* Submit Button */}
        <Button
          variant="water"
          size="lg"
          className="w-full"
          onClick={handleSubmit}
          disabled={!selectedCustomer || isSubmitting}
        >
          <Check className="w-5 h-5" />
          {isSubmitting ? 'Logging...' : 'Log Delivery'}
        </Button>
      </main>
    </div>
  );
}
