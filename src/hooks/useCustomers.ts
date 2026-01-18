import { useLocalStorage } from './useLocalStorage';
import { Customer } from '@/types';

export function useCustomers() {
  const [customers, setCustomers] = useLocalStorage<Customer[]>('water-delivery-customers', []);

  const addCustomer = (customer: Omit<Customer, 'id' | 'createdAt'>) => {
    const newCustomer: Customer = {
      ...customer,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setCustomers(prev => [...prev, newCustomer]);
    return newCustomer;
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers(prev => 
      prev.map(c => c.id === id ? { ...c, ...updates } : c)
    );
  };

  const deleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
  };

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
    addCustomer,
    updateCustomer,
    deleteCustomer,
    searchCustomers,
  };
}
