import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Innovator' | 'Investor' | 'Manufacturer' | 'Admin';
  country: string;
  avatar: string;
  bio: string;
  company?: string;
  verified: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Auto-load user on mount
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const currentUser = authService.getCurrentUser();
      if (currentUser && authService.isAuthenticated()) {
        const isValid = await authService.verifyToken();
        if (isValid) {
          setUser(currentUser);
        } else {
          await authService.logout();
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      await authService.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      setUser(response.user);
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  };

  const register = async (data: any) => {
    try {
      const response = await authService.register(data);
      setUser(response.user);
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Clear local state anyway
      setUser(null);
    }
  };

  const updateUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem('currentUser', JSON.stringify(userData));
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user && authService.isAuthenticated(),
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
