import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.stesurat.com';
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/*?_rsc=', // Block crawlers from scanning Next.js dynamic routing JSON payloads
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
