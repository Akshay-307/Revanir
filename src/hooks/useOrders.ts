import { useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { Order, DailySummary } from '@/types';

export function useOrders() {
  const [orders, setOrders] = useLocalStorage<Order[]>('water-delivery-orders', []);

  const addOrder = (order: Omit<Order, 'id' | 'createdAt'>) => {
    const newOrder: Order = {
      ...order,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setOrders(prev => [...prev, newOrder]);
    return newOrder;
  };

  const updateOrder = (id: string, updates: Partial<Order>) => {
    setOrders(prev => 
      prev.map(o => o.id === id ? { ...o, ...updates } : o)
    );
  };

  const togglePaymentStatus = (id: string) => {
    setOrders(prev => 
      prev.map(o => o.id === id ? { ...o, isPaid: !o.isPaid } : o)
    );
  };

  const deleteOrder = (id: string) => {
    setOrders(prev => prev.filter(o => o.id !== id));
  };

  const getTodaysOrders = () => {
    const today = new Date().toDateString();
    return orders.filter(o => new Date(o.date).toDateString() === today);
  };

  const getOrdersByDate = (date: string) => {
    const targetDate = new Date(date).toDateString();
    return orders.filter(o => new Date(o.date).toDateString() === targetDate);
  };

  const todaysSummary: DailySummary = useMemo(() => {
    const todaysOrders = getTodaysOrders();
    return {
      totalUnits: todaysOrders.reduce((sum, o) => sum + o.units, 0),
      totalPaid: todaysOrders.filter(o => o.isPaid).reduce((sum, o) => sum + o.units, 0),
      totalPending: todaysOrders.filter(o => !o.isPaid).reduce((sum, o) => sum + o.units, 0),
      orderCount: todaysOrders.length,
    };
  }, [orders]);

  return {
    orders,
    addOrder,
    updateOrder,
    togglePaymentStatus,
    deleteOrder,
    getTodaysOrders,
    getOrdersByDate,
    todaysSummary,
  };
}
