import { useState } from 'react';
import { Customer, Order } from '@/types';
import { Button } from '@/components/ui/button';
import { Check, Loader2, IndianRupee, History, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { format } from 'date-fns';

interface CustomerBillingCardProps {
    customer: Customer;
    orders: Order[];
    onSettle: (customerId: string) => Promise<void>;
}

export function CustomerBillingCard({ customer, orders, onSettle }: CustomerBillingCardProps) {
    const [isSettling, setIsSettling] = useState(false);

    // Calculate unpaid regular orders
    const unpaidOrders = orders.filter(
        o => o.customer_id === customer.id && !o.is_paid && o.order_type === 'regular'
    );

    // Get paid history
    const paidHistory = orders.filter(
        o => o.customer_id === customer.id && o.is_paid && o.order_type === 'regular'
    ).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const totalDue = unpaidOrders.reduce((sum, order) => sum + (order.units * order.price), 0);
    const totalBottles = unpaidOrders.filter(o => o.product_type === 'bottle').reduce((sum, o) => sum + o.units, 0);
    const totalJugs = unpaidOrders.filter(o => o.product_type === 'jug').reduce((sum, o) => sum + o.units, 0);

    // Always render card for local customers so they can see history even if 0 due?
    // User requirement: "keep the billing history of all the local customers"
    // So we should probably show the card even if totalDue is 0 if we want to show history.
    // BUT usually this component is only for billing view.
    // Let's modify behavior: if totalDue > 0 OR user wants history.
    // The parent Customer.tsx logic filters 'customersWithBills'. We need to adjust that too if we want to see history for everyone.
    // For now, let's keep it on the billing card.

    const handleSettle = async () => {
        setIsSettling(true);
        try {
            await onSettle(customer.id);
            toast.success(`Settled bill for ${customer.name}`);
        } catch (error) {
            toast.error('Failed to settle bill');
        } finally {
            setIsSettling(false);
        }
    };

    return (
        <div className="p-4 rounded-2xl bg-card border-2 border-border animate-slide-up flex flex-col gap-3">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-semibold text-foreground">{customer.name}</h3>
                    <p className="text-sm text-muted-foreground">{customer.phone}</p>
                </div>
                {totalDue > 0 && (
                    <div className="text-right">
                        <p className="text-sm text-muted-foreground">Due Amount</p>
                        <div className="flex items-center gap-1 font-bold text-xl text-primary justify-end">
                            <IndianRupee className="w-4 h-4" />
                            <span>{totalDue}</span>
                        </div>
                    </div>
                )}
            </div>

            {totalDue > 0 ? (
                <>
                    {/* Monthly Usage Stats */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="bg-secondary/30 p-2 rounded-lg text-center border border-border/50">
                            <div className="text-muted-foreground text-xs uppercase tracking-wider">Bottles</div>
                            <div className="font-semibold text-foreground text-lg">{totalBottles}</div>
                        </div>
                        <div className="bg-secondary/30 p-2 rounded-lg text-center border border-border/50">
                            <div className="text-muted-foreground text-xs uppercase tracking-wider">Jugs</div>
                            <div className="font-semibold text-foreground text-lg">{totalJugs}</div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center text-sm text-muted-foreground bg-secondary/50 p-2 rounded-lg">
                        <span>Pending Deliveries:</span>
                        <span className="font-medium text-foreground">{unpaidOrders.length}</span>
                    </div>
                </>
            ) : (
                <div className="text-center py-4 text-muted-foreground text-sm bg-secondary/20 rounded-lg">
                    <Check className="w-8 h-8 mx-auto mb-2 text-green-500" />
                    All caught up! No pending bills.
                </div>
            )}

            <div className="grid grid-cols-2 gap-2 mt-1">
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="w-full">
                            <History className="w-4 h-4 mr-2" />
                            History
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
                        <DialogHeader>
                            <DialogTitle>Billing History: {customer.name}</DialogTitle>
                        </DialogHeader>
                        <div className="flex-1 overflow-y-auto pr-2 space-y-3 py-4">
                            {paidHistory.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">No past payments found.</p>
                            ) : (
                                paidHistory.map(order => (
                                    <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/50">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-green-100 p-2 rounded-full">
                                                <Calendar className="w-4 h-4 text-green-700" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">
                                                    {(() => {
                                                        try {
                                                            return format(new Date(order.created_at), 'MMM d, yyyy');
                                                        } catch (e) {
                                                            return 'Invalid Date';
                                                        }
                                                    })()}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {order.units} {order.product_type === 'bottle' ? 'Bottles' : 'Jugs'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="font-semibold text-right">
                                            <div className="flex items-center justify-end text-sm">
                                                <IndianRupee className="w-3 h-3" />
                                                {order.price * order.units}
                                            </div>
                                            <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full uppercase font-bold tracking-wider">
                                                PAID
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </DialogContent>
                </Dialog>

                {totalDue > 0 && (
                    <Button
                        className="w-full"
                        variant="default"
                        onClick={handleSettle}
                        disabled={isSettling}
                    >
                        {isSettling ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Settling...
                            </>
                        ) : (
                            <>
                                <Check className="w-4 h-4 mr-2" />
                                Mark Paid
                            </>
                        )}
                    </Button>
                )}
            </div>
        </div>
    );
}
