import { useState } from 'react';
import { Customer, Order } from '@/types';
import { Button } from '@/components/ui/button';
import { Check, Loader2, IndianRupee } from 'lucide-react';
import { toast } from 'sonner';

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

    const totalDue = unpaidOrders.reduce((sum, order) => sum + (order.units * order.price), 0);

    if (totalDue === 0) return null; // Don't show if nothing is due

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
                <div className="text-right">
                    <p className="text-sm text-muted-foreground">Due Amount</p>
                    <div className="flex items-center gap-1 font-bold text-xl text-primary">
                        <IndianRupee className="w-4 h-4" />
                        <span>{totalDue}</span>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center text-sm text-muted-foreground bg-secondary/50 p-2 rounded-lg">
                <span>Pending Orders:</span>
                <span className="font-medium text-foreground">{unpaidOrders.length}</span>
            </div>

            <Button
                className="w-full mt-1"
                variant="default" // You might want a specific 'settle' variant later
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
        </div>
    );
}
