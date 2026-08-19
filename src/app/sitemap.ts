import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  return [
    {
      url: SITE_URL,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/privacy-policy`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms-of-service`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
  ];
}
