'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to menu page immediately
    router.replace('/menu');
  }, [router]);

  return (
  <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}
