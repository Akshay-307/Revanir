import { Droplets } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-4">
      <div className="flex items-center gap-3 max-w-md mx-auto">
        <div className="w-10 h-10 rounded-xl water-gradient flex items-center justify-center shadow-md">
          <Droplets className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
    </header>
  );
}
