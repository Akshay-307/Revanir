import { useState } from 'react';
import { Header } from '@/components/Header';
import { useOrders } from '@/hooks/useOrders';
import { useCustomers } from '@/hooks/useCustomers';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, Phone, RotateCcw, Droplets, Package } from 'lucide-react';
import { isAfter, isToday } from 'date-fns';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { formatDate } from '@/utils/dateUtils';
import { TransliteratedText } from '@/components/TransliteratedText';
import { cn } from '@/lib/utils';

export default function Reminders() {
    const { orders } = useOrders();
    const { customers, updateContainerCount } = useCustomers();
    const [activeTab, setActiveTab] = useState('deliveries');
    const { t } = useTranslation();

    // Filter Upcoming Deliveries (Scheduled Events)
    const upcomingDeliveries = orders
        .filter(o => o.order_type === 'event')
        .filter(o => {
            const date = new Date(o.delivered_at);
            return isAfter(date, new Date()) || isToday(date);
        })
        .sort((a, b) => new Date(a.delivered_at).getTime() - new Date(b.delivered_at).getTime());

    // Filter Pending Returns (Customers with containers > 0)
    const pendingReturns = customers
        .filter(c => (c.containers_held || 0) > 0)
        .sort((a, b) => (b.containers_held || 0) - (a.containers_held || 0));

    const handleReturn = async (customerId: string, count: number) => {
        try {
            await updateContainerCount(customerId, -count);
            toast.success(t('reminders.container_returned'));
        } catch (e) {
            toast.error(t('reminders.failed_update'));
        }
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            <Header title={t('reminders.title')} subtitle={t('reminders.subtitle')} />

            <main className="px-4 py-6 max-w-md mx-auto">
                <Tabs defaultValue="deliveries" className="w-full" onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="deliveries">{t('reminders.tabs_deliveries')}</TabsTrigger>
                        <TabsTrigger value="returns">{t('reminders.tabs_returns')}</TabsTrigger>
                    </TabsList>

                    <TabsContent value="deliveries" className="space-y-4">
                        {upcomingDeliveries.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Clock className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>{t('reminders.no_upcoming')}</p>
                            </div>
                        ) : (
                            upcomingDeliveries.map(order => (
                                <Card key={order.id} className="border-l-4 border-l-purple-500">
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="font-semibold text-purple-900">
                                                {formatDate(order.delivered_at, 'MMM d, h:mm a')}
                                            </div>
                                            <div className="text-sm font-medium">
                                                {order.units} {order.product_type === 'bottle' ? t('cards.bottles') : t('cards.jugs')}
                                            </div>
                                        </div>
                                        <div className="text-sm text-muted-foreground space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-foreground">
                                                    <TransliteratedText text={order.customer?.name} />
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Phone className="w-3 h-3" />
                                                {order.customer?.phone}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-3 h-3" />
                                                <TransliteratedText text={order.customer?.address} />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </TabsContent>

                    <TabsContent value="returns" className="space-y-4">
                        {pendingReturns.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <RotateCcw className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>{t('reminders.no_returns')}</p>
                            </div>
                        ) : (
                            pendingReturns.map(customer => {
                                // Calculate last order stats
                                const customerOrders = orders
                                    .filter(o => o.customer_id === customer.id)
                                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

                                let lastOrderStats = null;
                                if (customerOrders.length > 0) {
                                    const latestOrder = customerOrders[0];
                                    const sameDayOrders = customerOrders.filter(o => o.delivered_at === latestOrder.delivered_at);
                                    const bottles = sameDayOrders.filter(o => o.product_type === 'bottle').reduce((sum, o) => sum + o.units, 0);
                                    const jugs = sameDayOrders.filter(o => o.product_type === 'jug').reduce((sum, o) => sum + o.units, 0);
                                    const isPaid = sameDayOrders.every(o => o.is_paid);
                                    const totalAmount = sameDayOrders.reduce((sum, o) => sum + (o.price * o.units), 0);
                                    lastOrderStats = { bottles, jugs, isPaid, totalAmount };
                                }

                                return (
                                    <Card key={customer.id} className={cn(
                                        "border-l-4 transition-colors",
                                        lastOrderStats?.isPaid
                                            ? "border-l-green-600 bg-green-100"
                                            : "border-l-amber-500 bg-amber-100/80"
                                    )}>
                                        <CardContent className="p-4 flex items-center justify-between">
                                            <div className="flex-1 min-w-0 mr-2">
                                                <div className="flex justify-between items-start">
                                                    <div className="font-semibold truncate">
                                                        <TransliteratedText text={customer.name} />
                                                    </div>
                                                    {lastOrderStats && (
                                                        <div className="flex flex-col items-end gap-1 ml-2">
                                                            <span className={cn(
                                                                "text-[10px] px-1.5 py-0.5 rounded font-bold uppercase shrink-0",
                                                                lastOrderStats.isPaid ? "bg-green-200 text-green-800" : "bg-yellow-200 text-yellow-800"
                                                            )}>
                                                                {lastOrderStats.isPaid ? "PAID" : "PENDING"}
                                                            </span>
                                                            {!lastOrderStats.isPaid && lastOrderStats.totalAmount > 0 && (
                                                                <span className="text-xs font-bold text-red-600 bg-white/50 px-1 rounded">
                                                                    ₹{lastOrderStats.totalAmount}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-sm text-muted-foreground">{customer.phone}</div>

                                                <div className="mt-3">
                                                    <div className="mb-2">
                                                        <span className="inline-flex items-center px-3 py-1.5 rounded-md bg-white/70 text-amber-950 text-base font-bold border-2 border-amber-200/60 shadow-sm">
                                                            {t(customer.containers_held === 1 ? 'cards.container_pending' : 'cards.containers_pending', { count: customer.containers_held })}
                                                        </span>
                                                    </div>
                                                    {lastOrderStats && (
                                                        <div className="flex gap-2 flex-wrap mt-2">
                                                            {lastOrderStats.bottles > 0 && (
                                                                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-900 rounded-lg border border-blue-200 shadow-sm text-sm font-bold">
                                                                    <Droplets className="w-4 h-4" />
                                                                    {lastOrderStats.bottles} {t('cards.bottles')}
                                                                </div>
                                                            )}
                                                            {lastOrderStats.jugs > 0 && (
                                                                <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-900 rounded-lg border border-purple-200 shadow-sm text-sm font-bold">
                                                                    <Package className="w-4 h-4" />
                                                                    {lastOrderStats.jugs} {t('cards.jugs')}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <ReturnControls
                                                customer={customer}
                                                lastOrderStats={lastOrderStats}
                                                onReturn={(count) => handleReturn(customer.id, count)}
                                                t={t}
                                            />
                                        </CardContent>
                                    </Card>
                                )
                            })
                        )}
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}

function ReturnControls({ customer, lastOrderStats, onReturn, t }: { customer: any, lastOrderStats: any, onReturn: (count: number) => void, t: any }) {
    const [returningBottles, setReturningBottles] = useState('');
    const [returningJugs, setReturningJugs] = useState('');
    const [returningGeneric, setReturningGeneric] = useState('');
    const [showControls, setShowControls] = useState(false);

    const handleSubmit = () => {
        let total = 0;
        if (lastOrderStats) {
            total = (parseInt(returningBottles) || 0) + (parseInt(returningJugs) || 0);
        } else {
            total = parseInt(returningGeneric) || 0;
        }

        if (total > 0 && total <= customer.containers_held) {
            onReturn(total);
            setReturningBottles('');
            setReturningJugs('');
            setReturningGeneric('');
            setShowControls(false);
        }
    };

    if (!showControls) {
        return (
            <Button size="sm" variant="outline" className="shrink-0" onClick={() => setShowControls(true)}>
                {t('cards.return_1')}
            </Button>
        );
    }

    return (
        <div className="flex flex-col gap-2 shrink-0 bg-white/50 p-2 rounded-lg border border-black/5 items-end ml-2">
            {lastOrderStats ? (
                <>
                    {lastOrderStats.bottles > 0 && (
                        <div className="flex items-center gap-2">
                            <Droplets className="w-3 h-3 text-blue-700" />
                            <input
                                type="number"
                                placeholder="0"
                                className="w-12 h-7 text-sm px-1 border rounded bg-white text-right"
                                value={returningBottles}
                                onChange={(e) => setReturningBottles(e.target.value)}
                                max={lastOrderStats.bottles}
                            />
                        </div>
                    )}
                    {lastOrderStats.jugs > 0 && (
                        <div className="flex items-center gap-2">
                            <Package className="w-3 h-3 text-purple-700" />
                            <input
                                type="number"
                                placeholder="0"
                                className="w-12 h-7 text-sm px-1 border rounded bg-white text-right"
                                value={returningJugs}
                                onChange={(e) => setReturningJugs(e.target.value)}
                                max={lastOrderStats.jugs}
                            />
                        </div>
                    )}
                </>
            ) : (
                <input
                    type="number"
                    placeholder="Qty"
                    className="w-14 h-7 text-sm px-1 border rounded bg-white text-right"
                    value={returningGeneric}
                    onChange={(e) => setReturningGeneric(e.target.value)}
                    max={customer.containers_held}
                />
            )}
            <div className="flex gap-1 mt-1">
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setShowControls(false)}>
                    <span className="text-xs">✕</span>
                </Button>
                <Button size="sm" className="h-6 px-2 text-xs" onClick={handleSubmit} disabled={
                    (lastOrderStats && !returningBottles && !returningJugs) || (!lastOrderStats && !returningGeneric)
                }>
                    OK
                </Button>
            </div>
        </div>
    );
}
