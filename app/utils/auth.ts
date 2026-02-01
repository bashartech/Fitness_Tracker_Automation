'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('fitness-token');
    const userData = localStorage.getItem('fitness-user');

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('fitness-token');
        localStorage.removeItem('fitness-user');
      }
    }

    setLoading(false);
  }, []);

  const login = (userData: any, token: string) => {
    localStorage.setItem('fitness-token', token);
    localStorage.setItem('fitness-user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('fitness-token');
    localStorage.removeItem('fitness-user');
    setUser(null);
    router.push('/login');
  };

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  };
}