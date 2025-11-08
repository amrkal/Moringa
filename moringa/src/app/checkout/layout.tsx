import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Checkout - Complete Your Order",
  description: "Complete your order with secure payment options. Choose delivery, dine-in, or takeaway. Multiple payment methods supported including cash, card, and mobile money.",
  keywords: ["checkout", "payment", "order", "delivery", "takeaway", "dine-in", "secure checkout"],
  openGraph: {
    title: "Checkout | Moringa Restaurant",
    description: "Complete your order with secure payment options.",
    url: "/checkout",
    type: "website",
  },
  robots: {
    index: false, // Don't index checkout page
    follow: false,
  },
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
