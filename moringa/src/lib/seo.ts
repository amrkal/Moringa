/**
 * SEO Metadata Utilities
 * Generate dynamic meta tags for pages
 */

import { Metadata } from 'next';

interface SeoConfig {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  locale?: string;
  siteName?: string;
}

const defaultConfig = {
  siteName: 'Moringa Restaurant',
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://moringa-restaurant.com',
  defaultImage: '/og-image.jpg',
  twitterHandle: '@moringa',
  locale: 'en_US',
};

/**
 * Generate complete metadata for a page
 */
export function generateMetadata(config: SeoConfig): Metadata {
  const {
    title,
    description,
    keywords = [],
    image = defaultConfig.defaultImage,
    url,
    type = 'website',
    author,
    publishedTime,
    modifiedTime,
    locale = defaultConfig.locale,
    siteName = defaultConfig.siteName,
  } = config;

  const fullTitle = `${title} | ${siteName}`;
  const fullUrl = url ? `${defaultConfig.baseUrl}${url}` : defaultConfig.baseUrl;
  const imageUrl = image.startsWith('http') ? image : `${defaultConfig.baseUrl}${image}`;

  return {
    title: fullTitle,
    description,
    keywords: keywords.join(', '),
    authors: author ? [{ name: author }] : undefined,
    
    // Open Graph
    openGraph: {
      title: fullTitle,
      description,
      url: fullUrl,
      siteName,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale,
      type,
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },

    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [imageUrl],
      creator: defaultConfig.twitterHandle,
      site: defaultConfig.twitterHandle,
    },

    // Robots
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    // Alternate languages
    alternates: {
      canonical: fullUrl,
      languages: {
        'en-US': `${fullUrl}?lang=en`,
        'ar-SA': `${fullUrl}?lang=ar`,
        'he-IL': `${fullUrl}?lang=he`,
      },
    },
  };
}

/**
 * Home page metadata
 */
export const homeMetadata = generateMetadata({
  title: 'Home - Delicious Food Delivered',
  description: 'Order delicious meals from Moringa Restaurant. Fresh ingredients, authentic flavors, and fast delivery. Browse our menu and place your order today!',
  keywords: ['restaurant', 'food delivery', 'online ordering', 'moringa', 'meals', 'delivery', 'takeaway'],
  url: '/',
});

/**
 * Menu page metadata
 */
export const menuMetadata = generateMetadata({
  title: 'Our Menu - Explore Delicious Dishes',
  description: 'Discover our wide selection of delicious meals. From appetizers to desserts, we have something for everyone. Browse categories and order online now!',
  keywords: ['menu', 'food', 'meals', 'dishes', 'restaurant menu', 'online menu', 'delivery menu'],
  url: '/menu',
});

/**
 * Cart page metadata
 */
export const cartMetadata = generateMetadata({
  title: 'Your Cart',
  description: 'Review your selected items and proceed to checkout. Fast and secure payment options available.',
  keywords: ['cart', 'shopping cart', 'checkout', 'order'],
  url: '/cart',
});

/**
 * Checkout page metadata
 */
export const checkoutMetadata = generateMetadata({
  title: 'Checkout - Complete Your Order',
  description: 'Complete your order with secure payment options. Choose delivery, dine-in, or takeaway.',
  keywords: ['checkout', 'payment', 'order', 'delivery', 'takeaway'],
  url: '/checkout',
});

/**
 * Orders page metadata
 */
export const ordersMetadata = generateMetadata({
  title: 'Your Orders - Track Order Status',
  description: 'View your order history and track current orders. Get real-time updates on your delivery.',
  keywords: ['orders', 'order history', 'track order', 'order status'],
  url: '/orders',
});

/**
 * Generate meal-specific metadata
 */
export function generateMealMetadata(meal: {
  name: string;
  description?: string;
  price: number;
  image?: string;
  category?: string;
}): Metadata {
  return generateMetadata({
    title: `${meal.name} - Order Now`,
    description: meal.description || `Order ${meal.name} from Moringa Restaurant. Price: $${meal.price.toFixed(2)}. Fresh, delicious, and delivered fast!`,
    keywords: ['meal', 'food', meal.name.toLowerCase(), meal.category?.toLowerCase() || '', 'order online'],
    image: meal.image,
    type: 'website',
    url: `/menu#${meal.name.toLowerCase().replace(/\s+/g, '-')}`,
  });
}

/**
 * Generate category-specific metadata
 */
export function generateCategoryMetadata(category: {
  name: string;
  description?: string;
  image?: string;
}): Metadata {
  return generateMetadata({
    title: `${category.name} - Menu Category`,
    description: category.description || `Browse our ${category.name} menu. Order delicious meals from this category with fast delivery!`,
    keywords: ['category', 'menu', category.name.toLowerCase(), 'food', 'meals'],
    image: category.image,
    url: `/menu?category=${category.name.toLowerCase()}`,
  });
}

/**
 * JSON-LD structured data generator
 */
export function generateRestaurantSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: defaultConfig.siteName,
    description: 'Fresh, delicious food delivered to your door',
    url: defaultConfig.baseUrl,
    logo: `${defaultConfig.baseUrl}/logo.jpg`,
    image: `${defaultConfig.baseUrl}${defaultConfig.defaultImage}`,
    servesCuisine: ['International', 'Mediterranean', 'Vegetarian'],
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'US',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '08:00',
        closes: '22:00',
      },
    ],
    acceptsReservations: 'True',
    hasMenu: `${defaultConfig.baseUrl}/menu`,
  };
}

/**
 * Generate breadcrumb schema
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${defaultConfig.baseUrl}${item.url}`,
    })),
  };
}

/**
 * Generate product (meal) schema
 */
export function generateMealSchema(meal: {
  name: string;
  description?: string;
  price: number;
  image?: string;
  category?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: meal.name,
    description: meal.description || meal.name,
    image: meal.image ? `${defaultConfig.baseUrl}${meal.image}` : undefined,
    offers: {
      '@type': 'Offer',
      price: meal.price,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: `${defaultConfig.baseUrl}/menu`,
    },
    category: meal.category,
  };
}
