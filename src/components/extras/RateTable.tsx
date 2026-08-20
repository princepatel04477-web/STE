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
            <h3 className="text-xl md:text-2xl font-bold font-serif text-amber-400 border-b border-amber-500/20 pb-2 flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              {CATEGORY_LABELS[category]}
            </h3>

            {/* Desktop Table View (≥768px) */}
            <div className="hidden md:block overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/60 backdrop-blur-sm shadow-xl">
              <table className="w-full text-left border-collapse">
                <caption className="sr-only">
                  STE 2026 Exhibitor Extras Rate Card — {CATEGORY_LABELS[category]}
                </caption>
                <thead>
                  <tr className="border-b border-neutral-800 bg-neutral-950/80 text-xs font-bold uppercase tracking-wider text-neutral-400">
                    <th scope="col" className="py-4 px-6">Item</th>
                    <th scope="col" className="py-4 px-6">Specification</th>
                    <th scope="col" className="py-4 px-6 text-right">Rate (INR)</th>
                    <th scope="col" className="py-4 px-6 text-center">Basis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 text-sm">
                  {catItems.map((item) => (
                    <tr key={item.id} className="hover:bg-neutral-800/30 transition-colors group">
                      <th scope="row" className="py-4 px-6 font-semibold text-white font-sans">
                        <div className="flex items-center gap-3">
                          {item.image ? (
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-neutral-700 shrink-0">
                              <Image
                                src={item.image}
                                alt=""
                                fill
                                sizes="64px"
                                className="object-cover"
                              />
                            </div>
                          ) : null}
                          <span className="group-hover:text-amber-400 transition-colors">{item.name}</span>
                        </div>
                      </th>
                      <td className="py-4 px-6 text-neutral-400 font-mono text-xs">
                        {item.spec ? item.spec : "—"}
                      </td>
                      <td className="py-4 px-6 text-right font-bold text-amber-400 tabular-nums font-mono text-base">
                        {formatInr(item.rateInr)}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="inline-block px-2.5 py-1 rounded-md bg-neutral-950 border border-neutral-800 text-xs font-medium text-neutral-400 uppercase tracking-wider">
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
                  className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-4 flex flex-col gap-2 shadow-md hover:border-amber-500/40 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {item.image ? (
                        <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-neutral-700 shrink-0">
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
                        <h4 className="font-bold text-white text-base leading-snug">{item.name}</h4>
                        <p className="text-xs font-mono text-neutral-400 mt-0.5">
                          {item.spec ? item.spec : "—"}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="block font-black text-amber-400 tabular-nums font-mono text-base">
                        {formatInr(item.rateInr)}
                      </span>
                      <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">
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
