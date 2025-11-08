import type { Metadata, Viewport } from 'next';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "Our Menu - Explore Delicious Dishes",
  description: "Discover our wide selection of delicious meals. From appetizers to desserts, we have something for everyone. Browse categories and order online now! Vegetarian, vegan, and gluten-free options available.",
  keywords: ["menu", "food", "meals", "dishes", "restaurant menu", "online menu", "delivery menu", "vegetarian", "vegan", "gluten-free"],
  openGraph: {
    title: "Our Menu - Explore Delicious Dishes | Moringa Restaurant",
    description: "Discover our wide selection of delicious meals. Browse categories and order online now!",
    url: "/menu",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Our Menu - Explore Delicious Dishes | Moringa Restaurant",
    description: "Discover our wide selection of delicious meals. Browse categories and order online now!",
  },
};

export default function MenuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
