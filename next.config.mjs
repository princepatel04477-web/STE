import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  productionBrowserSourceMaps: false,
  compress: true,
  images: {
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  headers: async () => [
    {
      source: "/assets/:path*",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
      ],
    },
  ],
  redirects: async () => [
    // STE-08 — common short paths that exhibitors type from brochures / WhatsApp
    { source: "/exhibitor",  destination: "/exhibitor/login", permanent: false },
    { source: "/login",      destination: "/exhibitor/login", permanent: false },
    { source: "/portal",     destination: "/exhibitor/login", permanent: false },
    { source: "/register",   destination: "/#buyer-registration", permanent: false },
  ],
};

export default nextConfig;
