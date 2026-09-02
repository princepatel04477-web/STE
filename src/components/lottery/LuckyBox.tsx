'use client';

import React, { useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Trophy, CheckCircle2, Store, Compass, Layers, ShieldCheck, Printer, ArrowRight } from 'lucide-react';
import { LotteryAllocationRecord } from '@/lib/db';

interface LuckyBoxProps {
  categorySqft: string;
  brandName: string;
  mobile: string;
  hasDrawn: boolean;
  allocation: LotteryAllocationRecord | null;
  onDrawComplete: (allocation: LotteryAllocationRecord) => void;
  onOpenSlipModal: () => void;
  onViewSitemap: () => void;
}

// Play celebratory sound using Web Audio API synthesis
function playCelebrationChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);
      gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + idx * 0.12 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.12);
      osc.stop(ctx.currentTime + idx * 0.12 + 0.65);
    });
  } catch (e) {
    // Ignore audio autoplay restrictions
  }
}

function triggerConfettiBurst() {
  try {
    // First burst
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#D4AF37', '#10B981', '#3B82F6', '#F59E0B', '#FFFFFF']
    });

    // Secondary fireworks burst
    setTimeout(() => {
      confetti({
        particleCount: 120,
        angle: 60,
        spread: 60,
        origin: { x: 0.1, y: 0.7 },
        colors: ['#D4AF37', '#10B981', '#FFD700']
      });
      confetti({
        particleCount: 120,
        angle: 120,
        spread: 60,
        origin: { x: 0.9, y: 0.7 },
        colors: ['#D4AF37', '#10B981', '#FFD700']
      });
    }, 250);
  } catch (e) {
    console.error('Confetti error:', e);
  }
}

export default function LuckyBox({
  categorySqft,
  brandName,
  mobile,
  hasDrawn,
  allocation,
  onDrawComplete,
  onOpenSlipModal,
  onViewSitemap
}: LuckyBoxProps) {
  const [opening, setOpening] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [currentAllocation, setCurrentAllocation] = useState<LotteryAllocationRecord | null>(allocation);

  /**
   * The draw is in flight.
   *
   * `opening` cannot guard this on its own: a double tap on a phone fires two
   * clicks before React has re-rendered the disabled button, so both handlers
   * read the old `false` and two draws go out. A ref is written the instant
   * the first tap is handled, so the second one finds the box already open.
   */
  const drawing = useRef(false);

  const isCornerEligible = parseInt(categorySqft.replace(/\D/g, ''), 10) >= 600;

  const handleOpenBox = async () => {
    if (drawing.current || opening || hasDrawn || currentAllocation) return;
    drawing.current = true;
    setOpening(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/lottery/draw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile,
          brandName,
          stallSqft: categorySqft
        })
      });

      const data = await res.json();

      // Nothing was allotted, so the box stays shut and the exhibitor can try
      // again. The draw only reports success once the allotment is on record,
      // so a failure here means there is no stall to lose.
      if (!res.ok || !data.success || !data.allocation?.stall_number) {
        setErrorMsg(data.error || 'Lucky draw allocation failed. Please try again.');
        drawing.current = false;
        setOpening(false);
        return;
      }

      // Trigger celebration effects
      triggerConfettiBurst();
      playCelebrationChime();

      // Allotted, and it stays allotted: `drawing` is deliberately not
      // released, so nothing that happens between here and the reveal can
      // start a second draw.
      setTimeout(() => {
        setCurrentAllocation(data.allocation);
        onDrawComplete(data.allocation);
        setOpening(false);
      }, 1200);
    } catch (err) {
      console.error(err);
      setErrorMsg('Connection error. Please try again.');
      drawing.current = false;
      setOpening(false);
    }
  };

  // The stall the page holds wins, because that is the one it read back from
  // the database after the draw; the local copy only covers the moment
  // between the reveal and the page being told. Deriving it beats syncing the
  // prop into state in an effect, which rendered twice and let the local copy
  // outrank a stall the database had since corrected.
  const activeRecord = allocation ?? currentAllocation;

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
      {/* Header Banner */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Lucky Box ({categorySqft})</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-display font-black text-white">
          {activeRecord ? 'Stall Allotted Successfully!' : 'Open Your Lucky Stall Box'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto">
          {activeRecord
            ? 'Your official booth number for STE 2026 is confirmed below.'
            : isCornerEligible
            ? 'Priority allocation: High-visibility 2-side open L-Shape Corner Stalls activated.'
            : 'Each registered exhibitor can participate in the lucky draw once.'}
        </p>
      </div>

      {errorMsg && (
        <div className="w-full mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-center font-semibold">
          {errorMsg}
        </div>
      )}

      {/* Gift Box / Allotted Result Container */}
      {!activeRecord ? (
        <div className="flex flex-col items-center justify-center p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-slate-900/90 to-black border border-amber-500/20 shadow-2xl relative w-full overflow-hidden group">
          {/* Background Ambient Glow */}
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/25 transition-all duration-700" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/25 transition-all duration-700" />

          {/* Animated 3D Gift Box Graphic */}
          <div className={`relative mb-8 transition-transform duration-500 ${opening ? 'scale-110 animate-bounce' : 'group-hover:scale-105'}`}>
            <div className="relative w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center">
              {/* Lid Top Ribbon */}
              <div className="absolute top-2 w-16 h-8 bg-amber-400 rounded-full shadow-lg z-20 animate-pulse" />
              
              {/* Box Body */}
              <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 shadow-[0_15px_35px_rgba(16,185,129,0.35)] relative overflow-hidden border-2 border-emerald-300/40 flex items-center justify-center">
                {/* Vertical Gold Ribbon */}
                <div className="absolute top-0 bottom-0 w-8 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 shadow-md" />
                {/* Horizontal Gold Ribbon */}
                <div className="absolute left-0 right-0 h-8 bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 shadow-md" />
                
                {/* Center Badge */}
                <div className="relative z-10 w-12 h-12 rounded-full bg-amber-400 border-2 border-white shadow-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-slate-950 animate-spin" style={{ animationDuration: '8s' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleOpenBox}
            disabled={opening}
            // Phones raise a second click on a double tap and zoom the page
            // between the two; this asks the browser for the single tap the
            // draw expects.
            style={{ touchAction: 'manipulation' }}
            className={`w-full max-w-sm py-4 px-8 rounded-2xl font-black text-sm sm:text-base uppercase tracking-wider transition-all duration-300 shadow-xl flex items-center justify-center gap-3 ${
              opening
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 text-slate-950 hover:scale-105 active:scale-95 shadow-amber-500/25 hover:shadow-amber-500/40'
            }`}
          >
            {opening ? (
              <>
                <div className="w-5 h-5 border-3 border-slate-900 border-t-transparent rounded-full animate-spin" />
                <span>Opening Lucky Box...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-slate-950" />
                <span>Open Lucky Box</span>
              </>
            )}
          </button>

          <p className="text-[11px] text-slate-500 mt-4 text-center">
            🔒 Process is authorized for mobile +91 {mobile}. Draw can only be performed once.
          </p>
        </div>
      ) : (
        /* Grand Reveal Card */
        <div className="w-full p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/95 to-black border-2 border-amber-500/40 shadow-[0_20px_50px_rgba(212,175,55,0.2)] relative overflow-hidden animate-in fade-in zoom-in-95 duration-500">
          {/* Top Decorative Gold Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-emerald-400 to-amber-500" />
          
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Official Allotment</span>
                <h3 className="text-base sm:text-lg font-bold text-white leading-tight">{activeRecord.brand_name}</h3>
              </div>
            </div>

            {activeRecord.is_corner === 1 ? (
              <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>Corner L-Shape</span>
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 text-[11px] font-bold uppercase tracking-wider">
                Standard In-Line
              </span>
            )}
          </div>

          {/* Stall Large Number Reveal */}
          <div className="text-center py-6 px-4 my-2 rounded-2xl bg-gradient-to-r from-amber-500/10 via-emerald-500/15 to-amber-500/10 border border-amber-500/30 relative">
            <span className="text-xs uppercase tracking-[0.2em] font-extrabold text-amber-300/80 block mb-1">
              Allotted Stall Number
            </span>
            <div className="text-5xl sm:text-6xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 tracking-wider">
              {activeRecord.stall_number}
            </div>
            <span className="text-xs text-emerald-300 font-medium mt-1 inline-block">
              {activeRecord.stall_sqft} • {activeRecord.dimensions}
            </span>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-6 text-xs">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <span className="text-slate-400 text-[10px] uppercase font-semibold block flex items-center gap-1">
                <Store className="w-3 h-3 text-amber-400" /> Hall
              </span>
              <p className="font-bold text-white mt-0.5 truncate">{activeRecord.hall}</p>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <span className="text-slate-400 text-[10px] uppercase font-semibold block flex items-center gap-1">
                <Compass className="w-3 h-3 text-emerald-400" /> Zone
              </span>
              <p className="font-bold text-white mt-0.5 truncate">{activeRecord.zone}</p>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10 col-span-2 sm:col-span-1">
              <span className="text-slate-400 text-[10px] uppercase font-semibold block flex items-center gap-1">
                <Layers className="w-3 h-3 text-blue-400" /> Configuration
              </span>
              <p className="font-bold text-white mt-0.5">{activeRecord.shape} (2-Side Open)</p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={onOpenSlipModal}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-extrabold text-xs uppercase tracking-wider hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <Printer className="w-4 h-4" />
              <span>Print Allotment Pass</span>
            </button>

            <button
              onClick={onViewSitemap}
              className="flex-1 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider border border-white/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span>View On Floor Plan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-500">
            <span>Pass ID: <strong className="text-slate-400">{activeRecord.slip_id}</strong></span>
            <span>Date: {(() => {
              try {
                const d = new Date(String(activeRecord.allocated_at || '').replace(' ', 'T'));
                return isNaN(d.getTime()) ? String(activeRecord.allocated_at) : d.toLocaleDateString('en-IN');
              } catch {
                return String(activeRecord.allocated_at || '');
              }
            })()}</span>
          </div>
        </div>
      )}
    </div>
  );
}
