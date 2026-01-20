import { useState } from 'react';
import { Header } from '@/components/Header';
import { useOrders } from '@/hooks/useOrders';
import { useCustomers } from '@/hooks/useCustomers';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, Phone, RotateCcw } from 'lucide-react';
import { isAfter, isToday } from 'date-fns';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { formatDate } from '@/utils/dateUtils';
import { TransliteratedText } from '@/components/TransliteratedText';

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

    const handleReturn = async (customerId: string, currentCount: number) => {
        try {
            await updateContainerCount(customerId, -1);
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
                            pendingReturns.map(customer => (
                                <Card key={customer.id} className="border-l-4 border-l-amber-400">
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div>
                                            <div className="font-semibold">
                                                <TransliteratedText text={customer.name} />
                                            </div>
                                            <div className="text-sm text-muted-foreground">{customer.phone}</div>
                                            <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-xs font-medium">
                                                {t(customer.containers_held === 1 ? 'cards.container_pending' : 'cards.containers_pending', { count: customer.containers_held })}
                                            </div>
                                        </div>
                                        <Button size="sm" variant="outline" onClick={() => handleReturn(customer.id, customer.containers_held)}>
                                            {t('cards.return_1')}
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
