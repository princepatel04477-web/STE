'use client';

import React, { useMemo, useRef, useState } from 'react';
import { Compass, ZoomIn, ZoomOut, RotateCcw, Crosshair } from 'lucide-react';
import {
  MASTER_STALL_INVENTORY,
  SITEMAP_BLOCKS,
  SITEMAP_LANDMARKS,
  GRID_COLS,
  GRID_ROWS,
  StallItem
} from '@/data/stallInventory';
import { LotteryAllocationRecord } from '@/lib/db';

interface SitemapVisualizerProps {
  allocatedStallNumber?: string | null;
  allocationRecord?: LotteryAllocationRecord | null;
}

/** px per 10ft module in the SVG user space */
const U = 14;
const PAD_X = 44;
const PAD_TOP = 54;
const PAD_BOTTOM = 34;
const VIEW_W = GRID_COLS * U + PAD_X * 2;
const VIEW_H = GRID_ROWS * U + PAD_TOP + PAD_BOTTOM;

const px = (col: number) => PAD_X + col * U;
const py = (row: number) => PAD_TOP + row * U;

export default function SitemapVisualizer({
  allocatedStallNumber,
  allocationRecord
}: SitemapVisualizerProps) {
  const [zoom, setZoom] = useState(1);
  const [selected, setSelected] = useState<StallItem | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const mine = allocatedStallNumber?.toUpperCase() ?? null;
  const myStall = useMemo(
    () => MASTER_STALL_INVENTORY.find((s) => s.stallNumber.toUpperCase() === mine) ?? null,
    [mine]
  );

  const handleZoom = (delta: number) => setZoom((z) => Math.min(3, Math.max(0.8, +(z + delta).toFixed(2))));

  const focusMyStall = () => {
    if (!myStall) return;
    setSelected(myStall);
    const el = scrollRef.current;
    if (!el) return;
    const scale = (el.scrollWidth || VIEW_W) / VIEW_W;
    el.scrollTo({
      left: (px(myStall.col) + (myStall.colSpan * U) / 2) * scale - el.clientWidth / 2,
      top: (py(myStall.row) + (myStall.rowSpan * U) / 2) * scale - el.clientHeight / 2,
      behavior: 'smooth'
    });
  };

  const detail = selected ?? myStall;

  return (
    <div className="w-full bg-slate-950 border border-amber-500/20 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col">
      {/* Header + controls */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-400" />
            <h3 className="text-base sm:text-lg font-bold text-white">Exhibition Sitemap — STE 2026</h3>
          </div>
          <p className="text-xs text-slate-400">
            {MASTER_STALL_INVENTORY.length} stalls across {SITEMAP_BLOCKS.length} blocks · drawn to the official SIECC floor plan
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900 border border-white/10 rounded-xl p-1">
          {myStall && (
            <button
              onClick={focusMyStall}
              className="px-2 py-1.5 flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 rounded-lg hover:bg-emerald-500/10 transition-colors"
              title="Jump to your allotted stall"
            >
              <Crosshair className="w-4 h-4" /> My Stall
            </button>
          )}
          <button onClick={() => handleZoom(0.25)} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10" title="Zoom in">
            <ZoomIn className="w-4 h-4" />
          </button>
          <button onClick={() => handleZoom(-0.25)} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10" title="Zoom out">
            <ZoomOut className="w-4 h-4" />
          </button>
          <button onClick={() => setZoom(1)} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10" title="Reset zoom">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] mb-3">
        <LegendSwatch className="bg-[#FDF082] border-amber-500" label="In-line stall" tone="text-slate-300" />
        <LegendSwatch className="bg-amber-400 border-amber-600" label="Twin-aisle island" tone="text-slate-300" />
        <LegendSwatch className="bg-orange-400 border-orange-700" label="L-shape corner (2–3 sides open)" tone="text-amber-300" />
        {mine && (
          <LegendSwatch className="bg-emerald-400 border-emerald-200 animate-pulse" label={`Your stall (${allocatedStallNumber})`} tone="text-emerald-400 font-bold" />
        )}
      </div>

      {/* Inspector */}
      {detail && (
        <div className="mb-4 p-3 rounded-xl bg-slate-900/90 border border-amber-500/30 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="px-2 h-9 min-w-9 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-mono font-bold text-amber-300">
              {detail.stallNumber}
            </div>
            <div>
              <p className="font-bold text-white">{detail.description}</p>
              <p className="text-slate-400 text-[11px]">
                {detail.hall} · {detail.zone} · {detail.dimensions} · {detail.openSides}-side open
              </p>
            </div>
          </div>
          {detail.stallNumber.toUpperCase() === mine && (
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 font-extrabold text-[11px]">
              YOUR ALLOTTED BOOTH{allocationRecord?.slip_id ? ` · ${allocationRecord.slip_id}` : ''}
            </span>
          )}
        </div>
      )}

      {/* Map viewport */}
      <div
        ref={scrollRef}
        className="w-full overflow-auto max-h-[640px] border border-white/10 rounded-2xl bg-[#EBE7DF] select-none"
      >
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          width={VIEW_W * zoom}
          height={VIEW_H * zoom}
          className="block"
          role="img"
          aria-label="STE 2026 exhibition floor plan"
        >
          {/* Hall shell */}
          <rect x={0} y={0} width={VIEW_W} height={VIEW_H} fill="#FAF8F5" />
          <rect
            x={px(0) - 18}
            y={py(0) - 18}
            width={GRID_COLS * U + 36}
            height={GRID_ROWS * U + 36}
            fill="#EFEBE3"
            stroke="#94a3b8"
            strokeWidth={2}
            rx={4}
          />
          {/* Central cross aisle between the north and south halls */}
          <rect x={px(0) - 18} y={py(16)} width={GRID_COLS * U + 36} height={U * 2} fill="#F7F4EE" />

          {/* Landmarks */}
          {SITEMAP_LANDMARKS.washrooms.map((w, i) => (
            <g key={`wr-${i}`}>
              <rect x={px(w.col) - 20} y={py(w.row) - 4} width={U + 40} height={16} fill="#e2e8f0" stroke="#94a3b8" rx={2} />
              <text x={px(w.col) + U / 2} y={py(w.row) + 8} textAnchor="middle" fontSize={9} fontWeight={700} fill="#334155">
                Washroom
              </text>
            </g>
          ))}
          {SITEMAP_LANDMARKS.emergencyGates.map((g, i) => (
            <g key={`gate-${i}`}>
              <rect
                x={g.orient === 'h' ? px(g.col) : px(g.col) + 4}
                y={g.orient === 'h' ? py(g.row) + 4 : py(g.row)}
                width={g.orient === 'h' ? U * 2 : 6}
                height={g.orient === 'h' ? 6 : U * 2}
                fill="#dc2626"
              />
              <text
                x={g.orient === 'h' ? px(g.col) + U : px(g.col) + 7}
                y={g.orient === 'h' ? py(g.row) : py(g.row) - 4}
                textAnchor="middle"
                fontSize={8}
                fontWeight={700}
                fill="#b91c1c"
                transform={g.orient === 'v' ? `rotate(-90 ${px(g.col) + 7} ${py(g.row) - 4})` : undefined}
              >
                Emergency gate
              </text>
            </g>
          ))}

          {/* Entry / Exit lobby */}
          <LobbyDoor spec={SITEMAP_LANDMARKS.exit} label="EXIT" color="#dc2626" arrow="↓" />
          <LobbyDoor spec={SITEMAP_LANDMARKS.entry} label="ENTRY" color="#059669" arrow="↑" />
          <text
            x={px(21)}
            y={py(24)}
            textAnchor="middle"
            fontSize={22}
            fontWeight={900}
            fill="#1d4ed8"
            opacity={0.28}
            letterSpacing="1"
          >
            SIECC MAIN LOBBY
          </text>

          {/* Block labels — the gallery runs sit under the washrooms, so they stay unlabelled */}
          {SITEMAP_BLOCKS.filter((b) => b.wing !== 'north-gallery').map((b) => (
            <text
              key={`lbl-${b.id}`}
              x={px(b.cols[0]) + (b.cols.length > 1 ? U : U / 2)}
              y={py(b.rowStart) - 4}
              textAnchor="middle"
              fontSize={8}
              fontWeight={800}
              fill="#92400e"
            >
              {b.id}
            </text>
          ))}

          {/* Stalls */}
          {MASTER_STALL_INVENTORY.map((s) => {
            const isMine = s.stallNumber.toUpperCase() === mine;
            const isSelected = selected?.stallNumber === s.stallNumber;
            const w = s.colSpan * U;
            const h = s.rowSpan * U;
            const fill = isMine
              ? '#34d399'
              : s.isCorner
                ? '#fb923c'
                : s.colSpan > 1
                  ? '#fbbf24'
                  : '#FDF082';

            return (
              <g key={s.stallNumber} onClick={() => setSelected(s)} className="cursor-pointer">
                <title>{`${s.stallNumber} — ${s.description} (${s.dimensions})`}</title>
                <rect
                  x={px(s.col)}
                  y={py(s.row)}
                  width={w}
                  height={h}
                  fill={fill}
                  stroke={isMine ? '#047857' : isSelected ? '#1d4ed8' : '#a16207'}
                  strokeWidth={isMine || isSelected ? 2 : 0.6}
                  rx={1.5}
                >
                  {isMine && (
                    <animate attributeName="opacity" values="1;0.55;1" dur="1.6s" repeatCount="indefinite" />
                  )}
                </rect>
                {(s.colSpan > 1 || s.rowSpan > 1) && (
                  <text
                    x={px(s.col) + w / 2}
                    y={py(s.row) + h / 2 + 3}
                    textAnchor="middle"
                    fontSize={Math.min(9, w / 3.4)}
                    fontWeight={700}
                    fill={isMine ? '#064e3b' : '#451a03'}
                    pointerEvents="none"
                  >
                    {s.sqftNumber >= 400 ? s.stallNumber : s.stallNumber.split('-')[1]}
                  </text>
                )}
              </g>
            );
          })}

          {/* Marker for the allotted stall */}
          {myStall && (
            <g pointerEvents="none">
              <circle
                cx={px(myStall.col) + (myStall.colSpan * U) / 2}
                cy={py(myStall.row) + (myStall.rowSpan * U) / 2}
                r={Math.max(myStall.colSpan, myStall.rowSpan) * U * 0.75}
                fill="none"
                stroke="#10b981"
                strokeWidth={2}
                opacity={0.8}
              >
                <animate attributeName="r" values="10;28;10" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.9;0;0.9" dur="2s" repeatCount="indefinite" />
              </circle>
            </g>
          )}
        </svg>
      </div>

      <p className="text-[10px] text-slate-500 mt-3">
        Tentative map. Each grid square is one 10ft × 10ft (100 sq ft) module; stall footprints are drawn to scale.
        Aisle positions, gates and washrooms follow the official SIECC layout.
      </p>
    </div>
  );
}

function LegendSwatch({ className, label, tone }: { className: string; label: string; tone: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-3 h-3 rounded-sm border inline-block ${className}`} />
      <span className={tone}>{label}</span>
    </div>
  );
}

function LobbyDoor({
  spec,
  label,
  color,
  arrow
}: {
  spec: { col: number; row: number; colSpan: number; rowSpan: number };
  label: string;
  color: string;
  arrow: string;
}) {
  const w = spec.colSpan * U;
  const h = spec.rowSpan * U;
  return (
    <g>
      <rect x={px(spec.col)} y={py(spec.row)} width={w} height={h} fill="#ffffff" stroke={color} strokeWidth={1.5} rx={2} />
      <text x={px(spec.col) + w / 2} y={py(spec.row) + h / 2} textAnchor="middle" fontSize={9} fontWeight={800} fill={color}>
        {label}
      </text>
      <text x={px(spec.col) + w / 2} y={py(spec.row) + h / 2 + 13} textAnchor="middle" fontSize={13} fontWeight={800} fill={color}>
        {arrow}
      </text>
    </g>
  );
}
