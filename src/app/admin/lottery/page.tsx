'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Trophy,
  Sparkles,
  Download,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Printer,
  ShieldCheck,
  Tv,
  Store,
  Layers,
  ArrowLeft,
  X,
  Compass
} from 'lucide-react';
import { LotteryAllocationRecord } from '@/lib/db';
import AllotmentSlipModal from '@/components/lottery/AllotmentSlipModal';
import confetti from 'canvas-confetti';

interface CategoryStat {
  category: string;
  totalStalls: number;
  cornerStalls: number;
  allocatedCount: number;
  availableCount: number;
  cornerAllocated: number;
}

export default function AdminLotteryPage() {
  const [allocations, setAllocations] = useState<LotteryAllocationRecord[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [totalCapacity, setTotalCapacity] = useState(0);
  const [totalAllocated, setTotalAllocated] = useState(0);
  const [totalRemaining, setTotalRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  // Selected Slip Modal
  const [selectedSlip, setSelectedSlip] = useState<LotteryAllocationRecord | null>(null);

  // Live Stage Mode State
  const [isStageMode, setIsStageMode] = useState(false);
  const [stageDrawRunning, setStageDrawRunning] = useState(false);
  const [stageLatestWinner, setStageLatestWinner] = useState<LotteryAllocationRecord | null>(null);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/lottery/admin/report');
      const data = await res.json();
      if (data.success) {
        setAllocations(data.allocations || []);
        setCategoryStats(data.categoryStats || []);
        setTotalCapacity(data.totalCapacity || 0);
        setTotalAllocated(data.totalAllocated || 0);
        setTotalRemaining(data.totalRemaining || 0);
      }
    } catch (e) {
      console.error('Failed to load lottery report:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleResetSingle = async (mobile: string, brand: string) => {
    if (!confirm(`Are you sure you want to reset the lucky draw for ${brand} (${mobile})?`)) return;
    try {
      const res = await fetch('/api/lottery/admin/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, adminKey: 'ste@2026' })
      });
      if (res.ok) {
        fetchReport();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetAll = async () => {
    if (!confirm('⚠️ CAUTION: Are you sure you want to RESET ALL lottery allocations? This cannot be undone.')) return;
    try {
      const res = await fetch('/api/lottery/admin/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetAll: true, adminKey: 'ste@2026' })
      });
      if (res.ok) {
        fetchReport();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Trigger Stage Big Screen Animation
  const handleTriggerStageRoll = () => {
    if (stageDrawRunning || allocations.length === 0) return;
    setStageDrawRunning(true);
    setStageLatestWinner(null);

    let count = 0;
    const interval = setInterval(() => {
      const randomRecord = allocations[Math.floor(Math.random() * allocations.length)];
      setStageLatestWinner(randomRecord);
      count++;
      if (count > 25) {
        clearInterval(interval);
        setStageDrawRunning(false);
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });
      }
    }, 100);
  };

  const filteredAllocations = allocations.filter((a) => {
    const q = searchQuery.toLowerCase();
    const matchQuery =
      a.brand_name.toLowerCase().includes(q) ||
      a.mobile.includes(q) ||
      a.stall_number.toLowerCase().includes(q) ||
      a.slip_id.toLowerCase().includes(q);

    if (!matchQuery) return false;
    if (categoryFilter !== 'All') {
      return a.stall_sqft.includes(categoryFilter);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 p-4 sm:p-8 selection:bg-amber-500 selection:text-black">
      
      {/* Top Header Navigation */}
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 border-b border-amber-500/20 pb-6 mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/exhibitors"
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors border border-white/10"
            title="Back to Exhibitors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>STE 2026 Admin Control</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-black text-white">
              Stall Lottery Master Console
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsStageMode(true)}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all"
          >
            <Tv className="w-4 h-4" />
            <span>Stage Projector Mode</span>
          </button>

          <a
            href="/api/lottery/admin/report?format=csv"
            download
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export Master CSV</span>
          </a>

          <button
            onClick={fetchReport}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* KPI Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-white/10 shadow-lg">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Total Stall Capacity</span>
            <div className="text-3xl font-black text-white mt-1">{totalCapacity}</div>
            <span className="text-[11px] text-slate-500 mt-1 block">Master SIECC Floor Plan</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/90 border border-emerald-500/30 shadow-lg">
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider block">Allocated Stalls</span>
            <div className="text-3xl font-black text-emerald-300 mt-1">{totalAllocated}</div>
            <span className="text-[11px] text-emerald-500/80 mt-1 block">
              {totalCapacity > 0 ? `${((totalAllocated / totalCapacity) * 100).toFixed(1)}% Completed` : '0%'}
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/90 border border-amber-500/30 shadow-lg">
            <span className="text-amber-400 text-xs font-bold uppercase tracking-wider block">Available Stalls</span>
            <div className="text-3xl font-black text-amber-300 mt-1">{totalRemaining}</div>
            <span className="text-[11px] text-amber-500/80 mt-1 block">Ready for Draw</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/90 border border-purple-500/30 shadow-lg flex flex-col justify-between">
            <div>
              <span className="text-purple-400 text-xs font-bold uppercase tracking-wider block">Corner Stalls (≥600 sqft)</span>
              <div className="text-3xl font-black text-purple-300 mt-1">
                {allocations.filter((a) => a.is_corner === 1).length}
              </div>
            </div>
            <span className="text-[11px] text-purple-400/80 mt-1">2-Side Open L-Shape</span>
          </div>
        </div>

        {/* Category Breakdown Table */}
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-white/10 shadow-xl overflow-x-auto">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>Category-Wise Stall Allocation Breakdown</span>
          </h3>

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="pb-3 px-3">Category</th>
                <th className="pb-3 px-3">Total Stalls</th>
                <th className="pb-3 px-3">Corner (L-Shape)</th>
                <th className="pb-3 px-3">Allocated</th>
                <th className="pb-3 px-3">Remaining</th>
                <th className="pb-3 px-3">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {categoryStats.map((cat) => {
                const pct = cat.totalStalls > 0 ? (cat.allocatedCount / cat.totalStalls) * 100 : 0;
                return (
                  <tr key={cat.category} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3 font-bold text-white">{cat.category}</td>
                    <td className="py-3 px-3 font-mono">{cat.totalStalls}</td>
                    <td className="py-3 px-3 font-mono text-amber-400">{cat.cornerStalls}</td>
                    <td className="py-3 px-3 font-mono font-bold text-emerald-400">{cat.allocatedCount}</td>
                    <td className="py-3 px-3 font-mono text-slate-300">{cat.availableCount}</td>
                    <td className="py-3 px-3 w-44">
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Master Allocation Records Table */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-white/10 shadow-xl space-y-4">
          
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white">Live Allotment Register ({filteredAllocations.length})</h3>
              <p className="text-xs text-slate-400">All draws executed with authenticated timestamp & slip hashes.</p>
            </div>

            {/* Search & Category Filter */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search brand, mobile, stall..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-400 w-60"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
              >
                <option value="All">All Categories</option>
                <option value="100">100 sq ft</option>
                <option value="200">200 sq ft</option>
                <option value="300">300 sq ft</option>
                <option value="400">400 sq ft</option>
                <option value="600">600 sq ft</option>
                <option value="800">800 sq ft</option>
                <option value="1000">1000+ sq ft</option>
              </select>

              <button
                onClick={handleResetAll}
                className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition-colors flex items-center gap-1.5"
                title="Reset All Allocations"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-3">Slip ID</th>
                  <th className="py-3 px-3">Exhibitor / Brand</th>
                  <th className="py-3 px-3">Mobile</th>
                  <th className="py-3 px-3">Size</th>
                  <th className="py-3 px-3">Allotted Stall</th>
                  <th className="py-3 px-3">Corner / Type</th>
                  <th className="py-3 px-3">Hall & Zone</th>
                  <th className="py-3 px-3">Timestamp</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredAllocations.map((a) => (
                  <tr key={a.slip_id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-400">{a.slip_id}</td>
                    <td className="py-3 px-3 font-bold text-white">{a.brand_name}</td>
                    <td className="py-3 px-3 font-mono text-slate-300">+91 {a.mobile}</td>
                    <td className="py-3 px-3 text-slate-300">{a.stall_sqft}</td>
                    <td className="py-3 px-3 font-mono font-black text-amber-300 text-sm">
                      {a.stall_number}
                    </td>
                    <td className="py-3 px-3">
                      {a.is_corner === 1 ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                          L-Shape Corner
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[10px]">Standard</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-300">{a.hall}</td>
                    <td className="py-3 px-3 font-mono text-slate-400 text-[10px]">
                      {new Date(a.allocated_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedSlip(a)}
                          className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-colors"
                          title="View & Print Slip"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleResetSingle(a.mobile, a.brand_name)}
                          className="p-1.5 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 transition-colors"
                          title="Reset This Allocation"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredAllocations.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-500">
                      No allocations recorded yet. Exhibitors can draw their stalls at{' '}
                      <Link href="/stall-allocation" className="text-amber-400 hover:underline">
                        /stall-allocation
                      </Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>

      </div>

      {/* Stage Projector Presentation Fullscreen Modal */}
      {isStageMode && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-between p-8 text-white animate-in fade-in">
          <div className="w-full flex items-center justify-between border-b border-amber-500/30 pb-4">
            <div className="flex items-center gap-3">
              <div className="relative w-16 h-10">
                <Image src="/assets/logo_STE.webp" alt="STE" fill className="object-contain" />
              </div>
              <div>
                <h2 className="text-xl font-black font-display text-amber-400">SURAT TEXTILE EXHIBITION 2026</h2>
                <p className="text-xs uppercase tracking-widest text-slate-400">Live Stage Lucky Draw Display</p>
              </div>
            </div>

            <button
              onClick={() => setIsStageMode(false)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Central Stage Showcase */}
          <div className="flex flex-col items-center justify-center text-center my-auto space-y-6">
            {stageLatestWinner ? (
              <div className="space-y-4 animate-in zoom-in-95 duration-300">
                <span className="text-sm font-black uppercase tracking-[0.3em] text-emerald-400 bg-emerald-500/20 px-4 py-1 rounded-full border border-emerald-500/40">
                  🎉 ALLOTTED STALL WINNER
                </span>
                <h1 className="text-4xl sm:text-6xl font-display font-black text-white">
                  {stageLatestWinner.brand_name}
                </h1>
                <div className="text-7xl sm:text-9xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 py-4 drop-shadow-[0_10px_35px_rgba(212,175,55,0.4)]">
                  {stageLatestWinner.stall_number}
                </div>
                <div className="text-xl font-bold text-slate-300">
                  {stageLatestWinner.stall_sqft} • {stageLatestWinner.dimensions} • {stageLatestWinner.hall}
                </div>
                {stageLatestWinner.is_corner === 1 && (
                  <span className="inline-block px-4 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider">
                    ★ Priority 2-Side Open Corner Stall ★
                  </span>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-24 h-24 rounded-3xl bg-amber-500/20 border-2 border-amber-500/40 flex items-center justify-center mx-auto text-amber-400">
                  <Sparkles className="w-12 h-12 animate-pulse" />
                </div>
                <h2 className="text-3xl font-display font-bold text-white">Ready for Live Lucky Draw</h2>
                <p className="text-sm text-slate-400">Press the button below to initiate on-stage draw roll.</p>
              </div>
            )}

            <button
              onClick={handleTriggerStageRoll}
              disabled={stageDrawRunning}
              className="mt-6 px-10 py-5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 font-black text-lg uppercase tracking-wider shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              {stageDrawRunning ? 'Rolling Stall Draw...' : 'Trigger Live Draw Roll'}
            </button>
          </div>

          <div className="text-center text-xs text-slate-500">
            SIECC Sarsana, Surat • Surat Textile Exhibition 2026 Official Allocation System
          </div>
        </div>
      )}

      {/* Slip Print Modal */}
      <AllotmentSlipModal
        isOpen={Boolean(selectedSlip)}
        onClose={() => setSelectedSlip(null)}
        allocation={selectedSlip}
      />

    </div>
  );
}
