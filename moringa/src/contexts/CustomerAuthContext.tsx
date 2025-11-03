'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface CustomerUser {
  id: string;
  name?: string;
  phone: string;
  email?: string;
  is_verified: boolean;
}

interface CustomerAuthContextType {
  customer: CustomerUser | null;
  isCustomerAuthenticated: boolean;
  verifyCustomer: (userData: CustomerUser, token: string) => void;
  logoutCustomer: () => void;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

export function CustomerAuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<CustomerUser | null>(null);
  const [isCustomerAuthenticated, setIsCustomerAuthenticated] = useState(false);

  useEffect(() => {
    // Check localStorage for existing customer auth (separate from admin)
    const token = localStorage.getItem('customerToken');
    const userData = localStorage.getItem('customerUser');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setCustomer(parsedUser);
        setIsCustomerAuthenticated(true);
      } catch (error) {
        console.error('Failed to parse customer data:', error);
        localStorage.removeItem('customerToken');
        localStorage.removeItem('customerUser');
      }
    }
  }, []);

  const verifyCustomer = (userData: CustomerUser, token: string) => {
    setCustomer(userData);
    setIsCustomerAuthenticated(true);
    localStorage.setItem('customerToken', token);
    localStorage.setItem('customerUser', JSON.stringify(userData));
  };

  const logoutCustomer = () => {
    setCustomer(null);
    setIsCustomerAuthenticated(false);
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customerUser');
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        isCustomerAuthenticated,
        verifyCustomer,
        logoutCustomer,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (context === undefined) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return context;
}
