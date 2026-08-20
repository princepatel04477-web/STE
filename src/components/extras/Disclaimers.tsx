import React from "react";
import { Info } from "lucide-react";

export default function Disclaimers() {
  return (
    <div className="w-full bg-neutral-950/80 border border-neutral-800 rounded-2xl p-6 md:p-8 space-y-4">
      <div className="flex items-center gap-2.5 text-neutral-400">
        <Info className="w-4 h-4 text-amber-400 shrink-0" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">Important Terms & Disclaimers</h4>
      </div>

      <ol className="list-decimal list-inside space-y-2 text-xs text-neutral-400 leading-relaxed font-sans">
        <li>
          All rates are in Indian Rupees, <strong className="text-neutral-200">per item per day</strong>, and are <strong className="text-neutral-200">exclusive of 18% GST</strong>.
        </li>
        <li>
          Rates are approximate and subject to final confirmation at the time of order booking.
        </li>
        <li>
          Product images are reference only — the item supplied may differ in exact finish, color, or model.
        </li>
        <li>
          Orders are subject to stock availability; place extras requests prior to the stall handover date.
        </li>
      </ol>
    </div>
  );
}
