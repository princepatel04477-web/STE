'use client';

import React from 'react';
import Image from 'next/image';
import { X, Printer, ShieldCheck, CheckCircle2, QrCode, Store, Calendar, MapPin, Download } from 'lucide-react';
import { LotteryAllocationRecord } from '@/lib/db';

interface AllotmentSlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  allocation: LotteryAllocationRecord | null;
}

export default function AllotmentSlipModal({
  isOpen,
  onClose,
  allocation
}: AllotmentSlipModalProps) {
  if (!isOpen || !allocation) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden print:border-none print:shadow-none print:w-full print:max-w-none print:text-black print:bg-white text-white my-8">
        
        {/* Modal Controls (Hidden in Print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-950/60 print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <span className="text-sm font-bold text-slate-200">Official Allotment Certificate</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Pass</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Pass Body */}
        <div className="p-6 sm:p-10 print:p-8 space-y-6 bg-gradient-to-b from-slate-900 to-slate-950 print:bg-white print:text-black">
          
          {/* Header Banner */}
          <div className="flex items-center justify-between border-b-2 border-amber-500/40 pb-6 print:border-amber-700">
            <div className="flex items-center gap-3">
              <div className="relative w-16 h-12">
                <Image
                  src="/assets/logo_STE.webp"
                  alt="STE Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="h-8 w-px bg-white/20 print:bg-slate-300 mx-1" />
              <div>
                <h1 className="text-lg font-black tracking-wider uppercase text-amber-400 print:text-amber-800 leading-tight">
                  Surat Textile Exhibition 2026
                </h1>
                <p className="text-[11px] text-slate-400 print:text-slate-600 uppercase tracking-widest font-semibold">
                  Official Stall Allocation Pass
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 print:text-slate-600 block uppercase">Pass ID</span>
              <span className="text-xs font-mono font-bold text-emerald-400 print:text-emerald-700">
                {allocation.slip_id}
              </span>
            </div>
          </div>

          {/* Allotted Stall Highlight Box */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/15 via-emerald-500/15 to-amber-500/15 border-2 border-amber-500/40 text-center print:border-slate-800 print:bg-slate-100">
            <span className="text-xs uppercase font-extrabold tracking-[0.2em] text-amber-300 print:text-amber-900 block mb-1">
              Confirmed Stall Allotment
            </span>
            <div className="text-5xl sm:text-6xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-400 print:text-slate-950 tracking-wider">
              {allocation.stall_number}
            </div>
            <div className="flex items-center justify-center gap-3 mt-2 text-xs font-bold text-slate-300 print:text-slate-700">
              <span>{allocation.stall_sqft}</span>
              <span>•</span>
              <span>{allocation.dimensions}</span>
              <span>•</span>
              <span className={allocation.is_corner === 1 ? 'text-amber-400 font-extrabold' : ''}>
                {allocation.is_corner === 1 ? 'Corner Stall (2-Side Open L-Shape)' : 'Standard Linear Stall'}
              </span>
            </div>
          </div>

          {/* Exhibitor & Event Particulars Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 print:border-slate-300 print:bg-slate-50">
              <span className="text-slate-400 print:text-slate-500 text-[10px] uppercase font-bold block mb-1">Exhibitor Company</span>
              <p className="font-extrabold text-white print:text-black text-sm">{allocation.brand_name}</p>
              <p className="text-slate-400 print:text-slate-600 mt-1 font-mono">Mobile: +91 {allocation.mobile}</p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 print:border-slate-300 print:bg-slate-50">
              <span className="text-slate-400 print:text-slate-500 text-[10px] uppercase font-bold block mb-1">Venue Location</span>
              <p className="font-bold text-white print:text-black">{allocation.hall}</p>
              <p className="text-slate-400 print:text-slate-600 mt-1">{allocation.zone}</p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 print:border-slate-300 print:bg-slate-50">
              <span className="text-slate-400 print:text-slate-500 text-[10px] uppercase font-bold block mb-1">Event Dates & Timings</span>
              <p className="font-bold text-white print:text-black">12th – 13th September, 2026</p>
              <p className="text-slate-400 print:text-slate-600 mt-1">SIECC, Sarsana, Surat, Gujarat</p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 print:border-slate-300 print:bg-slate-50 flex items-center justify-between">
              <div>
                <span className="text-slate-400 print:text-slate-500 text-[10px] uppercase font-bold block mb-1">Draw Timestamp</span>
                <p className="font-mono text-slate-300 print:text-slate-800 text-[11px]">
                  {new Date(allocation.allocated_at).toLocaleString('en-IN')}
                </p>
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 print:text-emerald-700 font-bold mt-1">
                  <CheckCircle2 className="w-3 h-3" /> Digitally Verified
                </span>
              </div>

              {/* QR Verification Box */}
              <div className="w-14 h-14 bg-white p-1.5 rounded-lg border border-slate-300 flex items-center justify-center shrink-0">
                <QrCode className="w-full h-full text-slate-900" />
              </div>
            </div>
          </div>

          {/* Exhibition Terms & Rules */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 text-[11px] text-slate-400 print:text-slate-600 space-y-1 print:border-slate-200">
            <h4 className="font-bold text-slate-300 print:text-black uppercase text-[10px] tracking-wider mb-1">Important Instructions:</h4>
            <p>1. Please carry a printed copy or digital screenshot of this allotment pass during stall possession at SIECC.</p>
            <p>2. Stall allocation via the official lucky draw system is final, verified, and non-transferable.</p>
            <p>3. Setup and stall possession will commence 24 hours prior to exhibition inaugural opening.</p>
          </div>

          {/* Footer Auth Signatures */}
          <div className="pt-4 border-t border-white/10 print:border-slate-300 flex items-center justify-between text-[11px]">
            <div>
              <span className="text-slate-500 block text-[10px]">ORGANIZER</span>
              <strong className="text-slate-300 print:text-black">AKAS Exhibition Management</strong>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block text-[10px]">AUTHORIZED SIGNATORY</span>
              <span className="font-display font-bold text-amber-400 print:text-amber-800 italic">STE 2026 Committee</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
