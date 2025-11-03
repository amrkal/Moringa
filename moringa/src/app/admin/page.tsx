'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/admin/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'ADMIN') {
      router.push('/');
      return;
    }

    // Redirect to dashboard
    router.push('/admin/dashboard');
  }, [router]);

  return (
  <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center">
  <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[hsl(var(--warning))]"></div>
    </div>
  );
}