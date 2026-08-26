'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Store, MapPin, Ruler, Phone, Lock, X, Tag } from 'lucide-react';
import FloorPlan2026 from '@/components/stallmap/FloorPlan2026';
import { STALL_MAP_2026, getStall } from '@/data/stallMap2026';
import {
  ALLOTMENTS_2026,
  Allotment2026,
  SAREE_POOL_STALLS,
  SPLIT_BAYS_2026,
} from '@/data/stallAllotment2026';

const SIZE_ORDER = [
  '3m x 3m',
  '3m x 6m',
  '3m x 9m',
  '3m x 12m',
  '3m x 18m',
  '3m x 24m',
  '3m x 30m',
  '3m x 36m',
  '30m x 6m',
  '42m x 6m',
];

type PoolFilter = 'all' | 'Saree' | 'General' | 'held';

export default function StallMapDemoPage() {
  const [query, setQuery] = useState('');
  const [pool, setPool] = useState<PoolFilter>('all');
  const [size, setSize] = useState('');
  const [trade, setTrade] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);

  const byUnit = useMemo(() => {
    const map = new Map<string, Allotment2026>();
    for (const a of ALLOTMENTS_2026) map.set(a.unitId.toUpperCase(), a);
    return map;
  }, []);

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    return ALLOTMENTS_2026.filter((a) => {
      if (pool === 'held' && !a.held) return false;
      if (pool !== 'all' && pool !== 'held' && a.pool !== pool) return false;
      if (size && a.sheetSize !== size) return false;
      if (trade && a.group !== trade) return false;
      if (!term) return true;
      return (
        a.brand.toLowerCase().includes(term) ||
        a.category.toLowerCase().includes(term) ||
        a.unitId.toLowerCase() === term ||
        a.group.toLowerCase().includes(term) ||
        a.mobile.includes(term)
      );
    }).sort((a, b) => a.brand.localeCompare(b.brand));
  }, [query, pool, size, trade]);

  const visibleUnitIds = useMemo(
    () =>
      results.length === ALLOTMENTS_2026.length
        ? null
        : new Set(results.map((a) => a.unitId)),
    [results]
  );

  const selected = selectedUnit ? byUnit.get(selectedUnit.toUpperCase()) ?? null : null;

  const tradeCounts = useMemo(() => {
    const c = new Map<string, number>();
    for (const a of ALLOTMENTS_2026) c.set(a.group, (c.get(a.group) ?? 0) + 1);
    return [...c.entries()].sort((x, y) => y[1] - x[1]);
  }, []);

  const sizeCounts = useMemo(() => {
    const c = new Map<string, number>();
    for (const a of ALLOTMENTS_2026) c.set(a.sheetSize, (c.get(a.sheetSize) ?? 0) + 1);
    return c;
  }, []);

  return (
    <main className="min-h-screen bg-expo-midnight text-expo-warm">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-expo-midnight/95 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3">
          <Link
            href="/"
            className="p-2 -ml-2 rounded-lg hover:bg-white/10 active:bg-white/15"
            aria-label="Back to home"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="font-serif text-lg sm:text-2xl leading-tight truncate">
              Stall Map &amp; Allotment
            </h1>
            <p className="text-[11px] sm:text-xs text-expo-warm/50">
              STE 2026 &middot; {ALLOTMENTS_2026.length} exhibitors &middot;{' '}
              {STALL_MAP_2026.length} stalls
            </p>
          </div>
          <span className="shrink-0 rounded-full border border-expo-gold/40 bg-expo-gold/10 px-2.5 py-1 text-[10px] sm:text-xs font-semibold tracking-wide text-expo-champagne">
            DEMO
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-5 space-y-5">
        <p className="text-sm text-expo-warm/60 max-w-2xl">
          The floor is laid out trade by trade: inside any one stall size, every
          brand of a trade sits in one unbroken run, so kurti never backs onto
          menswear. Saree, lehenga and uniform-saree brands draw from stalls
          1&ndash;107 (less 27, 28, 29); everyone else takes the south hall and those
          three blocks. A live draw shuffles brands inside their own trade block and
          never across blocks &mdash; this page shows a seeded sample, not a live result.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          <Stat value={ALLOTMENTS_2026.filter((a) => a.pool === 'Saree').length} label="Saree brands" />
          <Stat value={ALLOTMENTS_2026.filter((a) => a.pool === 'General').length} label="Other brands" />
          <Stat value={SAREE_POOL_STALLS.length} label="Saree pool stalls" />
          <Stat value={SPLIT_BAYS_2026.length} label="Bays split A/B" />
        </div>

        <FloorPlan2026
          selectedUnitId={selectedUnit}
          visibleUnitIds={visibleUnitIds}
          onSelect={(id) => setSelectedUnit(id)}
          compact={Boolean(selected)}
        />

        {selected && <ProfileCard allotment={selected} onClose={() => setSelectedUnit(null)} />}

        <section className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <label className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-expo-warm/40" />
              <input
                type="search"
                inputMode="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Brand, stall number or mobile"
                aria-label="Search exhibitors"
                className="w-full rounded-xl border border-white/15 bg-black/40 py-3 pl-9 pr-3 text-base sm:text-sm placeholder:text-expo-warm/35 focus:border-expo-gold/60 focus:outline-none"
              />
            </label>
            <select
              value={trade}
              onChange={(e) => setTrade(e.target.value)}
              aria-label="Filter by trade"
              className="rounded-xl border border-white/15 bg-black/40 py-3 px-3 text-base sm:text-sm focus:border-expo-gold/60 focus:outline-none"
            >
              <option value="">All trades</option>
              {tradeCounts.map(([g, n]) => (
                <option key={g} value={g}>
                  {g} &middot; {n}
                </option>
              ))}
            </select>
            <select
              value={size}
              onChange={(e) => setSize(e.target.value)}
              aria-label="Filter by stall size"
              className="rounded-xl border border-white/15 bg-black/40 py-3 px-3 text-base sm:text-sm focus:border-expo-gold/60 focus:outline-none"
            >
              <option value="">All sizes</option>
              {SIZE_ORDER.filter((s) => sizeCounts.has(s)).map((s) => (
                <option key={s} value={s}>
                  {s} &middot; {sizeCounts.get(s)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
            {(
              [
                ['all', 'All'],
                ['Saree', 'Saree pool'],
                ['General', 'General pool'],
                ['held', 'Held'],
              ] as [PoolFilter, string][]
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setPool(value)}
                aria-pressed={pool === value}
                className={`shrink-0 rounded-full border px-3.5 py-2 text-xs font-medium transition ${
                  pool === value
                    ? 'border-expo-gold bg-expo-gold text-expo-midnight'
                    : 'border-white/15 text-expo-warm/70 hover:border-white/35'
                }`}
              >
                {label}
              </button>
            ))}
            <span className="shrink-0 self-center pl-1 text-xs tabular-nums text-expo-warm/45">
              {results.length} of {ALLOTMENTS_2026.length}
            </span>
          </div>

          <ul className="divide-y divide-white/8 rounded-2xl border border-white/10 overflow-hidden">
            {results.map((a) => {
              const active = selected?.unitId === a.unitId;
              return (
                <li key={a.unitId}>
                  <button
                    type="button"
                    onClick={() => setSelectedUnit(a.unitId)}
                    className={`w-full text-left px-3.5 py-3 flex items-center gap-3 transition ${
                      active ? 'bg-expo-gold/12' : 'hover:bg-white/5 active:bg-white/8'
                    }`}
                  >
                    <span
                      className={`shrink-0 min-w-[3rem] rounded-lg px-2 py-1.5 text-center text-sm font-bold tabular-nums ${
                        a.held
                          ? 'bg-expo-copper/30 text-expo-champagne'
                          : a.pool === 'Saree'
                          ? 'bg-expo-gold/20 text-expo-champagne'
                          : 'bg-white/10 text-expo-warm/80'
                      }`}
                    >
                      {a.unitId}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{a.brand}</span>
                      <span className="block truncate text-xs text-expo-warm/50">
                        {a.group} &middot; {a.sheetSize}
                        {a.held && ' · held'}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
            {results.length === 0 && (
              <li className="px-4 py-8 text-center text-sm text-expo-warm/50">
                No exhibitor matches that. Try a brand name or a stall number.
              </li>
            )}
          </ul>
        </section>
      </div>
    </main>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5">
      <p className="font-serif text-xl sm:text-2xl tabular-nums text-expo-champagne">{value}</p>
      <p className="text-[11px] text-expo-warm/50 leading-tight">{label}</p>
    </div>
  );
}

function ProfileCard({
  allotment,
  onClose,
}: {
  allotment: Allotment2026;
  onClose: () => void;
}) {
  const stall = getStall(allotment.stallNumber);
  const isHalf = /[AB]$/.test(allotment.unitId);
  return (
    <section className="rounded-2xl border border-expo-gold/30 bg-gradient-to-b from-expo-gold/10 to-transparent p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-widest text-expo-champagne/70">
            {allotment.held ? 'Held before the draw' : 'Allotted'}
          </p>
          <h2 className="font-serif text-xl sm:text-2xl leading-tight mt-0.5 break-words">
            {allotment.brand}
          </h2>
          <p className="text-sm text-expo-warm/60 mt-0.5">{allotment.category}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close profile"
          className="p-2 -mr-1 -mt-1 rounded-lg hover:bg-white/10 active:bg-white/15"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        <Field icon={Store} label="Stall" value={allotment.unitId} big />
        <Field icon={Ruler} label="Size" value={`${allotment.sheetSize}`} sub={`${allotment.areaSqft} sq ft`} />
        <Field icon={Tag} label="Trade" value={allotment.group} sub={allotment.category} />
        <Field icon={MapPin} label="Zone" value={allotment.zone} sub={`${allotment.pool} pool`} />
        <Field
          icon={allotment.mobile ? Phone : Lock}
          label={allotment.mobile ? 'Mobile' : 'Login'}
          value={allotment.mobile || 'Username only'}
          sub={allotment.mobile ? undefined : 'no mobile on file'}
        />
      </div>

      {isHalf && stall && (
        <p className="mt-3 text-xs text-expo-warm/55">
          This is one half of 200 sq ft bay {stall.stallNumber}, split into{' '}
          {stall.halves?.map((h) => h.id).join(' and ')}. Only the bays the saree pool
          needed were split; every other bay is whole.
        </p>
      )}
      {stall?.legacyNumber && (
        <p className="mt-3 text-xs text-expo-warm/55">
          Printed as <span className="tabular-nums">{stall.legacyNumber}</span> on the
          older plan.
        </p>
      )}
    </section>
  );
}

function Field({
  icon: Icon,
  label,
  value,
  sub,
  big = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
  big?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5">
      <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-expo-warm/45">
        <Icon className="w-3 h-3" />
        {label}
      </p>
      <p
        className={`mt-1 break-words ${
          big ? 'font-serif text-2xl text-expo-champagne tabular-nums' : 'text-sm font-medium'
        }`}
      >
        {value}
      </p>
      {sub && <p className="text-[11px] text-expo-warm/45">{sub}</p>}
    </div>
  );
}
