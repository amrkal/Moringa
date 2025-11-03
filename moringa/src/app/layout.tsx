import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Toaster } from "react-hot-toast";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { CustomerAuthProvider } from "@/contexts/CustomerAuthContext";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { AccessibilityMenu } from "@/components/AccessibilityMenu";
import { RootLayoutContent } from "@/components/RootLayoutContent";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Moringa - Food Ordering System",
  description: "Order delicious meals from Moringa restaurant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <AccessibilityProvider>
          <LanguageProvider>
            <AuthProvider>
              <CustomerAuthProvider>
                <NotificationProvider>
                  <RootLayoutContent>
                    {children}
                  </RootLayoutContent>
                  <AccessibilityMenu />
                </NotificationProvider>
                <Toaster 
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: 'hsl(var(--card))',
                      color: 'hsl(var(--foreground))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '1rem',
                      padding: '1rem 1.25rem',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                    },
                    success: {
                      duration: 3000,
                      iconTheme: {
                        primary: 'hsl(var(--primary))',
                        secondary: 'hsl(var(--primary-foreground))',
                      },
                      style: {
                        background: 'hsl(var(--card))',
                        border: '1px solid rgb(34 197 94 / 0.2)',
                      },
                    },
                    error: {
                      duration: 5000,
                      iconTheme: {
                        primary: 'rgb(239 68 68)',
                        secondary: 'white',
                      },
                      style: {
                        background: 'hsl(var(--card))',
                        border: '1px solid rgb(239 68 68 / 0.2)',
                      },
                    },
                    loading: {
                      iconTheme: {
                        primary: 'hsl(var(--primary))',
                        secondary: 'hsl(var(--primary-foreground))',
                      },
                    },
                  }}
                />
              </CustomerAuthProvider>
            </AuthProvider>
          </LanguageProvider>
        </AccessibilityProvider>
      </body>
    </html>
  );
}
