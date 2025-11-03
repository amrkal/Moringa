'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: string;
  is_verified: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  phoneNumber: string | null;
  setPhoneNumber: (phone: string) => void;
  logout: () => void;
  verifyPhone: (userData: User, token: string) => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [phoneNumber, setPhoneNumberState] = useState<string | null>(null);

  useEffect(() => {
    // Check localStorage for existing auth
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setPhoneNumberState(parsedUser.phone);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Failed to parse user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }

    // Listen for logout events from API interceptor
    const handleLogout = () => {
      setIsAuthenticated(false);
      setPhoneNumberState(null);
      setUser(null);
    };

    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  const setPhoneNumber = (phone: string) => {
    setPhoneNumberState(phone);
  };

  const verifyPhone = (userData: User, token: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setPhoneNumberState(userData.phone);
    setIsAuthenticated(true);
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setPhoneNumberState(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        phoneNumber,
        setPhoneNumber,
        logout,
        verifyPhone,
        updateUser,
      }}
    >
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
