import { useState, useEffect } from 'react';
import { Search, Droplets, Check, Minus, Plus, Package, Banknote } from 'lucide-react';
import { Header } from '@/components/Header';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CustomerCard } from '@/components/CustomerCard';
import { useCustomers } from '@/hooks/useCustomers';
import { useOrders } from '@/hooks/useOrders';
import { useAuth } from '@/contexts/AuthContext';
import { Customer } from '@/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export default function NewOrder() {
  const { customers, searchCustomers } = useCustomers();
  const { addOrder } = useOrders();
  const { isAdmin } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [units, setUnits] = useState(1);
  const [isPaid, setIsPaid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New State variables
  const [productType, setProductType] = useState<'bottle' | 'jug'>('bottle');
  const [orderType, setOrderType] = useState<'regular' | 'bulk'>('regular');

  const filteredCustomers = searchCustomers(searchQuery);

  // Price calculation
  const unitPrice = productType === 'bottle' ? 20 : 30;
  const totalPrice = unitPrice * units;

  // Reset order type if not admin
  useEffect(() => {
    if (!isAdmin) {
      setOrderType('regular');
    }
  }, [isAdmin]);

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
      await addOrder({
        customer_id: selectedCustomer.id,
        units,
        is_paid: isPaid,
        product_type: productType,
        order_type: orderType,
        price: unitPrice,
      });

      toast.success(`Order logged for ${selectedCustomer.name}!`);

      // Reset form
      setSelectedCustomer(null);
      setSearchQuery('');
      setUnits(1);
      setIsPaid(false);
      setProductType('bottle');
      setOrderType('regular');
    } catch (error) {
      console.error(error);
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

        {/* Product Type & Order Type Selection */}
        <div className="grid grid-cols-1 gap-6">
          {/* Product Type */}
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Product Type
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setProductType('bottle')}
                className={cn(
                  "p-4 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center justify-center gap-2",
                  productType === 'bottle'
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground hover:border-primary/50"
                )}
              >
                <Droplets className="w-8 h-8" />
                <div className="text-center">
                  <span className="block font-semibold">Bottle</span>
                  <span className="text-xs opacity-75">₹20 / unit</span>
                </div>
              </button>
              <button
                onClick={() => setProductType('jug')}
                className={cn(
                  "p-4 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center justify-center gap-2",
                  productType === 'jug'
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground hover:border-primary/50"
                )}
              >
                <Package className="w-8 h-8" />
                <div className="text-center">
                  <span className="block font-semibold">Jug (Cold)</span>
                  <span className="text-xs opacity-75">₹30 / unit</span>
                </div>
              </button>
            </div>
          </section>

          {/* Order Type - Admin Only */}
          {isAdmin && (
            <section>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Order Type
              </h2>
              <div className="flex bg-secondary p-1 rounded-xl">
                <button
                  onClick={() => setOrderType('regular')}
                  className={cn(
                    "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all",
                    orderType === 'regular'
                      ? "bg-white shadow text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Regular
                </button>
                <button
                  onClick={() => setOrderType('bulk')}
                  className={cn(
                    "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all",
                    orderType === 'bulk'
                      ? "bg-purple-100 text-purple-700 shadow"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Bulk / Event
                </button>
              </div>
            </section>
          )}
        </div>

        {/* Units Counter and Total */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Quantity & Price
            </h2>
            <div className="flex items-center gap-1 text-primary font-bold">
              <Banknote className="w-4 h-4" />
              <span>Total: ₹{totalPrice}</span>
            </div>
          </div>

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
                <span className="text-5xl font-bold text-foreground">{units}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {productType === 'bottle' ? (units === 1 ? 'Bottle' : 'Bottles') : (units === 1 ? 'Jug' : 'Jugs')}
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
          {orderType === 'regular' && (
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Regular customers are usually billed monthly.
            </p>
          )}
        </section>

        {/* Submit Button */}
        <Button
          variant={orderType === 'bulk' ? 'default' : 'water'} // Use default (which might be black/primary) or a specific color for bulk? Let's use 'water' for regular and maybe style bulk differently if needed, but 'water' is consistent. Actually showing different flavor.
          className={cn("w-full h-12 text-lg", orderType === 'bulk' && "bg-purple-600 hover:bg-purple-700")}
          onClick={handleSubmit}
          disabled={!selectedCustomer || isSubmitting}
        >
          {isSubmitting ? (
            'Logging...'
          ) : (
            <>
              <Check className="w-5 h-5 mr-2" />
              Log {orderType === 'bulk' ? 'Bulk Order' : 'Delivery'}
            </>
          )}
        </Button>
      </main>
    </div>
  );
}
