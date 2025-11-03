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
import { AccessibilityMenu } from "@/components/AccessibilityMenu";

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
                <div className="flex flex-col min-h-screen">
                  <Navigation />
                  <main className="flex-1 bg-background text-foreground pt-16">
                    {children}
                  </main>
                  <Footer />
                </div>
                <AccessibilityMenu />
                <Toaster position="top-right" />
              </CustomerAuthProvider>
            </AuthProvider>
          </LanguageProvider>
        </AccessibilityProvider>
      </body>
    </html>
  );
}
