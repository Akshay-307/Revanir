import { useState } from 'react';
import { Users, UserCheck, UserX, Shield, Clock } from 'lucide-react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUserManagement } from '@/hooks/useUserManagement';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Admin() {
  const { isAdmin } = useAuth();
  const { users, pendingUsers, isLoading, approveUser, updateUserRole, deleteUser } = useUserManagement();
  const [approvingUser, setApprovingUser] = useState<string | null>(null);

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <Shield className="w-16 h-16 mx-auto text-red-500 mb-4" />
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Admin access required</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const handleApproveUser = async (userId: string, role: 'admin' | 'staff') => {
    setApprovingUser(userId);
    try {
      await approveUser({ userId, role });
      toast.success('User approved successfully!');
    } catch (error) {
      toast.error('Failed to approve user');
    } finally {
      setApprovingUser(null);
    }
  };

  const handleUpdateRole = async (userId: string, role: 'admin' | 'staff') => {
    try {
      await updateUserRole({ userId, role });
      toast.success('User role updated successfully!');
    } catch (error) {
      toast.error('Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteUser(userId);
      toast.success('User deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Admin Panel" subtitle="Manage users and permissions" />

      <main className="px-4 py-6 max-w-md mx-auto space-y-6">
        {/* Pending Approvals */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-500" />
            Pending Approvals ({pendingUsers.length})
          </h2>

          {pendingUsers.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <UserCheck className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No pending approvals</h3>
                  <p className="text-muted-foreground text-sm">
                    All registration requests have been processed.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {pendingUsers.map((user) => (
                <Card key={user.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{user.name}</h3>
                        <p className="text-sm text-muted-foreground">{user.phone}</p>
                        <p className="text-xs text-muted-foreground">
                          Registered: {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApproveUser(user.user_id, 'staff')}
                          disabled={approvingUser === user.user_id}
                        >
                          <UserCheck className="w-4 h-4" />
                          Approve Staff
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApproveUser(user.user_id, 'admin')}
                          disabled={approvingUser === user.user_id}
                        >
                          <Shield className="w-4 h-4" />
                          Approve Admin
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteUser(user.user_id)}
                          disabled={approvingUser === user.user_id}
                        >
                          <UserX className="w-4 h-4" />
                          Deny
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* User Management */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            User Management ({users.length})
          </h2>

          {users.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Users className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No users found</h3>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {users.map((user) => {
                const role = user.user_roles?.[0]?.role;
                return (
                  <Card key={user.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{user.name}</h3>
                            <Badge variant={role === 'admin' ? 'default' : 'secondary'}>
                              {role || 'No Role'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{user.phone}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {role && (
                            <Select
                              value={role}
                              onValueChange={(newRole: 'admin' | 'staff') =>
                                handleUpdateRole(user.user_id, newRole)
                              }
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="staff">Staff</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteUser(user.user_id)}
                          >
                            <UserX className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}