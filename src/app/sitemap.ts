import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

/**
 * Static date constants per route — do NOT use `new Date()` here.
 * `new Date()` at build time tells Google every page changed on every deploy,
 * which it ignores after the first few times. Use a real date when the content
 * last changed. Update manually when you publish a significant content change.
 */
const DATES = {
  home:          new Date('2026-08-26'),
  register:      new Date('2026-08-26'), // buyer registration always hot
  exhibitorLogin: new Date('2026-06-01'), // portal UX, rarely changes
  privacy:       new Date('2026-05-23'),
  terms:         new Date('2026-05-23'),
  faq:           new Date('2026-08-01'),
  venue:         new Date('2026-07-15'),
  categories:    new Date('2026-08-01'),
  exhibit:       new Date('2026-08-01'),
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return [
    {
      url: SITE_URL,
      lastModified: DATES.home,
      changeFrequency: 'weekly' as const,
      priority: 1.0,
    },
    {
      // Canonical anchor to buyer registration — helps with "/#buyer-registration" indexing
      url: `${SITE_URL}/#buyer-registration`,
      lastModified: DATES.register,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      // Exhibitor login — deliberately included so Google knows it exists and
      // can follow links FROM it, but page metadata marks it noindex so it
      // won't appear in search results itself.
      url: `${SITE_URL}/exhibitor/login`,
      lastModified: DATES.exhibitorLogin,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/privacy-policy`,
      lastModified: DATES.privacy,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms-of-service`,
      lastModified: DATES.terms,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
  ];
}
