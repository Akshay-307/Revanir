import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Clock } from 'lucide-react';

export default function PendingApproval() {
  const { signOut, user } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Clock className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
          <CardTitle className="text-2xl">Account Pending Approval</CardTitle>
          <CardDescription>
            Welcome, {user?.profile.name}! Your account is waiting for admin approval.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-6">
            Please contact your administrator to approve your account. You will be able to access the application once approved.
          </p>
          <Button onClick={signOut} variant="outline">
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}