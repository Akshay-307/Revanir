import { User, Phone, MapPin, ChevronRight } from 'lucide-react';
import { Customer } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { useTranslation } from 'react-i18next';
import { useTransliteration } from '@/utils/transliterate';

interface CustomerCardProps {
  customer: Customer;
  onClick?: () => void;
  selected?: boolean;
  showContainerCount?: boolean;
  onReturnContainer?: (e: React.MouseEvent) => void;
  lastOrderStats?: {
    bottles: number;
    jugs: number;
    isPaid: boolean;
    total: number;
  } | null;
}

export function CustomerCard({ customer, onClick, selected, showContainerCount, onReturnContainer, lastOrderStats }: CustomerCardProps) {
  const { t } = useTranslation();
  const name = useTransliteration(customer.name);
  const address = useTransliteration(customer.address);

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
            <h3 className="font-semibold text-foreground truncate">{name}</h3>
            <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
              <Phone className="w-4 h-4 flex-shrink-0" />
              <span>{customer.phone}</span>
            </div>
            <div className="flex items-start gap-1.5 mt-1 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span className="line-clamp-2">{address}</span>
            </div>
            {showContainerCount && (customer.containers_held > 0) && (
              <div className="mt-2 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center px-2 py-1 rounded bg-amber-100 text-amber-800 text-xs font-medium">
                    {t(customer.containers_held === 1 ? 'cards.container_pending' : 'cards.containers_pending', { count: customer.containers_held })}
                  </div>
                  {onReturnContainer && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs border-amber-200 hover:bg-amber-50 text-amber-900"
                      onClick={(e) => {
                        e.stopPropagation();
                        onReturnContainer(e);
                      }}
                    >
                      {t('cards.return_1')}
                    </Button>
                  )}
                </div>
                {/* Show last order context if available to help identify what is pending */}
                {/* Only show if we have pending containers */}
                {lastOrderStats && (
                  <div className="text-xs text-muted-foreground bg-secondary/50 p-2 rounded">
                    <div className="flex justify-between items-center mb-1">
                      <span>Latest Order:</span>
                      <span className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded font-bold uppercase",
                        lastOrderStats.isPaid ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                      )}>
                        {lastOrderStats.isPaid ? "PAID" : "PENDING"}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {lastOrderStats.bottles > 0 && <span>{lastOrderStats.bottles} Bottles</span>}
                      {lastOrderStats.jugs > 0 && <span>{lastOrderStats.jugs} Jugs</span>}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {onClick && (
          <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-3" />
        )}
      </div>
    </button>
  );
}
