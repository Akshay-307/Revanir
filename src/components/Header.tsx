import { Bell, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <header className="px-6 py-6 flex justify-between items-center bg-background/50 backdrop-blur-lg sticky top-0 z-50">
      <div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        <Button variant="ghost" size="icon" onClick={() => navigate('/reminders')} className="relative">
          <Bell className="w-5 h-5 text-muted-foreground" />
        </Button>
        {/* Removed theme toggle for now if it was causing issues, or keep if it was there */}
        {user && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:inline-block">{user.profile?.name}</span>
            <Button variant="ghost" size="icon" onClick={() => { signOut(); navigate('/login'); }} title={t('common.logout')}>
              <LogOut className="w-5 h-5 text-muted-foreground" />
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
