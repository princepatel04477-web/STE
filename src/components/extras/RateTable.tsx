import React from "react";
import Image from "next/image";
import { ExtraItem, ExtraCategory, EXTRAS_RATES, CATEGORY_LABELS, formatInr } from "@/data/extras-rates";

interface RateTableProps {
  items?: ExtraItem[];
}

const CATEGORY_ORDER: ExtraCategory[] = ["furniture", "display-av", "electrical"];

export default function RateTable({ items = EXTRAS_RATES }: RateTableProps) {
  // Group items by category
  const groupedItems = CATEGORY_ORDER.reduce<Record<ExtraCategory, ExtraItem[]>>(
    (acc, cat) => {
      acc[cat] = items.filter((item) => item.category === cat);
      return acc;
    },
    { furniture: [], "display-av": [], electrical: [] }
  );

  return (
    <div className="w-full space-y-10">
      {CATEGORY_ORDER.map((category) => {
        const catItems = groupedItems[category];
        if (catItems.length === 0) return null;

        return (
          <div key={category} className="space-y-4">
            <h3 className="text-xl md:text-2xl font-bold font-serif text-slate-950 border-b-2 border-amber-500/40 pb-2 flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-600 shadow-xs" />
              <span>{CATEGORY_LABELS[category]}</span>
            </h3>

            {/* Desktop Table View (≥768px) */}
            <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-left border-collapse">
                <caption className="sr-only">
                  STE 2026 Exhibitor Extras Rate Card — {CATEGORY_LABELS[category]}
                </caption>
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100 text-xs font-bold uppercase tracking-wider text-slate-700">
                    <th scope="col" className="py-4 px-6">Item</th>
                    <th scope="col" className="py-4 px-6">Specification</th>
                    <th scope="col" className="py-4 px-6 text-right">
                      Rate (INR) <span className="text-[10px] text-amber-800 block font-bold normal-case">(Excl. GST — 18% GST Extra)</span>
                    </th>
                    <th scope="col" className="py-4 px-6 text-center">Basis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {catItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                      <th scope="row" className="py-4 px-6 font-semibold text-slate-900 font-sans">
                        <div className="flex items-center gap-3.5">
                          {item.image ? (
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 shrink-0 shadow-xs">
                              <Image
                                src={item.image}
                                alt=""
                                fill
                                sizes="64px"
                                className="object-cover"
                              />
                            </div>
                          ) : null}
                          <div>
                            <div className="flex items-center gap-2">
                              {item.code && (
                                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-mono font-black shadow-xs">
                                  {item.code}
                                </span>
                              )}
                              <span className="group-hover:text-amber-800 transition-colors font-bold text-slate-950">{item.name}</span>
                            </div>
                          </div>
                        </div>
                      </th>
                      <td className="py-4 px-6 text-slate-600 font-mono text-xs">
                        {item.spec ? item.spec : "—"}
                      </td>
                      <td className="py-4 px-6 text-right font-black text-amber-800 tabular-nums font-mono text-base">
                        {formatInr(item.rateInr)}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="inline-block px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                          {item.basis}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View (<768px) */}
            <div className="grid grid-cols-1 gap-3 md:hidden">
              {catItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-2 shadow-xs hover:border-amber-400 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {item.image ? (
                        <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 shrink-0 shadow-xs">
                          <Image
                            src={item.image}
                            alt=""
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        </div>
                      ) : null}
                      <div>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          {item.code && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 text-[9px] font-mono font-black">
                              {item.code}
                            </span>
                          )}
                          <h4 className="font-bold text-slate-950 text-sm leading-snug">{item.name}</h4>
                        </div>
                        <p className="text-xs font-mono text-slate-500 mt-0.5">
                          {item.spec ? item.spec : "—"}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="block font-black text-amber-800 tabular-nums font-mono text-base">
                        {formatInr(item.rateInr)}
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                        {item.basis}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
