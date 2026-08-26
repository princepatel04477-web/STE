'use client';

import React, { useMemo, useRef, useState } from 'react';
import { Minus, Plus, Maximize2 } from 'lucide-react';
import { STALL_MAP_2026, Stall2026 } from '@/data/stallMap2026';
import {
  ALLOTMENTS_2026,
  SAREE_POOL_STALLS,
  SPLIT_BAYS_2026,
} from '@/data/stallAllotment2026';

/** One colour per trade, so a block of one trade reads as a band on the plan. */
const TRADE_COLOURS: Record<string, string> = {
  Saree: '#D6A066',
  Lehenga: '#C2557A',
  Blouses: '#8E6BB5',
  Kurti: '#4E93C4',
  Suits: '#3F9E8C',
  'Dress Material & Fabrics': '#8AA84A',
  'Kids Wear': '#D08A3E',
  "Men's Wear": '#B5563C',
  'Ethnic & Poshak': '#9C7BC7',
  'Home & Other': '#7C8794',
};

const TRADE_BY_UNIT = new Map(ALLOTMENTS_2026.map((a) => [a.unitId, a.group]));

/** The floor plan's own coordinate space, from the approved drawing. */
const VIEW_W = 841.92007;
const VIEW_H = 595.32;
/** The central 6M cross-aisle, drawn for orientation. */
const AISLE = { x: 34.68, y: 317.4, w: 766.8, h: 33.84 };

const SAREE = new Set(SAREE_POOL_STALLS);
const SPLIT = new Set(SPLIT_BAYS_2026);

type Unit = {
  id: string;
  stall: Stall2026;
  /** The unit's own size - a split half is 3M x 3M, not the bay's 6M x 3M. */
  size: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

/** Every addressable unit: a split bay contributes its two halves. */
function buildUnits(): Unit[] {
  const out: Unit[] = [];
  for (const stall of STALL_MAP_2026) {
    if (SPLIT.has(stall.stallNumber) && stall.halves) {
      for (const half of stall.halves) {
        out.push({
          id: half.id,
          stall,
          size: '3M x 3M',
          x: half.x,
          y: half.y,
          w: half.w,
          h: half.h,
        });
      }
    } else {
      out.push({
        id: String(stall.stallNumber),
        stall,
        size: stall.size,
        x: stall.x,
        y: stall.y,
        w: stall.w,
        h: stall.h,
      });
    }
  }
  return out;
}

function fillFor(unit: Unit, selected: boolean, dimmed: boolean, byTrade: boolean) {
  if (selected) return '#E5A96A';
  if (dimmed) return 'rgba(255,255,255,0.04)';
  if (byTrade) {
    const trade = TRADE_BY_UNIT.get(unit.id);
    return trade ? `${TRADE_COLOURS[trade] ?? '#7C8794'}55` : 'rgba(255,255,255,0.06)';
  }
  if (unit.stall.reservedFor) return 'rgba(184,115,51,0.42)';
  if (SAREE.has(unit.stall.stallNumber)) return 'rgba(214,160,102,0.20)';
  return 'rgba(255,255,255,0.10)';
}

export interface FloorPlan2026Props {
  /** Unit id to highlight, e.g. "76" or "107A". */
  selectedUnitId?: string | null;
  /** Unit ids to keep lit; everything else fades back. */
  visibleUnitIds?: Set<string> | null;
  onSelect?: (unitId: string) => void;
  /** Shorter frame, for use beside a profile card. */
  compact?: boolean;
}

export default function FloorPlan2026({
  selectedUnitId = null,
  visibleUnitIds = null,
  onSelect,
  compact = false,
}: FloorPlan2026Props) {
  const units = useMemo(buildUnits, []);
  const [zoom, setZoom] = useState(1);
  const [byTrade, setByTrade] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const selected = selectedUnitId
    ? units.find((u) => u.id.toUpperCase() === selectedUnitId.toUpperCase())
    : undefined;

  function reset() {
    setZoom(1);
    scrollRef.current?.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
  }

  /** Bring the highlighted stall into view once it changes. */
  React.useEffect(() => {
    if (!selected || !scrollRef.current) return;
    const box = scrollRef.current;
    const scale = (box.scrollWidth || 1) / VIEW_W;
    box.scrollTo({
      left: Math.max(0, (selected.x + selected.w / 2) * scale - box.clientWidth / 2),
      top: Math.max(0, (selected.y + selected.h / 2) * scale - box.clientHeight / 2),
      behavior: 'smooth',
    });
  }, [selected]);

  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10">
        <div className="flex rounded-lg border border-white/15 overflow-hidden">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(1, z / 1.4))}
            aria-label="Zoom out"
            className="px-2.5 py-1.5 text-expo-warm/80 hover:bg-white/10 active:bg-white/15 border-r border-white/15"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={reset}
            aria-label="Fit plan to screen"
            className="px-2.5 py-1.5 text-expo-warm/80 hover:bg-white/10 active:bg-white/15 border-r border-white/15"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(9, z * 1.4))}
            aria-label="Zoom in"
            className="px-2.5 py-1.5 text-expo-warm/80 hover:bg-white/10 active:bg-white/15"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
        <button
          type="button"
          onClick={() => setByTrade((v) => !v)}
          aria-pressed={byTrade}
          className={`shrink-0 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition ${
            byTrade
              ? 'border-expo-gold/60 text-expo-champagne'
              : 'border-white/15 text-expo-warm/60'
          }`}
        >
          Trade colours
        </button>
        <p className="text-[11px] sm:text-xs text-expo-warm/50 tabular-nums truncate">
          {selected
            ? `Stall ${selected.id} · ${selected.size} · ${selected.stall.zone}`
            : 'Tap a stall to identify it'}
        </p>
      </div>

      <div
        ref={scrollRef}
        className={`overflow-auto overscroll-contain ${
          compact ? 'max-h-[42vh] sm:max-h-[46vh]' : 'max-h-[58vh] sm:max-h-[66vh]'
        }`}
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          role="img"
          aria-label="STE 2026 floor plan"
          style={{ width: `${zoom * 100}%`, minWidth: '100%', height: 'auto', display: 'block' }}
        >
          <rect x={0} y={0} width={VIEW_W} height={VIEW_H} fill="#0B0B0B" />
          <rect
            x={AISLE.x}
            y={AISLE.y}
            width={AISLE.w}
            height={AISLE.h}
            fill="rgba(214,160,102,0.06)"
          />
          {units.map((u) => {
            const isSel = selected?.id === u.id;
            const dimmed = Boolean(visibleUnitIds && !visibleUnitIds.has(u.id) && !isSel);
            const label = u.id;
            const showLabel = zoom >= 2.2 || u.w * u.h > 900;
            return (
              <g
                key={u.id}
                onClick={() => onSelect?.(u.id)}
                style={{ cursor: onSelect ? 'pointer' : 'default' }}
              >
                <rect
                  x={u.x}
                  y={u.y}
                  width={u.w}
                  height={u.h}
                  fill={fillFor(u, isSel, dimmed, byTrade)}
                  stroke={isSel ? '#F7F4EF' : 'rgba(255,255,255,0.16)'}
                  strokeWidth={isSel ? 1.6 : 0.4}
                />
                {showLabel && !dimmed && (
                  <text
                    x={u.x + u.w / 2}
                    y={u.y + u.h / 2 + 2.2}
                    textAnchor="middle"
                    fontSize={u.w < 20 ? 5 : 6}
                    fontWeight={600}
                    fill={isSel ? '#0B0B0B' : 'rgba(247,244,239,0.72)'}
                  >
                    {label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-3 py-2 border-t border-white/10 text-[10px] sm:text-[11px] text-expo-warm/55">
        {byTrade ? (
          Object.entries(TRADE_COLOURS).map(([trade, colour]) => (
            <Key key={trade} colour={`${colour}88`} label={trade} />
          ))
        ) : (
          <>
            <Key colour="rgba(214,160,102,0.20)" label="Saree pool" />
            <Key colour="rgba(255,255,255,0.10)" label="General pool" />
            <Key colour="rgba(184,115,51,0.42)" label="Held" />
          </>
        )}
        <Key colour="#E5A96A" label="Selected" />
      </div>
    </div>
  );
}

function Key({ colour, label }: { colour: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="w-3 h-3 rounded-sm border border-white/20"
        style={{ background: colour }}
      />
      {label}
    </span>
  );
}
