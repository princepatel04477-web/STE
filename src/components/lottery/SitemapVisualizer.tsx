'use client';

import React, { useState } from 'react';
import { Compass, ZoomIn, ZoomOut, RotateCcw, MapPin, Sparkles, Trophy, Info } from 'lucide-react';
import { MASTER_STALL_INVENTORY, StallItem } from '@/data/stallInventory';
import { LotteryAllocationRecord } from '@/lib/db';

interface SitemapVisualizerProps {
  allocatedStallNumber?: string | null;
  allocationRecord?: LotteryAllocationRecord | null;
}

export default function SitemapVisualizer({
  allocatedStallNumber,
  allocationRecord
}: SitemapVisualizerProps) {
  const [zoom, setZoom] = useState<number>(1);
  const [selectedStall, setSelectedStall] = useState<StallItem | null>(null);

  const handleZoomIn = () => setZoom((prev) => Math.min(1.8, prev + 0.15));
  const handleZoomOut = () => setZoom((prev) => Math.max(0.7, prev - 0.15));
  const handleResetZoom = () => setZoom(1);

  // Group columns from inventory
  const topRowStalls = MASTER_STALL_INVENTORY.filter((s) => s.stallNumber.startsWith('T-'));
  const leftWingStalls = MASTER_STALL_INVENTORY.filter((s) => s.stallNumber.startsWith('L-'));
  const rightWingStalls = MASTER_STALL_INVENTORY.filter((s) => s.stallNumber.startsWith('R-'));
  const aisleLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K'];

  const isMyStall = (num: string) => {
    return allocatedStallNumber && num.toUpperCase() === allocatedStallNumber.toUpperCase();
  };

  return (
    <div className="w-full bg-slate-950 border border-amber-500/20 rounded-3xl p-4 sm:p-6 shadow-2xl relative overflow-hidden flex flex-col">
      {/* Control Bar & Legend Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-400" />
            <h3 className="text-base sm:text-lg font-bold text-white">Interactive Exhibition Sitemap</h3>
          </div>
          <p className="text-xs text-slate-400">
            SIECC Exhibition Hall Layout • Exact map representation of STE 2026
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-amber-300 border border-amber-400 inline-block" />
            <span className="text-slate-300">Standard Stall</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-amber-500 border border-amber-300 inline-block" />
            <span className="text-amber-300 font-semibold">Corner L-Shape (≥600 sqft)</span>
          </div>
          {allocatedStallNumber && (
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-emerald-400 border border-emerald-200 animate-pulse inline-block" />
              <span className="text-emerald-400 font-bold">Your Allotted Stall ({allocatedStallNumber})</span>
            </div>
          )}
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-white/10 rounded-xl p-1">
          <button
            onClick={handleZoomIn}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            title="Reset Zoom"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Selected Stall Quick Inspector */}
      {selectedStall && (
        <div className="mb-4 p-3 rounded-xl bg-slate-900/90 border border-amber-500/30 flex items-center justify-between text-xs animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-bold text-amber-300">
              {selectedStall.stallNumber}
            </div>
            <div>
              <p className="font-bold text-white">{selectedStall.description}</p>
              <p className="text-slate-400 text-[11px]">
                {selectedStall.hall} • {selectedStall.dimensions} • {selectedStall.isCorner ? '2-Side Open L-Shape Corner' : 'Standard 1-Side Open'}
              </p>
            </div>
          </div>

          {isMyStall(selectedStall.stallNumber) && (
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 font-extrabold text-[11px]">
              YOUR ALLOTTED BOOTH
            </span>
          )}
        </div>
      )}

      {/* Floor Plan Viewport */}
      <div className="w-full overflow-x-auto overflow-y-auto max-h-[600px] border border-white/10 rounded-2xl bg-[#EBE7DF] p-6 text-slate-900 select-none shadow-inner relative flex justify-center items-center">
        <div
          style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
          className="transition-transform duration-300 min-w-[850px] w-full max-w-[960px] bg-[#FAF8F5] p-6 rounded-xl border-2 border-slate-400 shadow-md relative"
        >
          
          {/* Top Wall: Gates & Washrooms */}
          <div className="flex items-center justify-between px-4 py-2 border-b-2 border-slate-400 bg-slate-100 rounded-t-lg mb-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-red-500 rounded-xs inline-block" />
              <span className="text-[10px] font-bold text-red-700 uppercase">Emergency Gate 1</span>
            </div>
            <div className="px-3 py-0.5 rounded bg-slate-200 border border-slate-300 text-[10px] font-bold text-slate-700">
              Washroom A
            </div>
            <div className="px-3 py-0.5 rounded bg-slate-200 border border-slate-300 text-[10px] font-bold text-slate-700">
              Washroom B
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-red-500 rounded-xs inline-block" />
              <span className="text-[10px] font-bold text-red-700 uppercase">Emergency Gate 2</span>
            </div>
          </div>

          {/* Top Horizontal Row Stalls */}
          <div className="grid grid-cols-24 gap-1 mb-4">
            {topRowStalls.map((s) => {
              const mine = isMyStall(s.stallNumber);
              return (
                <button
                  key={s.stallNumber}
                  onClick={() => setSelectedStall(s)}
                  className={`h-7 rounded-xs border text-[9px] font-mono font-bold flex items-center justify-center transition-all ${
                    mine
                      ? 'bg-emerald-500 border-emerald-700 text-white animate-bounce shadow-lg ring-2 ring-emerald-300'
                      : s.isCorner
                      ? 'bg-amber-400 border-amber-600 text-slate-950 hover:scale-110'
                      : 'bg-[#FDF082] border-amber-400 text-slate-900 hover:bg-amber-200'
                  }`}
                  title={`${s.stallNumber} (${s.categorySqft} sqft)`}
                >
                  {s.stallNumber}
                </button>
              );
            })}
          </div>

          {/* Center Main Grid */}
          <div className="flex gap-4 my-2">
            
            {/* Left Perimeter Column */}
            <div className="flex flex-col gap-1 w-12 shrink-0">
              <div className="p-1 rounded bg-red-100 text-[8px] font-bold text-red-600 text-center uppercase border border-red-300">
                Gate L
              </div>
              {leftWingStalls.map((s) => {
                const mine = isMyStall(s.stallNumber);
                return (
                  <button
                    key={s.stallNumber}
                    onClick={() => setSelectedStall(s)}
                    className={`h-6 rounded-xs border text-[9px] font-mono font-bold flex items-center justify-center transition-all ${
                      mine
                        ? 'bg-emerald-500 border-emerald-700 text-white animate-bounce shadow-lg ring-2 ring-emerald-300'
                        : s.isCorner
                        ? 'bg-amber-400 border-amber-600 text-slate-950'
                        : 'bg-[#FDF082] border-amber-400 text-slate-900 hover:bg-amber-200'
                    }`}
                  >
                    {s.stallNumber}
                  </button>
                );
              })}
            </div>

            {/* Aisles Center Grid (Hall A & Hall B) */}
            <div className="flex-1 grid grid-cols-10 gap-3">
              {aisleLetters.map((aisle) => {
                const aisleStalls = MASTER_STALL_INVENTORY.filter(
                  (s) => s.stallNumber.startsWith(`${aisle}-`)
                );

                return (
                  <div key={aisle} className="flex flex-col gap-1 bg-amber-50/60 p-1 rounded border border-amber-200/80">
                    <div className="text-[10px] font-extrabold text-amber-900 text-center py-0.5 border-b border-amber-200">
                      {aisle}
                    </div>

                    <div className="flex flex-col gap-1">
                      {aisleStalls.map((s) => {
                        const mine = isMyStall(s.stallNumber);
                        return (
                          <button
                            key={s.stallNumber}
                            onClick={() => setSelectedStall(s)}
                            className={`h-6 rounded-xs border text-[8px] font-mono font-bold flex items-center justify-center transition-all ${
                              mine
                                ? 'bg-emerald-500 border-emerald-700 text-white animate-bounce shadow-lg ring-2 ring-emerald-300 z-10'
                                : s.isCorner
                                ? 'bg-amber-400 border-amber-600 text-slate-950 hover:scale-105 font-black'
                                : 'bg-[#FDF082] border-amber-400 text-slate-900 hover:bg-amber-200'
                            }`}
                            title={`${s.stallNumber} (${s.categorySqft} sqft) - ${s.shape}`}
                          >
                            {s.stallNumber}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Perimeter Column */}
            <div className="flex flex-col gap-1 w-12 shrink-0">
              <div className="p-1 rounded bg-red-100 text-[8px] font-bold text-red-600 text-center uppercase border border-red-300">
                Gate R
              </div>
              {rightWingStalls.map((s) => {
                const mine = isMyStall(s.stallNumber);
                return (
                  <button
                    key={s.stallNumber}
                    onClick={() => setSelectedStall(s)}
                    className={`h-6 rounded-xs border text-[9px] font-mono font-bold flex items-center justify-center transition-all ${
                      mine
                        ? 'bg-emerald-500 border-emerald-700 text-white animate-bounce shadow-lg ring-2 ring-emerald-300'
                        : s.isCorner
                        ? 'bg-amber-400 border-amber-600 text-slate-950'
                        : 'bg-[#FDF082] border-amber-400 text-slate-900 hover:bg-amber-200'
                    }`}
                  >
                    {s.stallNumber}
                  </button>
                );
              })}
            </div>

          </div>

          {/* Bottom Area: Main Entry, Exit & Tentative map Grand Lobby */}
          <div className="mt-4 pt-3 border-t-2 border-slate-400 flex items-center justify-between">
            <div className="w-1/3 flex gap-2">
              <div className="px-4 py-2 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-800 text-center text-xs font-bold w-full">
                Grand Corner Zone (Aisle 1-3)
              </div>
            </div>

            {/* Main Entrance / Exit Lobby */}
            <div className="w-1/3 p-4 rounded-xl bg-white border-2 border-blue-600 text-center shadow-md">
              <div className="flex items-center justify-center gap-6 text-xs font-black uppercase tracking-wider text-slate-800">
                <span className="flex items-center gap-1 text-red-600">
                  <span>↓ Exit</span>
                </span>
                <span className="text-xl font-display font-black text-blue-800 tracking-wider">
                  SIECC MAIN LOBBY
                </span>
                <span className="flex items-center gap-1 text-emerald-600">
                  <span>↑ Entry</span>
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-semibold mt-1">
                Registration Counters • VIP Desk • Security Check
              </p>
            </div>

            <div className="w-1/3 flex gap-2">
              <div className="px-4 py-2 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-800 text-center text-xs font-bold w-full">
                Grand Corner Zone (Aisle 4-6)
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
