import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Order, DailySummary } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export function useOrders() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customer:customers(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Order[];
    },
  });

  const addOrderMutation = useMutation({
    mutationFn: async (order: Omit<Order, 'id' | 'created_at' | 'delivered_at' | 'logged_by' | 'customer'>) => {
      const { data, error } = await supabase
        .from('orders')
        .insert({
          ...order,
          logged_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Order> }) => {
      const { data, error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  const togglePaymentStatus = (id: string) => {
    const order = orders.find(o => o.id === id);
    if (order) {
      updateOrderMutation.mutate({ id, updates: { is_paid: !order.is_paid } });
    }
  };

  const deleteOrderMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  const settleCustomerBillMutation = useMutation({
    mutationFn: async (customerId: string) => {
      const { error } = await supabase
        .from('orders')
        .update({ is_paid: true })
        .eq('customer_id', customerId)
        .eq('is_paid', false)
        .eq('order_type', 'regular'); // Only settle regular orders

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  const getTodaysOrders = () => {
    const today = new Date().toDateString();
    return orders.filter(o => new Date(o.delivered_at).toDateString() === today);
  };

  const getOrdersByDate = (date: string) => {
    const targetDate = new Date(date).toDateString();
    return orders.filter(o => new Date(o.delivered_at).toDateString() === targetDate);
  };

  const todaysSummary: DailySummary = useMemo(() => {
    const todaysOrders = getTodaysOrders();
    return {
      totalUnits: todaysOrders.reduce((sum, o) => sum + o.units, 0),
      totalPaid: todaysOrders.filter(o => o.is_paid).reduce((sum, o) => sum + o.units, 0),
      totalPending: todaysOrders.filter(o => !o.is_paid).reduce((sum, o) => sum + o.units, 0),
      orderCount: todaysOrders.length,
    };
  }, [orders]);

  return {
    orders,
    isLoading,
    addOrder: addOrderMutation.mutateAsync,
    updateOrder: updateOrderMutation.mutateAsync,
    togglePaymentStatus,
    deleteOrder: deleteOrderMutation.mutateAsync,
    getTodaysOrders,
    getOrdersByDate,
    todaysSummary,
    settleCustomerBill: settleCustomerBillMutation.mutateAsync,
  };
}
