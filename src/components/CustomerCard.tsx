import { User, Phone, MapPin, ChevronRight } from 'lucide-react';
import { Customer } from '@/types';
import { cn } from '@/lib/utils';

interface CustomerCardProps {
  customer: Customer;
  onClick?: () => void;
  selected?: boolean;
}

export function CustomerCard({ customer, onClick, selected }: CustomerCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full p-4 rounded-2xl bg-card border-2 text-left transition-all duration-200 animate-slide-up",
        selected 
          ? "border-primary shadow-lg bg-primary/5" 
          : "border-border hover:border-primary/50 hover:shadow-md",
        onClick && "cursor-pointer active:scale-[0.98]"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
            <User className="w-6 h-6 text-secondary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">{customer.name}</h3>
            <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
              <Phone className="w-4 h-4 flex-shrink-0" />
              <span>{customer.phone}</span>
            </div>
            <div className="flex items-start gap-1.5 mt-1 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span className="line-clamp-2">{customer.address}</span>
            </div>
          </div>
        </div>
        {onClick && (
          <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-3" />
        )}
      </div>
    </button>
  );
}
