"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ExtraItem, ExtraCategory, EXTRAS_RATES, CATEGORY_LABELS, formatInr } from "@/data/extras-rates";
import { DISCLAIMER_TEXT, FALLBACK_EXTRA_IMAGE } from "@/data/productImages";
import { X, Maximize2, Eye } from "lucide-react";

interface RateTableProps {
  items?: ExtraItem[];
}

const CATEGORY_ORDER: ExtraCategory[] = ["furniture", "display-av", "electrical"];

export default function RateTable({ items = EXTRAS_RATES }: RateTableProps) {
  const [previewItem, setPreviewItem] = useState<ExtraItem | null>(null);

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
                            <button
                              type="button"
                              onClick={() => setPreviewItem(item)}
                              className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 shrink-0 shadow-xs hover:border-amber-400 transition-all cursor-pointer group/img"
                              title="Click to view photo"
                            >
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                sizes="64px"
                                className="object-contain p-1 group-hover/img:scale-105 transition-transform"
                              />
                              <span className="absolute inset-0 bg-slate-950/25 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                <Maximize2 className="w-3.5 h-3.5 text-white drop-shadow" />
                              </span>
                            </button>
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
                        <button
                          type="button"
                          onClick={() => setPreviewItem(item)}
                          className="relative w-14 h-14 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 shrink-0 shadow-xs hover:border-amber-400 transition-all cursor-pointer group/mimg"
                          title="Tap to view photo"
                        >
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="56px"
                            className="object-contain p-1 group-hover/mimg:scale-105 transition-transform"
                          />
                          <span className="absolute bottom-0 right-0 bg-slate-900/85 text-amber-300 text-[7px] px-1 py-0.2 rounded-tl font-bold flex items-center gap-0.5">
                            <Eye className="w-2 h-2" /> View
                          </span>
                        </button>
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

      {/* Photo Preview Lightbox Modal */}
      {previewItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setPreviewItem(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`Photo preview for ${previewItem.name}`}
        >
          <div
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/90">
              <div>
                <div className="flex items-center gap-2">
                  {previewItem.code && (
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-mono font-black">
                      {previewItem.code}
                    </span>
                  )}
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {CATEGORY_LABELS[previewItem.category]}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-950 mt-1 font-serif">
                  {previewItem.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer border border-slate-200"
                aria-label="Close preview"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Photo Canvas */}
            <div className="relative w-full bg-slate-100/90 min-h-[240px] sm:min-h-[300px] max-h-[50vh] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
              <img
                src={previewItem.image || FALLBACK_EXTRA_IMAGE}
                alt={previewItem.name}
                className="max-h-[46vh] w-auto max-w-full object-contain rounded-lg drop-shadow-md"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = FALLBACK_EXTRA_IMAGE;
                }}
              />
            </div>

            <div className="p-4 sm:p-5 bg-white space-y-3">
              {previewItem.spec && (
                <p className="text-xs sm:text-sm text-slate-600 font-mono">
                  Specification: <span className="font-bold text-slate-800">{previewItem.spec}</span>
                </p>
              )}

              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-300/80">
                <div>
                  <span className="text-[10px] text-amber-950 font-bold uppercase tracking-wide block">
                    Official Rate ({previewItem.basis})
                  </span>
                  <span className="text-lg font-mono font-black text-amber-900">
                    {formatInr(previewItem.rateInr)}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">
                  +18% GST Extra
                </span>
              </div>

              <p className="text-[10px] text-slate-500 italic text-center font-sans">
                {DISCLAIMER_TEXT}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
