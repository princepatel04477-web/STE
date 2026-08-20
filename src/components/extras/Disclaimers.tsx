import React from "react";
import { Info, AlertTriangle } from "lucide-react";

export default function Disclaimers() {
  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-5 text-white shadow-xl">
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <span>Critical Cutoff Deadline</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500 text-slate-950">5 SEPT 2026, 12:00 PM</span>
          </h4>
          <p className="text-xs text-slate-300 mt-1">
            All exhibitor stall details, entry badges, and extra requirement orders <strong className="text-white underline">CANNOT be edited or modified after 5th September 2026 at 12:00 PM (IST)</strong>.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 text-slate-400">
        <Info className="w-4 h-4 text-amber-400 shrink-0" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">Important Terms & Product Image Disclaimers</h4>
      </div>

      <ol className="list-decimal list-inside space-y-2.5 text-xs text-slate-300 leading-relaxed font-sans">
        <li>
          <strong className="text-amber-300 font-bold">Product Image Notice:</strong> The images are for booking purpose only. The original product design, color, or model may change.
        </li>
        <li>
          All rates are in Indian Rupees, <strong className="text-white">per item per day</strong>, and are <strong className="text-white">exclusive of 18% GST</strong>.
        </li>
        <li>
          Rates are approximate and subject to final confirmation at the time of order booking.
        </li>
        <li>
          Orders are subject to stock availability; place extras requests prior to the stall handover date.
        </li>
        <li>
          <strong className="text-amber-400 font-bold">Strict Editing Cutoff:</strong> No changes, additions, or edits will be permitted after <strong className="text-white font-bold font-mono">5th September 2026, 12:00 PM</strong>.
        </li>
      </ol>
    </div>
  );
}
