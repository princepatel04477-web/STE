"use client";

import React, { useState } from "react";
import { Plus, Minus, Calculator, Send, Copy, Check, MessageSquare, Sparkles, X, FileText, Printer } from "lucide-react";
import { EXTRAS_RATES, GST_RATE, formatInr, ExtraCategory, CATEGORY_LABELS } from "@/data/extras-rates";
import BillModal from "./BillModal";
import { STE_COMPANY_DETAILS } from "@/data/company-details";

const CATEGORY_ORDER: ExtraCategory[] = ["furniture", "display-av", "electrical"];

export default function EstimateBuilder() {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [days, setDays] = useState<number>(2); // Default 2 exhibition days
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showBillModal, setShowBillModal] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [mobileNumber, setMobileNumber] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  const handleQtyChange = (id: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[id] || 0;
      const updated = Math.min(20, Math.max(0, current + delta));
      if (updated === 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: updated };
    });
  };

  const handleDaysChange = (val: number) => {
    const valid = Math.min(10, Math.max(1, val));
    setDays(valid);
  };

  // Calculate math
  const selectedItems = EXTRAS_RATES.filter((item) => (quantities[item.id] || 0) > 0);
  const totalItemCount = selectedItems.reduce((sum, item) => sum + (quantities[item.id] || 0), 0);

  const subtotal = selectedItems.reduce((sum, item) => {
    const qty = quantities[item.id] || 0;
    return sum + item.rateInr * qty * days;
  }, 0);

  const gstAmount = Math.round(subtotal * GST_RATE);
  const grandTotal = subtotal + gstAmount;

  // Build serialized summary string
  const generateSerializedSummary = () => {
    if (selectedItems.length === 0) return "No rental extras selected.";

    const lines = selectedItems.map((item) => {
      const qty = quantities[item.id];
      const lineTotal = item.rateInr * qty * days;
      return `${qty} × [${item.code}] ${item.name} (${days} day${days > 1 ? "s" : ""}) — ${formatInr(lineTotal)}`;
    });

    return [
      `🏛️ ${STE_COMPANY_DETAILS.name.toUpperCase()}`,
      `Address: ${STE_COMPANY_DETAILS.address}`,
      `Phone: ${STE_COMPANY_DETAILS.phone} | GSTIN: ${STE_COMPANY_DETAILS.gstin}`,
      `------------------------------------`,
      "📋 EXHIBITOR EXTRAS ESTIMATE",
      "------------------------------------",
      ...lines,
      "------------------------------------",
      `Subtotal (${days} days): ${formatInr(subtotal)}`,
      `GST @ 18%: ${formatInr(gstAmount)}`,
      `Grand Total (Incl. GST): ${formatInr(grandTotal)}`,
      "------------------------------------",
      "🏦 COMPANY BANK DETAILS FOR PAYMENT:",
      `A/C NAME: ${STE_COMPANY_DETAILS.bankDetails.accountName}`,
      `A/C NO: ${STE_COMPANY_DETAILS.bankDetails.accountNumber}`,
      `IFSC CODE: ${STE_COMPANY_DETAILS.bankDetails.ifscCode}`,
    ].join("\n");
  };

  const handleCopySummary = () => {
    navigator.clipboard.writeText(generateSerializedSummary());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppRequest = () => {
    const text = encodeURIComponent(
      `Namaste! I would like to request exhibitor extras for STE 2026:\n\n${generateSerializedSummary()}`
    );
    window.open(`https://wa.me/919950787787?text=${text}`, "_blank");
  };

  const handleDirectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileNumber || mobileNumber.replace(/\D/g, "").length < 10) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/exhibitor/extras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: selectedItems.map((item) => ({
            id: item.id,
            name: item.name,
            category: item.category,
            unit: item.basis,
            quantity: quantities[item.id],
          })),
          special_notes: `Estimate Builder Calculation (${days} Days Total):\n${generateSerializedSummary()}`,
        }),
      });

      if (res.ok) {
        setSubmitSuccess(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="estimate-builder" className="w-full space-y-8 pt-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold uppercase tracking-wider shadow-xs">
              <Calculator className="w-3.5 h-3.5" />
              <span>Interactive Rental Cost Estimator</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-950 font-serif tracking-tight">
              Calculate Your Exhibition Extras Estimate
            </h2>
            <p className="text-xs md:text-sm text-slate-600 max-w-xl font-medium">
              Adjust item quantities and duration below. Item rates are excluding GST (18% GST will be calculated at checkout).
            </p>
          </div>

          {/* Days Selection Input */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-4 shrink-0 shadow-xs">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                Duration (Days)
              </label>
              <span className="text-xs text-slate-500 font-medium">Min 1 — Max 10</span>
            </div>
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-1 shadow-xs">
              <button
                type="button"
                onClick={() => handleDaysChange(days - 1)}
                className="w-8 h-8 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center font-bold transition-colors"
                aria-label="Decrease exhibition days"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <input
                type="number"
                min={1}
                max={10}
                value={days}
                onChange={(e) => handleDaysChange(parseInt(e.target.value, 10) || 1)}
                className="w-10 text-center font-mono font-bold text-base bg-transparent text-amber-800 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleDaysChange(days + 1)}
                className="w-8 h-8 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center font-bold transition-colors shadow-xs"
                aria-label="Increase exhibition days"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Item Selection Grid per Category */}
      <div className="space-y-8">
        {CATEGORY_ORDER.map((category) => {
          const categoryItems = EXTRAS_RATES.filter((item) => item.category === category);

          return (
            <div key={category} className="space-y-4">
              <h3 className="text-lg font-bold text-slate-950 flex items-center gap-2 border-b border-slate-200 pb-2">
                <span className="w-2 h-2 rounded-full bg-amber-600 shadow-xs" />
                <span>{CATEGORY_LABELS[category]}</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryItems.map((item) => {
                  const qty = quantities[item.id] || 0;
                  const lineTotal = item.rateInr * qty * days;

                  return (
                    <div
                      key={item.id}
                      className={`border rounded-xl p-4 flex flex-col justify-between transition-all ${
                        qty > 0
                          ? "border-amber-400 bg-amber-50/40 shadow-sm"
                          : "bg-white border-slate-200 hover:border-amber-300 shadow-xs"
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-bold text-slate-950 text-sm leading-snug">{item.name}</h4>
                          <span className="text-xs font-mono font-black text-amber-800 shrink-0">
                            {formatInr(item.rateInr)} / day
                          </span>
                        </div>
                        {item.spec && (
                          <p className="text-[11px] font-mono text-slate-500 mb-3">{item.spec}</p>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-200 mt-2">
                        <div className="text-xs">
                          {qty > 0 ? (
                            <span className="text-amber-900 font-mono font-bold">
                              Total: {formatInr(lineTotal)}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">Select qty</span>
                          )}
                        </div>

                        {/* Stepper controls */}
                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-1">
                          <button
                            type="button"
                            onClick={() => handleQtyChange(item.id, -1)}
                            className="w-7 h-7 rounded bg-white hover:bg-slate-200 text-slate-700 border border-slate-200 flex items-center justify-center transition-colors active:scale-95 shadow-xs"
                            aria-label={`Decrease ${item.name} quantity`}
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-6 text-center font-mono font-bold text-sm text-slate-900">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQtyChange(item.id, 1)}
                            className="w-7 h-7 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center font-bold transition-colors active:scale-95 shadow-xs"
                            aria-label={`Increase ${item.name} quantity`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Box & Calculation Breakdown */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 lg:p-8 space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <h3 className="text-xl font-bold text-slate-950 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-600" />
            <span>Estimate Calculation Summary</span>
          </h3>
          <span className="text-xs text-slate-500 font-semibold font-mono">
            {totalItemCount} item{totalItemCount === 1 ? "" : "s"} selected ({days} days)
          </span>
        </div>

        {selectedItems.length > 0 ? (
          <div className="space-y-4">
            {/* Selected item lines */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2 scrollbar-thin">
              {selectedItems.map((item) => {
                const qty = quantities[item.id];
                const lineTotal = item.rateInr * qty * days;
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100"
                  >
                    <span className="text-slate-800 font-medium">
                      {qty} × {item.name} <span className="text-slate-500">({days} days)</span>
                    </span>
                    <span className="font-mono text-slate-950 font-bold">{formatInr(lineTotal)}</span>
                  </div>
                );
              })}
            </div>

            {/* Calculations Breakdown */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 font-mono text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal ({days} Days):</span>
                <span className="text-slate-950 font-bold">{formatInr(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600 text-[11px]">
                <span>GST @ 18%:</span>
                <span className="text-slate-800">{formatInr(gstAmount)}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-amber-900 bg-amber-100/80 p-2.5 rounded-lg border border-amber-300">
                <span className="font-serif">Grand Total (Incl. GST):</span>
                <span>{formatInr(grandTotal)}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowBillModal(true)}
                className="w-full sm:flex-1 py-3.5 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                <span>Generate Official Bill / Tax Invoice</span>
              </button>

              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="w-full sm:w-auto py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xs"
              >
                <Send className="w-4 h-4 text-amber-400" />
                <span>Submit Request</span>
              </button>

              <button
                type="button"
                onClick={handleCopySummary}
                className="w-full sm:w-auto py-3.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-semibold text-xs transition-all flex items-center justify-center gap-2"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? "Copied!" : "Copy"}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 text-slate-400 text-sm">
            Select item quantities above to generate your instant rental calculation.
          </div>
        )}
      </div>

      {/* Sticky Mobile Summary Bar (<768px) */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3.5 shadow-2xl">
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Grand Total (GST Incl.)</span>
            <span className="text-base font-black text-amber-800 font-mono">
              {formatInr(grandTotal)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowBillModal(true)}
              disabled={selectedItems.length === 0}
              className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-sm flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Bill</span>
            </button>

            <button
              type="button"
              onClick={() => setShowModal(true)}
              disabled={selectedItems.length === 0}
              className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider shadow-sm flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5 text-amber-400" />
              <span>Request</span>
            </button>
          </div>
        </div>
      </div>

      {/* Official Tax Invoice / Bill Modal */}
      <BillModal
        isOpen={showBillModal}
        onClose={() => setShowBillModal(false)}
        brandName="Valued Exhibitor"
        mobile={mobileNumber || "9950787787"}
        stallSqft="200 sq ft"
        days={days}
        items={selectedItems.map((it) => ({
          id: it.id,
          code: it.code,
          name: it.name,
          spec: it.spec,
          rateInr: it.rateInr,
          quantity: quantities[it.id] || 0,
        }))}
      />

      {/* Handoff Modal */}
      {showModal && (
        <div className="fixed inset-0 z-modal bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="p-2.5 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 w-fit mb-3 shadow-xs">
                <Send className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-950 font-serif">Submit Your Extras Request</h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Send your selected rental list directly to the STE 2026 Organizer Team for instant confirmation.
              </p>
            </div>

            {submitSuccess ? (
              <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-5 text-center space-y-3">
                <Check className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-slate-950 text-base">Request Submitted Successfully!</h4>
                <p className="text-xs text-slate-600">
                  Our exhibition operations team will contact you shortly to confirm your items.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setSubmitSuccess(false);
                  }}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs uppercase shadow-xs"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-mono text-slate-700 max-h-48 overflow-y-auto whitespace-pre-wrap">
                  {generateSerializedSummary()}
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleWhatsAppRequest}
                    className="w-full py-3 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Send via WhatsApp (+91 99507 87787)</span>
                  </button>

                  <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-slate-200" />
                    <span className="flex-shrink mx-4 text-[10px] text-slate-400 uppercase font-bold">OR</span>
                    <div className="flex-grow border-t border-slate-200" />
                  </div>

                  <form onSubmit={handleDirectSubmit} className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Your Mobile Number
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 98250XXXXX"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-base md:text-xs focus:outline-none focus:border-amber-500 font-mono"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-sm"
                    >
                      {submitting ? "Submitting..." : "Submit to Organizers"}
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
