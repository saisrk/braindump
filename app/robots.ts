import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/pricing', '/login', '/signup', '/onboarding'],
        // Block all auth-protected app routes — useless in search results
        disallow: [
          '/home',
          '/library',
          '/review',
          '/teachback',
          '/express',
          '/capture',
          '/settings',
          '/billing',
          '/api/',
        ],
      },
    ],
    sitemap: 'https://brain-dump.co/sitemap.xml',
  };
}
