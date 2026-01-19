import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Customer } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export function useCustomers() {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Customer[];
    },
  });

  const addCustomerMutation = useMutation({
    mutationFn: async (customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => {
      if (!isAdmin) throw new Error('Only admins can add customers');

      const { data, error } = await supabase
        .from('customers')
        .insert(customer)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });

  const updateCustomerMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Customer> }) => {
      if (!isAdmin) throw new Error('Only admins can update customers');

      const { data, error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });

  const deleteCustomerMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!isAdmin) throw new Error('Only admins can delete customers');

      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });

  const searchCustomers = (query: string) => {
    if (!query.trim()) return customers;
    const lowercaseQuery = query.toLowerCase();
    return customers.filter(
      c => c.name.toLowerCase().includes(lowercaseQuery) ||
           c.phone.includes(query) ||
           c.address.toLowerCase().includes(lowercaseQuery)
    );
  };

  return {
    customers,
    isLoading,
    addCustomer: addCustomerMutation.mutateAsync,
    updateCustomer: updateCustomerMutation.mutateAsync,
    deleteCustomer: deleteCustomerMutation.mutateAsync,
    searchCustomers,
  };
}
