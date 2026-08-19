import { ImageResponse } from 'next/og';
import { EVENT, formatCount } from '@/lib/event-facts';

// A purpose-built 1200x630 social card. The site previously advertised
// /assets/logo_STE.webp as 1200x630 — it is neither 1200x630 nor a format
// older WhatsApp/LinkedIn scrapers reliably decode.
export const alt = `${EVENT.name} — ${EVENT.dateLabelEn}, ${EVENT.venueShortEn}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '72px 80px',
          background:
            'linear-gradient(135deg, #050505 0%, #0d0a06 55%, #1a1208 100%)',
          color: '#F7F4EF',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 24,
            letterSpacing: 8,
            textTransform: 'uppercase',
            color: '#D6A066',
          }}
        >
          Surat Textile Exhibition
        </div>

        <div
          style={{
            display: 'flex',
            marginTop: 28,
            fontSize: 84,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: -2,
            color: '#FFFFFF',
          }}
        >
          India&apos;s Biggest Textile B2B Opportunity
        </div>

        <div
          style={{
            display: 'flex',
            marginTop: 32,
            width: 180,
            height: 6,
            background: 'linear-gradient(90deg, #B87333, #D4AF37, #FFD700)',
          }}
        />

        <div
          style={{
            display: 'flex',
            marginTop: 36,
            fontSize: 34,
            color: '#F0C48A',
          }}
        >
          {EVENT.dateLabelEn}  ·  {EVENT.venueShortEn}
        </div>

        <div
          style={{
            display: 'flex',
            marginTop: 20,
            fontSize: 28,
            color: 'rgba(247, 244, 239, 0.75)',
          }}
        >
          {EVENT.stalls}+ Stalls · {formatCount(EVENT.buyers)}+ Verified Buyers ·{' '}
          {EVENT.agents}+ Sourcing Agents
        </div>
      </div>
    ),
    size,
  );
}
