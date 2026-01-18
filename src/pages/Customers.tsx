import { useState } from 'react';
import { Search, UserPlus, Users } from 'lucide-react';
import { Header } from '@/components/Header';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CustomerCard } from '@/components/CustomerCard';
import { AddCustomerForm } from '@/components/AddCustomerForm';
import { useCustomers } from '@/hooks/useCustomers';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function Customers() {
  const { customers, searchCustomers } = useCustomers();
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const filteredCustomers = searchCustomers(searchQuery);

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Customers" subtitle={`${customers.length} registered`} />

      <main className="px-4 py-6 max-w-md mx-auto space-y-4">
        {/* Search and Add */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12"
            />
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="water" size="icon">
                <UserPlus className="w-5 h-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="mx-4 max-w-[calc(100%-2rem)] rounded-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-primary" />
                  Add New Customer
                </DialogTitle>
              </DialogHeader>
              <AddCustomerForm onSuccess={() => setDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Customer List */}
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-12 px-6 bg-card rounded-2xl border-2 border-dashed border-border">
            <Users className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {searchQuery ? 'No customers found' : 'No customers yet'}
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              {searchQuery 
                ? 'Try a different search term'
                : 'Add your first customer to get started'}
            </p>
            {!searchQuery && (
              <Button variant="outline" onClick={() => setDialogOpen(true)}>
                <UserPlus className="w-4 h-4" />
                Add Customer
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCustomers.map((customer, index) => (
              <div key={customer.id} style={{ animationDelay: `${index * 50}ms` }}>
                <CustomerCard customer={customer} />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
