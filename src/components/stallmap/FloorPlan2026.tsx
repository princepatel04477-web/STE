'use client';

import React, { useMemo, useRef, useState } from 'react';
import { Minus, Plus, Maximize2, Crosshair } from 'lucide-react';
import { STALL_MAP_2026 } from '@/data/stallMap2026';
import { SAREE_POOL_STALLS } from '@/data/stallAllotment2026';
import {
  STALL_UNITS,
  StallUnit,
  ALLOTMENT_BY_UNIT,
  OCCUPANCY_2026,
} from '@/lib/stallOccupancy';

/**
 * The approved 2026 floor plan, with every stall numbered.
 *
 * The drawing itself is served as a static SVG rather than bundled, so the
 * exhibitor sees the real plan - the same one printed for the hall - with an
 * invisible hit layer on top for picking out a stall.
 */
const PLAN_SRC = '/assets/Final-Layout-STE-2026-numbered.svg';

/** The plan's own coordinate space, so the overlay lines up with the drawing. */
const VIEW_W = 841.92007;
const VIEW_H = 595.32;

/** One colour per trade, for the optional trade-block overlay. */
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

/**
 * Occupancy shading, painted over the printed plan: a free stall has to be
 * the thing the eye lands on, so it takes the strong colour.
 */
const FREE_FILL = 'rgba(16,185,129,0.85)';
const FREE_STROKE = '#064E3B';
/** Seated on the layout, still to be confirmed by the draw. */
const PLANNED_FILL = 'rgba(15,23,42,0.20)';
/** Confirmed by a live draw. */
const DRAWN_FILL = 'rgba(37,99,235,0.40)';

const SAREE = new Set(SAREE_POOL_STALLS);

/** Which overlay the plan is painted with. */
type View = 'plain' | 'trades' | 'occupancy';

export interface FloorPlan2026Props {
  /** Unit id to mark on the plan, e.g. "76" or "91A". */
  selectedUnitId?: string | null;
  /** Unit ids to keep lit; everything else is veiled. */
  visibleUnitIds?: Set<string> | null;
  onSelect?: (unitId: string) => void;
  /** Shorter frame, for use beside a profile card. */
  compact?: boolean;
  /** Start with the trade-block colours on. */
  showTrades?: boolean;
  /** Start with allotted / free shading on - the organiser's view. */
  showOccupancy?: boolean;
  /** Units a live draw has already confirmed, marked apart from the layout. */
  drawnUnitIds?: Set<string> | null;
  /** What to call the marked stall on the jump button. */
  focusLabel?: string;
}

export default function FloorPlan2026({
  selectedUnitId = null,
  visibleUnitIds = null,
  onSelect,
  compact = false,
  showTrades = false,
  showOccupancy = false,
  drawnUnitIds = null,
  focusLabel,
}: FloorPlan2026Props) {
  const units = useMemo<StallUnit[]>(() => STALL_UNITS, []);
  const [zoom, setZoom] = useState(1);
  const [view, setView] = useState<View>(
    showOccupancy ? 'occupancy' : showTrades ? 'trades' : 'plain'
  );
  /** What the viewer last tapped. Falls back to the stall they were allotted. */
  const [picked, setPicked] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeId = picked ?? selectedUnitId;
  const selected = activeId
    ? units.find((u) => u.id.toUpperCase() === activeId.toUpperCase())
    : undefined;
  const isOwnStall = Boolean(
    selectedUnitId && selected && selected.id.toUpperCase() === selectedUnitId.toUpperCase()
  );
  const selectedAllotment = selected
    ? ALLOTMENT_BY_UNIT.get(selected.id.toUpperCase())
    : undefined;

  const centreOnSelection = React.useCallback(() => {
    const box = scrollRef.current;
    if (!selected || !box) return;
    const scale = (box.scrollWidth || 1) / VIEW_W;
    box.scrollTo({
      left: Math.max(0, (selected.x + selected.w / 2) * scale - box.clientWidth / 2),
      top: Math.max(0, (selected.y + selected.h / 2) * scale - box.clientHeight / 2),
      behavior: 'smooth',
    });
  }, [selected]);

  React.useEffect(() => {
    centreOnSelection();
  }, [centreOnSelection]);

  // Land an exhibitor on their own stall: close enough to read the number,
  // without them having to hunt for it first.
  const zoomedToOwn = useRef(false);
  React.useEffect(() => {
    if (!selectedUnitId || zoomedToOwn.current) return;
    zoomedToOwn.current = true;
    setZoom((z) => Math.max(z, 3));
    window.setTimeout(centreOnSelection, 120);
  }, [selectedUnitId, centreOnSelection]);

  function reset() {
    setZoom(1);
    scrollRef.current?.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
  }

  function toggleView(wanted: Exclude<View, 'plain'>) {
    setView((v) => (v === wanted ? 'plain' : wanted));
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10 flex-wrap">
        <div className="flex rounded-lg border border-white/15 overflow-hidden">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(1, z / 1.4))}
            aria-label="Zoom out"
            className="px-2.5 py-1.5 text-slate-200 hover:bg-white/10 active:bg-white/15 border-r border-white/15"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={reset}
            aria-label="Fit plan to screen"
            className="px-2.5 py-1.5 text-slate-200 hover:bg-white/10 active:bg-white/15 border-r border-white/15"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(9, z * 1.4))}
            aria-label="Zoom in"
            className="px-2.5 py-1.5 text-slate-200 hover:bg-white/10 active:bg-white/15"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {selectedUnitId && (
          <button
            type="button"
            onClick={() => {
              setPicked(null);
              setZoom((z) => Math.max(z, 3));
              window.setTimeout(centreOnSelection, 80);
            }}
            className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-amber-400/60 px-2.5 py-1.5 text-[11px] font-semibold text-amber-300 hover:bg-amber-400/10"
          >
            <Crosshair className="w-3.5 h-3.5" />
            {focusLabel ?? 'My stall'} {selectedUnitId}
          </button>
        )}

        {showOccupancy && (
        <button
          type="button"
          onClick={() => toggleView('occupancy')}
          aria-pressed={view === 'occupancy'}
          className={`shrink-0 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition ${
            view === 'occupancy'
              ? 'border-emerald-400/60 text-emerald-300'
              : 'border-white/15 text-slate-400'
          }`}
        >
          Allotted / free
        </button>
        )}

        <button
          type="button"
          onClick={() => toggleView('trades')}
          aria-pressed={view === 'trades'}
          className={`shrink-0 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition ${
            view === 'trades'
              ? 'border-amber-400/60 text-amber-300'
              : 'border-white/15 text-slate-400'
          }`}
        >
          Trade colours
        </button>

        <p className="text-[11px] sm:text-xs text-slate-400 tabular-nums truncate">
          {selected
            ? `Stall ${selected.id} · ${selected.size} · ${selected.stall.zone}` +
              (showOccupancy
                ? selectedAllotment
                  ? ` · ${selectedAllotment.brand}`
                  : ' · free'
                : '') +
              (drawnUnitIds?.has(selected.id.toUpperCase()) ? ' · drawn' : '') +
              (isOwnStall ? (focusLabel ? ' · marked' : ' · yours') : '')
            : 'Tap a stall to identify it'}
        </p>
      </div>

      <div
        ref={scrollRef}
        className={`overflow-auto overscroll-contain bg-white ${
          compact ? 'max-h-[42vh] sm:max-h-[46vh]' : 'max-h-[58vh] sm:max-h-[66vh]'
        }`}
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div
          className="relative"
          style={{ width: `${zoom * 100}%`, minWidth: '100%' }}
        >
          {/* The printed plan itself. */}
          <img
            src={PLAN_SRC}
            alt="STE 2026 floor plan with every stall numbered"
            className="block w-full h-auto select-none"
            draggable={false}
          />

          {/* Hit and highlight layer, in the drawing's own coordinates. */}
          <svg
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            className="absolute inset-0 w-full h-full"
          >
            {units.map((u) => {
              const isSel = selected?.id === u.id;
              const veiled = Boolean(
                visibleUnitIds && !visibleUnitIds.has(u.id) && !isSel
              );
              const allotment = ALLOTMENT_BY_UNIT.get(u.id.toUpperCase());
              const drawn = Boolean(drawnUnitIds?.has(u.id.toUpperCase()));
              const free = !allotment && !drawn;
              let fill = 'transparent';
              let stroke = 'none';
              let strokeWidth = 0;
              if (veiled) fill = 'rgba(255,255,255,0.82)';
              else if (isSel) fill = 'rgba(214,160,102,0.42)';
              else if (view === 'occupancy') {
                if (free) {
                  fill = FREE_FILL;
                  stroke = FREE_STROKE;
                  strokeWidth = 2;
                } else fill = drawn ? DRAWN_FILL : PLANNED_FILL;
              } else if (view === 'trades' && allotment)
                fill = `${TRADE_COLOURS[allotment.group] ?? '#7C8794'}4D`;
              if (isSel) {
                stroke = '#B87333';
                strokeWidth = 2;
              }
              return (
                <rect
                  key={u.id}
                  x={u.x}
                  y={u.y}
                  width={u.w}
                  height={u.h}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                  style={{ cursor: onSelect ? 'pointer' : 'default' }}
                  onClick={() => {
                    setPicked(u.id);
                    onSelect?.(u.id);
                  }}
                >
                  <title>
                    {`Stall ${u.id} · ${u.size} · ${u.areaSqft} sqft` +
                      (showOccupancy
                        ? ` · ${allotment ? allotment.brand : 'Free'}` +
                          (drawn ? ' · drawn' : '')
                        : '')}
                  </title>
                </rect>
              );
            })}
          </svg>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-3 py-2 border-t border-white/10 text-[10px] sm:text-[11px] text-slate-400">
        {view === 'occupancy' ? (
          <>
            <span className="tabular-nums">
              {OCCUPANCY_2026.allotted} allotted &middot; {OCCUPANCY_2026.free} free
              of {OCCUPANCY_2026.totalUnits} units
            </span>
            <Key colour={FREE_FILL} label="Free" />
            <Key colour={PLANNED_FILL} label="Allotted on the layout" />
            {drawnUnitIds && drawnUnitIds.size > 0 && (
              <Key colour={DRAWN_FILL} label={`Drawn (${drawnUnitIds.size})`} />
            )}
          </>
        ) : view === 'trades' ? (
          Object.entries(TRADE_COLOURS).map(([trade, colour]) => (
            <Key key={trade} colour={`${colour}88`} label={trade} />
          ))
        ) : (
          <span>
            {SAREE.size} stalls in the saree pool &middot; {STALL_MAP_2026.length} on
            the floor
          </span>
        )}
        <Key
          colour="rgba(214,160,102,0.7)"
          label={focusLabel ? 'Marked' : isOwnStall ? 'Your stall' : 'Selected'}
        />
      </div>
    </div>
  );
}

function Key({ colour, label }: { colour: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="w-3 h-3 rounded-sm border border-white/25"
        style={{ background: colour }}
      />
      {label}
    </span>
  );
}
