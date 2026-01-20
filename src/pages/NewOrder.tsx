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
  const [units, setUnits] = useState(1);
  const [isPaid, setIsPaid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New State variables
  const [productType, setProductType] = useState<'bottle' | 'jug'>('bottle');
  const [orderType, setOrderType] = useState<'regular' | 'bulk' | 'event'>('regular');
  const [eventDate, setEventDate] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);
  const [useCompanyContainer, setUseCompanyContainer] = useState(false);

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
      toast.error(t('new_order.error_select_customer'));
      return;
    }

    if (units < 1) {
      toast.error(t('new_order.error_units'));
      return;
    }

    if (isScheduled && !eventDate) {
      toast.error(t('new_order.error_date'));
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Log the order
      // Determine final order type
      const finalOrderType = isScheduled ? 'event' : (orderType === 'regular' ? 'regular' : 'bulk');

      await addOrder({
        customer_id: selectedCustomer.id,
        units,
        is_paid: isPaid,
        product_type: productType,
        order_type: finalOrderType,
        price: unitPrice,
        delivered_at: isScheduled ? new Date(eventDate).toISOString() : new Date().toISOString(),
        billing_month: null, // calculated on backend or trigger? or just null for now
        notes: null
      });

      // 2. Update container count if needed
      // Automatically for Special orders (Bulk or Event)
      if (finalOrderType !== 'regular' && !selectedCustomer.is_regular) {
        await updateContainerCount(selectedCustomer.id, 1);
        toast.info('Container tracked');
      }

      toast.success(t('new_order.success_message', { name: selectedCustomer.name }));

      // Reset form
      setSelectedCustomer(null);
      setSearchQuery('');
      setUnits(1);
      setIsPaid(false);
      setProductType('bottle');
      setOrderType('regular');
      setEventDate('');
      setUseCompanyContainer(false);
    } catch (error) {
      console.error(error);
      toast.error('Failed to log order');
    } finally {
      setIsSubmitting(false);
    }
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

        {/* Product Type & Order Type Selection */}
        <div className="grid grid-cols-1 gap-6">
          {/* Product Type */}
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              {t('new_order.product_type')}
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
                  <span className="block font-semibold">{t('new_order.bottle')}</span>
                  <span className="text-xs opacity-75">{t('new_order.bottle_price')}</span>
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
                  <span className="block font-semibold">{t('new_order.jug')}</span>
                  <span className="text-xs opacity-75">{t('new_order.jug_price')}</span>
                </div>
              </button>
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
        </div>

        {/* Units Counter and Total */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {t('new_order.quantity_price')}
            </h2>
            <div className="flex items-center gap-1 text-primary font-bold">
              <Banknote className="w-4 h-4" />
              <span>{t('new_order.total')}: ₹{totalPrice}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 p-6 bg-card rounded-2xl border-2 border-border">
            <div className="flex-1">
              <div className="flex items-center justify-center">
                <Input
                  type="number"
                  min="1"
                  value={units}
                  onChange={(e) => setUnits(Math.max(1, parseInt(e.target.value) || 0))}
                  className="text-center text-4xl font-bold h-20 w-32 border-2"
                />
              </div>
              <p className="text-xs text-center text-muted-foreground mt-2 uppercase tracking-wide">
                {productType === 'bottle' ? t('cards.bottles') : t('cards.jugs')}
              </p>
            </div>
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

        {/* Container Return / Company Container Logic */}
        {
          !selectedCustomer?.is_regular && (
            <section className="p-4 bg-card rounded-2xl border-2 border-dashed border-amber-200 bg-amber-50/50">
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  id="use-container"
                  className="w-5 h-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                  checked={useCompanyContainer}
                  onChange={(e) => setUseCompanyContainer(e.target.checked)}
                />
                <label htmlFor="use-container" className="font-medium text-amber-900">
                  {t('new_order.uses_company_container')}
                </label>
              </div>
              <p className="text-xs text-amber-700 ml-7">
                {t('new_order.container_pending_return')}
              </p>
            </section>
          )
        }

        {/* Submit Button */}
        <Button
          variant={orderType === 'bulk' ? 'default' : 'water'} // Use default (which might be black/primary) or a specific color for bulk? Let's use 'water' for regular and maybe style bulk differently if needed, but 'water' is consistent. Actually showing different flavor.
          className={cn("w-full h-12 text-lg", orderType === 'bulk' && "bg-purple-600 hover:bg-purple-700")}
          onClick={handleSubmit}
          disabled={!selectedCustomer || isSubmitting}
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
      </main >
    </div >
  );
}
