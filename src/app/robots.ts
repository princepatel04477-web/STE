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
          '/exhibitor/',
          '/*?_rsc=', // Block crawlers from scanning Next.js dynamic routing JSON payloads
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
