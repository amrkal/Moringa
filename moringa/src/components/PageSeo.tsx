'use client';

import Head from 'next/head';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';

interface PageSeoProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  type?: 'website' | 'article' | 'product';
}

const defaultConfig = {
  siteName: 'Moringa Restaurant',
  baseUrl: typeof window !== 'undefined' ? window.location.origin : 'https://moringa-restaurant.com',
  defaultImage: '/og-image.jpg',
  twitterHandle: '@moringa',
};

export function PageSeo({
  title = 'Moringa Restaurant',
  description = 'Order delicious meals from Moringa Restaurant. Fresh ingredients, authentic flavors, and fast delivery.',
  keywords = ['restaurant', 'food delivery', 'online ordering', 'moringa'],
  image = defaultConfig.defaultImage,
  type = 'website',
}: PageSeoProps) {
  const pathname = usePathname();
  const { language } = useLanguage();

  const fullTitle = `${title} | ${defaultConfig.siteName}`;
  const fullUrl = `${defaultConfig.baseUrl}${pathname}`;
  const imageUrl = image.startsWith('http') ? image : `${defaultConfig.baseUrl}${image}`;

  // Structured data
  const restaurantSchema = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: defaultConfig.siteName,
    description: 'Fresh, delicious food delivered to your door',
    url: defaultConfig.baseUrl,
    logo: `${defaultConfig.baseUrl}/logo.jpg`,
    image: imageUrl,
    servesCuisine: ['International', 'Mediterranean', 'Vegetarian'],
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'US',
    },
  };

  return (
    <>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      {keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:site_name" content={defaultConfig.siteName} />
      <meta property="og:locale" content={language === 'ar' ? 'ar_SA' : language === 'he' ? 'he_IL' : 'en_US'} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={imageUrl} />
      <meta property="twitter:creator" content={defaultConfig.twitterHandle} />

      {/* Additional Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#ea580c" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <link rel="canonical" href={fullUrl} />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantSchema) }}
      />
    </>
  );
}
