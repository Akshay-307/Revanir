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
import { useTranslation } from 'react-i18next';

export default function NewOrder() {
  const { customers, searchCustomers, updateContainerCount } = useCustomers();
  const { addOrder } = useOrders();
  const { isAdmin } = useAuth();
  const { t } = useTranslation();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  // Change to string | number to allow empty string for backspace
  const [bottleUnits, setBottleUnits] = useState<string | number>('');
  const [jugUnits, setJugUnits] = useState<string | number>('');

  const [isPaid, setIsPaid] = useState(false);
  const [orderType, setOrderType] = useState<'regular' | 'bulk' | 'event'>('regular');
  const [isScheduled, setIsScheduled] = useState(false);
  const [eventDate, setEventDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredCustomers = searchCustomers(searchQuery);

  // Default to 1 bottle if nothing selected initially? No, let's start at 0 but maybe default one to 1 if we want to guide user?
  // Let's perform a migration of state:
  // Remove: const [units, setUnits] = useState(1);
  // Remove: const [productType, setProductType] = useState<'bottle' | 'jug'>('bottle');

  // Instead of simple state, we can initialize with 1 bottle to match previous behavior
  // const [bottleUnits, setBottleUnits] = useState(1);
  // const [jugUnits, setJugUnits] = useState(0);

  // But we need to replace the whole component body basically, or big chunks.

  // ... (re-implementing state and logic)

  // Price calculation
  const bottlePrice = 20;
  const jugPrice = 30;

  // Use Number() to safely handle string inputs (empty string)
  const totalPrice = (Number(bottleUnits) * bottlePrice) + (Number(jugUnits) * jugPrice);

  // ...

  const handleSubmit = async () => {
    if (!selectedCustomer) {
      toast.error(t('new_order.error_select_customer'));
      return;
    }

    if (isNaN(Number(bottleUnits)) || isNaN(Number(jugUnits))) {
      toast.error('Invalid quantity');
      return;
    }

    if (Number(bottleUnits) === 0 && Number(jugUnits) === 0) {
      toast.error(t('new_order.error_units'));
      return;
    }

    if (isScheduled && !eventDate) {
      toast.error(t('new_order.error_date'));
      return;
    }

    setIsSubmitting(true);

    try {
      const finalOrderType = isScheduled ? 'event' : (orderType === 'regular' ? 'regular' : 'bulk');
      const deliveredAt = isScheduled ? new Date(eventDate).toISOString() : new Date().toISOString();

      const promises = [];

      // 1. Log Bottle Order
      if (Number(bottleUnits) > 0) {
        promises.push(addOrder({
          customer_id: selectedCustomer.id,
          units: Number(bottleUnits),
          is_paid: isPaid,
          product_type: 'bottle',
          order_type: finalOrderType,
          price: bottlePrice,
          delivered_at: deliveredAt,
          billing_month: null,
          notes: null
        }));
      }

      // 2. Log Jug Order
      if (Number(jugUnits) > 0) {
        promises.push(addOrder({
          customer_id: selectedCustomer.id,
          units: Number(jugUnits),
          is_paid: isPaid,
          product_type: 'jug',
          order_type: finalOrderType,
          price: jugPrice,
          delivered_at: deliveredAt,
          billing_month: null,
          notes: null
        }));
      }

      await Promise.all(promises);

      // 3. Update container count - logic per product? 
      // Usually only Jugs/Special might affect containers? 
      // Requirement "Uses Company Container" was for special orders.
      // If user checks "Uses Company Container", we probably apply it for the whole interaction.
      // Since it's +1 container count "checked", we just do it once if checked? 

      // Original logic:
      // if (finalOrderType !== 'regular' && !selectedCustomer.is_regular) {
      //   await updateContainerCount(selectedCustomer.id, 1);
      // }
      // This logic was implicit in the previous code? 
      // "Checking this will mark a container as 'Pending Return'"
      // If we are consistent, we should probably stick to the explicit check.

      if (!selectedCustomer.is_regular) {
        // Auto-track all containers for non-regular customers
        const totalReturnedContainers = Number(bottleUnits) + Number(jugUnits);
        if (totalReturnedContainers > 0) {
          await updateContainerCount(selectedCustomer.id, totalReturnedContainers);
          toast.info('Containers tracked as return pending');
        }
      }

      toast.success(t('new_order.success_message', { name: selectedCustomer.name }));

      // Reset form
      setSelectedCustomer(null);
      setSearchQuery('');
      setBottleUnits('');
      setJugUnits('');
      setIsPaid(false);
      setOrderType('regular');
      setEventDate('');
    } catch (error) {
      console.error(error);
      toast.error('Failed to log order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnitChange = (value: string, setter: (val: string | number) => void) => {
    if (value === '') {
      setter('');
      return;
    }
    const num = parseInt(value);
    if (isNaN(num)) return;
    if (num > 150) {
      toast.error(t('new_order.max_limit_error') || 'Maximum limit is 150');
      setter(150);
      return;
    }
    setter(num);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title={t('new_order.title')} subtitle={t('new_order.subtitle')} />

      <main className="px-4 py-6 max-w-md mx-auto space-y-6">
        {/* Customer Selection */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            {t('new_order.select_customer')}
          </h2>

          {selectedCustomer ? (
            <div className="space-y-3">
              <CustomerCard customer={selectedCustomer} selected />
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setSelectedCustomer(null)}
              >
                {t('new_order.change_customer')}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={t('new_order.search_placeholder')}
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
                    {t('new_order.no_customers_found')}
                  </p>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Product Selection (Qty based) */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            {t('new_order.product_type')}
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {/* Bottle Input */}
            <div className={cn(
              "flex items-center justify-between p-4 rounded-2xl border-2 transition-all",
              (Number(bottleUnits) > 0) ? "border-primary bg-primary/5" : "border-border bg-card"
            )}>
              <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-lg", (Number(bottleUnits) > 0) ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground")}>
                  <Droplets className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-semibold">{t('new_order.bottle')}</div>
                  <div className="text-xs text-muted-foreground">₹20 / {t('new_order.bottle')}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  inputMode="numeric"
                  className="w-20 text-center font-bold text-lg h-12"
                  placeholder="0"
                  value={bottleUnits}
                  onChange={(e) => handleUnitChange(e.target.value, setBottleUnits)}
                />
              </div>
            </div>

            {/* Jug Input */}
            <div className={cn(
              "flex items-center justify-between p-4 rounded-2xl border-2 transition-all",
              (Number(jugUnits) > 0) ? "border-primary bg-primary/5" : "border-border bg-card"
            )}>
              <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-lg", (Number(jugUnits) > 0) ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground")}>
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-semibold">{t('new_order.jug')}</div>
                  <div className="text-xs text-muted-foreground">₹30 / {t('new_order.jug')}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  inputMode="numeric"
                  className="w-20 text-center font-bold text-lg h-12"
                  placeholder="0"
                  value={jugUnits}
                  onChange={(e) => handleUnitChange(e.target.value, setJugUnits)}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Order Type - Admin Only */}
        {isAdmin && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                {t('new_order.order_type')}
              </h2>
              <Button variant="link" size="sm" className="h-auto p-0 text-purple-600" onClick={() => window.location.href = '/reminders'}>
                {t('new_order.view_schedule')}
              </Button>
            </div>
            <div className="flex bg-secondary p-1 rounded-xl mb-4">
              <button
                onClick={() => {
                  setOrderType('regular');
                  setIsScheduled(false);
                }}
                className={cn(
                  "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all",
                  orderType === 'regular'
                    ? "bg-white shadow text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t('new_order.regular_monthly')}
              </button>
              <button
                onClick={() => setOrderType('bulk')}
                className={cn(
                  "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all",
                  orderType === 'bulk' || orderType === 'event'
                    ? "bg-purple-100 text-purple-700 shadow"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t('new_order.special_onetime')}
              </button>
            </div>

            {/* Schedule Toggle for Special Orders */}
            {(orderType === 'bulk' || orderType === 'event') && (
              <div className="bg-purple-50 p-4 rounded-2xl border-2 border-purple-100 space-y-4 mb-4">
                <div className="flex items-center justify-between">
                  <label htmlFor="is-scheduled" className="font-medium text-purple-900">
                    {t('new_order.schedule_later')}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is-scheduled"
                      className="w-5 h-5 rounded border-purple-300 text-purple-600 focus:ring-purple-500"
                      checked={isScheduled}
                      onChange={(e) => setIsScheduled(e.target.checked)}
                    />
                  </div>
                </div>

                {isScheduled && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                    <Label htmlFor="event-date" className="text-purple-800">{t('new_order.date_time')}</Label>
                    <Input
                      id="event-date"
                      type="datetime-local"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="bg-white border-purple-200 focus:border-purple-400"
                    />
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* Total Price */}
        <section>
          <div className="bg-card p-4 rounded-2xl border-2 border-border flex items-center justify-between">
            <span className="text-muted-foreground font-medium">{t('new_order.total')}</span>
            <span className="text-2xl font-bold">₹{totalPrice}</span>
          </div>
        </section>

        {/* Payment Status */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            {t('new_order.payment_status')}
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
              {t('new_order.pending')}
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
              {t('new_order.paid')}
            </button>
          </div>
          {orderType === 'regular' && (
            <p className="text-xs text-muted-foreground mt-2 text-center">
              {t('new_order.regular_billed_monthly')}
            </p>
          )}
        </section>

        {/* Container Return Logic For Non-Regular Customers */}
        {
          (!selectedCustomer?.is_regular) && (Number(bottleUnits) > 0 || Number(jugUnits) > 0) && (
            <section className="p-4 bg-card rounded-2xl border-2 border-dashed border-amber-200 bg-amber-50/50">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-600" />
                <p className="text-sm font-medium text-amber-900">
                  {Number(bottleUnits) + Number(jugUnits)} Containers will be marked as "Return Pending"
                </p>
              </div>
            </section>
          )
        }

        {/* Submit Button */}
        <Button
          variant={orderType === 'bulk' ? 'default' : 'water'}
          className={cn("w-full h-12 text-lg", orderType === 'bulk' && "bg-purple-600 hover:bg-purple-700")}
          onClick={handleSubmit}
          disabled={!selectedCustomer || isSubmitting || (Number(bottleUnits) === 0 && Number(jugUnits) === 0)}
        >
          {isSubmitting ? (
            t('new_order.logging')
          ) : (
            <>
              <Check className="w-5 h-5 mr-2" />
              {orderType === 'bulk' ? t('new_order.log_bulk_order') : t('new_order.log_delivery')}
            </>
          )}
        </Button>
      </main>
    </div>
  );
}
