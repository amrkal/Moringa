import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Your Cart - Review Your Order",
  description: "Review your selected items and proceed to checkout. Fast and secure payment options available. Free delivery on orders over $30!",
  keywords: ["cart", "shopping cart", "checkout", "order", "review order"],
  openGraph: {
    title: "Your Cart | Moringa Restaurant",
    description: "Review your selected items and proceed to checkout.",
    url: "/cart",
    type: "website",
  },
  robots: {
    index: false, // Don't index cart page
    follow: true,
  },
};

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
