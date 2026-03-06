import { useState, useCallback, useMemo } from 'react';
import type { User, Permission } from '../types/user';
import { mockUsers } from '../types/user';

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<User | null>(mockUsers[0]); // Default to admin user

  const login = useCallback((email: string, password: string) => {
    // Mock login - in real app would call API
    const user = mockUsers.find(u => u.email === email);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const updateCurrentUser = useCallback((updatedUser: User) => {
    setCurrentUser(updatedUser);
  }, []);

  const hasPermission = useCallback((resource: string, action: string) => {
    if (!currentUser) return false;
    
    return currentUser.roles.some(role =>
      role.permissions.some(permission =>
        permission.resource === resource && permission.action === action
      )
    );
  }, [currentUser]);

  const isAdmin = useMemo(() => {
    return currentUser?.roles.some(role => role.id === 'admin') ?? false;
  }, [currentUser]);

  const canAccessAdminSettings = useMemo(() => {
    return hasPermission('system', 'admin');
  }, [hasPermission]);

  const canManageUsers = useMemo(() => {
    return hasPermission('users', 'admin');
  }, [hasPermission]);

  const canViewMetrics = useMemo(() => {
    return hasPermission('metrics', 'read');
  }, [hasPermission]);

  const canCreateEnvironments = useMemo(() => {
    return hasPermission('environments', 'write');
  }, [hasPermission]);

  const canDeleteEnvironments = useMemo(() => {
    return hasPermission('environments', 'delete');
  }, [hasPermission]);

  const canViewAuditLog = useMemo(() => {
    return hasPermission('audit', 'read');
  }, [hasPermission]);

  return {
    currentUser,
    login,
    logout,
    updateCurrentUser,
    hasPermission,
    isAdmin,
    canAccessAdminSettings,
    canManageUsers,
    canViewMetrics,
    canCreateEnvironments,
    canDeleteEnvironments,
    canViewAuditLog,
    isAuthenticated: !!currentUser
  };
}