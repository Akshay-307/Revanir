import { useState } from 'react';
import { Calendar, Clock, MapPin, Phone } from 'lucide-react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { useOrders } from '@/hooks/useOrders';
import { format, isAfter, isToday } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Order } from '@/types';

export default function EventOrders() {
    const { orders, togglePaymentStatus } = useOrders();
    const [filter, setFilter] = useState<'upcoming' | 'past'>('upcoming');

    // Filter for special orders (event and bulk)
    const eventOrders = orders.filter(o => o.order_type === 'event' || o.order_type === 'bulk');

    const filteredEvents = eventOrders.filter(order => {
        const eventDate = new Date(order.delivered_at);
        // For 'upcoming', we include today and future dates
        // For 'past', strictly before today (or maybe before now?)
        // Let's say upcoming includes today.
        if (filter === 'upcoming') {
            return isAfter(eventDate, new Date()) || isToday(eventDate);
        } else {
            return !isAfter(eventDate, new Date()) && !isToday(eventDate);
        }
    }).sort((a, b) => new Date(a.delivered_at).getTime() - new Date(b.delivered_at).getTime());

    // For past events, maybe reverse sort (most recent first)
    const displayEvents = filter === 'past' ? [...filteredEvents].reverse() : filteredEvents;

    return (
        <div className="min-h-screen bg-background pb-20">
            <Header title="Special Orders" subtitle="Events and one-time deliveries" />

            <main className="px-4 py-6 max-w-md mx-auto space-y-6">
                {/* Filter Toggles */}
                <div className="flex bg-secondary p-1 rounded-xl">
                    <button
                        onClick={() => setFilter('upcoming')}
                        className={cn(
                            "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all",
                            filter === 'upcoming'
                                ? "bg-white shadow text-foreground"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Upcoming
                    </button>
                    <button
                        onClick={() => setFilter('past')}
                        className={cn(
                            "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all",
                            filter === 'past'
                                ? "bg-white shadow text-foreground"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Past Events
                    </button>
                </div>

                {/* Event List */}
                {displayEvents.length === 0 ? (
                    <div className="text-center py-12 px-6 bg-card rounded-2xl border-2 border-dashed border-border">
                        <Calendar className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">
                            {filter === 'upcoming' ? 'No upcoming events' : 'No past events'}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                            {filter === 'upcoming'
                                ? 'Check back later or schedule a new event'
                                : 'History is clear'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {displayEvents.map((order) => (
                            <EventOrderCard
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

function EventOrderCard({ order, onTogglePayment }: { order: Order; onTogglePayment: () => void }) {
    const eventDate = new Date(order.delivered_at);

    return (
        <Card className="overflow-hidden border-l-4 border-l-purple-500">
            <CardContent className="p-0">
                <div className="p-4 space-y-3">
                    {/* Header with Date and Status */}
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 text-purple-700 font-semibold bg-purple-50 px-3 py-1 rounded-full text-sm">
                            <Calendar className="w-4 h-4" />
                            <span>{format(eventDate, 'EEE, MMM d, yyyy')}</span>
                        </div>
                        <button onClick={onTogglePayment}>
                            <Badge variant={order.is_paid ? 'secondary' : 'destructive'} className={cn(
                                "cursor-pointer hover:opacity-80",
                                order.is_paid ? "bg-green-100 text-green-700 hover:bg-green-200" : ""
                            )}>
                                {order.is_paid ? 'PAID' : 'UNPAID'}
                            </Badge>
                        </button>
                    </div>

                    {/* Time & Location */}
                    <div className="grid grid-cols-1 gap-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="w-4 h-4 text-purple-500" />
                            <span>{format(eventDate, 'h:mm a')}</span>
                        </div>
                        {order.customer && (
                            <>
                                <div className="flex items-center gap-2 font-medium text-foreground">
                                    <span className="w-4 h-4 flex items-center justify-center rounded-full bg-primary/10 text-primary text-xs">C</span>
                                    <span>{order.customer.name}</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground ml-6 text-xs">
                                    <Phone className="w-3 h-3" />
                                    <span>{order.customer.phone}</span>
                                </div>
                                <div className="flex items-start gap-2 text-muted-foreground ml-6 text-xs">
                                    <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                                    <span>{order.customer.address}</span>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Details */}
                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                        <div className="text-sm">
                            <span className="font-semibold">{order.units}</span> {order.product_type === 'bottle' ? 'Bottles' : 'Jugs'}
                        </div>
                        <div className="text-sm font-semibold">
                            ₹{order.price * order.units}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
