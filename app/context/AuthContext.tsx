'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  register: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in on initial load
    const token = localStorage.getItem('fitness-token');
    if (token) {
      // In a real app, you would verify the token with an API call
      // For now, we'll just check if it exists
      const storedUser = localStorage.getItem('fitness-user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    }
    setLoading(false);
  }, []);

  const register = async (name: string, email: string, password: string) => {
    try {
      const data = await authAPI.register({ name, email, password });

      // Save token and user to localStorage
      localStorage.setItem('fitness-token', data.token);
      localStorage.setItem('fitness-user', JSON.stringify(data.user));
      setUser(data.user);
      router.push('/dashboard'); // Redirect to dashboard after registration
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Registration failed');
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const data = await authAPI.login({ email, password });

      // Save token and user to localStorage
      localStorage.setItem('fitness-token', data.token);
      localStorage.setItem('fitness-user', JSON.stringify(data.user));
      setUser(data.user);
      router.push('/dashboard'); // Redirect to dashboard after login
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('fitness-token');
    localStorage.removeItem('fitness-user');
    setUser(null);
    router.push('/login'); // Redirect to login after logout
  };

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    isAuthenticated: !!user,
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