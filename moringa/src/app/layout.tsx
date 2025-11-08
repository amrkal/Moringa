import type { Metadata, Viewport } from "next";
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
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SkipToContent } from "@/components/SkipToContent";
import { QueryProvider } from "@/components/QueryProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Moringa Restaurant - Order Delicious Food Online",
    template: "%s | Moringa Restaurant",
  },
  description: "Order fresh, delicious meals from Moringa Restaurant. Browse our menu, customize your order, and enjoy fast delivery or pickup. Vegetarian, vegan, and gluten-free options available.",
  keywords: ["restaurant", "food delivery", "online ordering", "moringa", "meals", "delivery", "takeaway", "vegetarian", "vegan", "gluten-free"],
  authors: [{ name: "Moringa Restaurant" }],
  creator: "Moringa Restaurant",
  publisher: "Moringa Restaurant",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Moringa Restaurant",
    title: "Moringa Restaurant - Order Delicious Food Online",
    description: "Order fresh, delicious meals from Moringa Restaurant. Browse our menu, customize your order, and enjoy fast delivery or pickup.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Moringa Restaurant",
      },
    ],
  },
  
  twitter: {
    card: "summary_large_image",
    title: "Moringa Restaurant - Order Delicious Food Online",
    description: "Order fresh, delicious meals from Moringa Restaurant. Browse our menu, customize your order, and enjoy fast delivery or pickup.",
    images: ["/og-image.jpg"],
    creator: "@moringa",
  },
  
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <ErrorBoundary>
          <SkipToContent />
          <QueryProvider>
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
                    className: 'toast-notification',
                    style: {
                      background: 'hsl(var(--card))',
                      color: 'hsl(var(--card-foreground))',
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
                        color: 'hsl(var(--card-foreground))',
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
                        color: 'hsl(var(--card-foreground))',
                        border: '1px solid rgb(239 68 68 / 0.2)',
                      },
                    },
                    loading: {
                      iconTheme: {
                        primary: 'hsl(var(--primary))',
                        secondary: 'hsl(var(--primary-foreground))',
                      },
                      style: {
                        background: 'hsl(var(--card))',
                        color: 'hsl(var(--card-foreground))',
                      },
                    },
                  }}
                />
              </CustomerAuthProvider>
            </AuthProvider>
          </LanguageProvider>
        </AccessibilityProvider>
        </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
