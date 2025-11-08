import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Your Orders - Track Order Status",
  description: "View your order history and track current orders. Get real-time updates on your delivery status and estimated arrival time.",
  keywords: ["orders", "order history", "track order", "order status", "order tracking", "delivery status"],
  openGraph: {
    title: "Your Orders | Moringa Restaurant",
    description: "View your order history and track current orders.",
    url: "/orders",
    type: "website",
  },
  robots: {
    index: false, // Don't index orders page (requires auth)
    follow: false,
  },
};

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
