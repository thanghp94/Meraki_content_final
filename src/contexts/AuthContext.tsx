'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService, type User, type UserRole } from '@/lib/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  canAccessAdmin: () => boolean;
  canCreateContent: () => boolean;
  canPlayGames: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize auth state from storage
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    const result = authService.login(username, password);
    if (result.success && result.user) {
      setUser(result.user);
      return { success: true };
    }
    return { success: false, error: result.error };
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const hasRole = (role: UserRole) => {
    return authService.hasRole(role);
  };

  const hasAnyRole = (roles: UserRole[]) => {
    return authService.hasAnyRole(roles);
  };

  const canAccessAdmin = () => {
    return authService.canAccessAdmin();
  };

  const canCreateContent = () => {
    return authService.canCreateContent();
  };

  const canPlayGames = () => {
    return authService.canPlayGames();
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    hasRole,
    hasAnyRole,
    canAccessAdmin,
    canCreateContent,
    canPlayGames,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
