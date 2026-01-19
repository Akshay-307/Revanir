import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';

type AppRole = Database['public']['Enums']['app_role'];

interface PendingUser {
  id: string;
  user_id: string;
  name: string;
  phone: string | null;
  created_at: string;
}

export function useUserManagement() {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();

  // Get all users with roles
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      if (!isAdmin) throw new Error('Unauthorized');

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles(role)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  // Get pending users (profiles without roles)
  const { data: pendingUsers = [], isLoading: pendingLoading } = useQuery({
    queryKey: ['pending-users'],
    queryFn: async () => {
      if (!isAdmin) throw new Error('Unauthorized');

      // Get profiles that don't have roles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Get all user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id');

      if (rolesError) throw rolesError;

      const roleUserIds = new Set(roles.map(r => r.user_id));

      // Filter profiles without roles
      return profiles.filter(p => !roleUserIds.has(p.user_id)) as PendingUser[];
    },
    enabled: isAdmin,
  });

  const approveUserMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      if (!isAdmin) throw new Error('Unauthorized');

      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['pending-users'] });
    },
  });

  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      if (!isAdmin) throw new Error('Unauthorized');

      const { error } = await supabase
        .from('user_roles')
        .update({ role })
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      if (!isAdmin) throw new Error('Unauthorized');

      // Delete role first
      await supabase.from('user_roles').delete().eq('user_id', userId);

      // Delete profile
      const { error } = await supabase.from('profiles').delete().eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['pending-users'] });
    },
  });

  return {
    users,
    pendingUsers,
    isLoading: usersLoading || pendingLoading,
    approveUser: approveUserMutation.mutateAsync,
    updateUserRole: updateUserRoleMutation.mutateAsync,
    deleteUser: deleteUserMutation.mutateAsync,
  };
}