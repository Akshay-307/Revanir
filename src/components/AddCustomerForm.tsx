import { useState } from 'react';
import { User, Phone, MapPin, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCustomers } from '@/hooks/useCustomers';
import { toast } from 'sonner';

interface AddCustomerFormProps {
  onSuccess?: () => void;
  forceType?: 'regular' | 'onetime';
}

export function AddCustomerForm({ onSuccess, forceType }: AddCustomerFormProps) {
  const { addCustomer } = useCustomers();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.phone.trim() || !formData.address.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);

    try {
      await addCustomer({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        is_regular: forceType === 'regular' || (forceType === undefined),
        default_units: null,
        route_id: null,
        containers_held: 0,
      });

      toast.success('Customer added successfully!');
      setFormData({ name: '', phone: '', address: '' });
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to add customer');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground flex items-center gap-2">
          <User className="w-4 h-4" />
          Customer Name
        </label>
        <Input
          type="text"
          placeholder="Enter full name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="text-base"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground flex items-center gap-2">
          <Phone className="w-4 h-4" />
          Phone Number
        </label>
        <Input
          type="tel"
          placeholder="Enter phone number"
          value={formData.phone}
          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          className="text-base"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Delivery Address
        </label>
        <Input
          type="text"
          placeholder="Enter complete address"
          value={formData.address}
          onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
          className="text-base"
        />
      </div>

      <Button
        type="submit"
        variant="water"
        size="lg"
        className="w-full mt-6"
        disabled={isSubmitting}
      >
        <UserPlus className="w-5 h-5" />
        {isSubmitting ? 'Adding...' : 'Add Customer'}
      </Button>
    </form>
  );
}
