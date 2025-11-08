import type { Metadata, Viewport } from 'next';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: 'Admin Login | Moringa',
  description: 'Secure admin access to manage orders, meals, and customers.',
};

export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
