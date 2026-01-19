import { Droplets, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-4">
      <div className="flex items-center justify-between max-w-md mx-auto">
        <div className="flex items-center gap-3">
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
        <div className="flex items-center gap-2">
          {user && (
            <span className="text-sm text-muted-foreground">{user.profile.name}</span>
          )}
          <Button variant="ghost" size="icon" onClick={handleSignOut}>
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
