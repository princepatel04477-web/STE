import { MetadataRoute } from 'next';
import { SITE_URL, IS_PRODUCTION_SITE } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  // Preview deployments must never be indexed — they used to compete with the
  // real domain for the same content.
  if (!IS_PRODUCTION_SITE) {
    return { rules: [{ userAgent: '*', disallow: '/' }] };
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          // /exhibitor/login is kept out of search results via `noindex` metadata
          // on that page, NOT via robots disallow. A disallow here also blocks
          // WhatsApp and LinkedIn from generating link previews when exhibitors
          // receive their portal URL directly.
          '/*?_rsc=', // Block Next.js RSC JSON payloads from being indexed
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
