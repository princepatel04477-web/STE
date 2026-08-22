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
      <div className="bg-neutral-900/80 border border-amber-500/30 rounded-2xl p-6 md:p-8 backdrop-blur-md shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Calculator className="w-3.5 h-3.5" />
              <span>Interactive Rental Cost Estimator</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white font-serif tracking-tight">
              Calculate Your Exhibition Extras Estimate
            </h2>
            <p className="text-xs md:text-sm text-neutral-400 max-w-xl">
              Adjust item quantities and duration below. Item rates are excluding GST (18% GST will be calculated at checkout).
            </p>
          </div>

          {/* Days Selection Input */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 flex items-center gap-4 shrink-0">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Duration (Days)
              </label>
              <span className="text-xs text-neutral-500">Min 1 — Max 10</span>
            </div>
            <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-lg p-1">
              <button
                type="button"
                onClick={() => handleDaysChange(days - 1)}
                className="w-8 h-8 rounded bg-neutral-800 hover:bg-neutral-700 text-white flex items-center justify-center font-bold transition-colors"
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
                className="w-10 text-center font-mono font-bold text-base bg-transparent text-amber-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleDaysChange(days + 1)}
                className="w-8 h-8 rounded bg-amber-500 hover:bg-amber-400 text-neutral-950 flex items-center justify-center font-bold transition-colors"
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
              <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-neutral-800 pb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                {CATEGORY_LABELS[category]}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryItems.map((item) => {
                  const qty = quantities[item.id] || 0;
                  const lineTotal = item.rateInr * qty * days;

                  return (
                    <div
                      key={item.id}
                      className={`bg-neutral-900/70 border rounded-xl p-4 flex flex-col justify-between transition-all ${
                        qty > 0
                          ? "border-amber-500/50 bg-neutral-900/90 shadow-lg shadow-amber-500/5"
                          : "border-neutral-800 hover:border-neutral-700"
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-bold text-white text-sm leading-snug">{item.name}</h4>
                          <span className="text-xs font-mono font-bold text-amber-400 shrink-0">
                            {formatInr(item.rateInr)} / day
                          </span>
                        </div>
                        {item.spec && (
                          <p className="text-[11px] font-mono text-neutral-400 mb-3">{item.spec}</p>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-neutral-800/80 mt-2">
                        <div className="text-xs">
                          {qty > 0 ? (
                            <span className="text-amber-300 font-mono font-semibold">
                              Total: {formatInr(lineTotal)}
                            </span>
                          ) : (
                            <span className="text-neutral-500 text-[11px]">Select qty</span>
                          )}
                        </div>

                        {/* Stepper controls */}
                        <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 rounded-lg p-1">
                          <button
                            type="button"
                            onClick={() => handleQtyChange(item.id, -1)}
                            className="w-7 h-7 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-300 flex items-center justify-center transition-colors active:scale-95"
                            aria-label={`Decrease ${item.name} quantity`}
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-6 text-center font-mono font-bold text-sm text-white">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQtyChange(item.id, 1)}
                            className="w-7 h-7 rounded bg-amber-500 hover:bg-amber-400 text-neutral-950 flex items-center justify-center font-bold transition-colors active:scale-95"
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
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 lg:p-8 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            Estimate Calculation Summary
          </h3>
          <span className="text-xs text-neutral-400">
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
                    className="flex items-center justify-between text-xs py-1.5 border-b border-neutral-900"
                  >
                    <span className="text-neutral-300 font-medium">
                      {qty} × {item.name} <span className="text-neutral-500">({days} days)</span>
                    </span>
                    <span className="font-mono text-white font-semibold">{formatInr(lineTotal)}</span>
                  </div>
                );
              })}
            </div>

            {/* Calculations Breakdown */}
            <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-4 space-y-2.5 font-mono text-xs">
              <div className="flex justify-between text-neutral-400">
                <span>Subtotal ({days} Days):</span>
                <span className="text-white font-semibold">{formatInr(subtotal)}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>GST @ 18%:</span>
                <span className="text-neutral-300">{formatInr(gstAmount)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-amber-400 pt-2 border-t border-neutral-800">
                <span className="font-serif">Grand Total (Incl. GST):</span>
                <span>{formatInr(grandTotal)}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowBillModal(true)}
                className="w-full sm:flex-1 py-3.5 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                <span>Generate Official Bill / Tax Invoice</span>
              </button>

              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="w-full sm:w-auto py-3.5 px-6 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs uppercase tracking-wider border border-neutral-700 transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4 text-amber-400" />
                <span>Submit Request</span>
              </button>

              <button
                type="button"
                onClick={handleCopySummary}
                className="w-full sm:w-auto py-3.5 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 font-semibold text-xs transition-all flex items-center justify-center gap-2"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? "Copied!" : "Copy"}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 text-neutral-500 text-sm">
            Select item quantities above to generate your instant rental calculation.
          </div>
        )}
      </div>

      {/* Sticky Mobile Summary Bar (<768px) */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-neutral-950/95 backdrop-blur-md border-t border-amber-500/30 p-3.5 shadow-2xl">
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] uppercase font-bold text-neutral-400 block">Grand Total (GST Incl.)</span>
            <span className="text-base font-black text-amber-400 font-mono">
              {formatInr(grandTotal)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowBillModal(true)}
              disabled={selectedItems.length === 0}
              className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-neutral-950 font-bold text-xs uppercase tracking-wider shadow-md flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Bill</span>
            </button>

            <button
              type="button"
              onClick={() => setShowModal(true)}
              disabled={selectedItems.length === 0}
              className="py-2.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider border border-neutral-700 shadow-md flex items-center gap-1.5"
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
        <div className="fixed inset-0 z-modal bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-lg bg-neutral-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 w-fit mb-3">
                <Send className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white font-serif">Submit Your Extras Request</h3>
              <p className="text-xs text-neutral-400 mt-1">
                Send your selected rental list directly to the STE 2026 Organizer Team for instant confirmation.
              </p>
            </div>

            {submitSuccess ? (
              <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-xl p-5 text-center space-y-3">
                <Check className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="font-bold text-white text-base">Request Submitted Successfully!</h4>
                <p className="text-xs text-neutral-300">
                  Our exhibition operations team will contact you shortly to confirm your items.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setSubmitSuccess(false);
                  }}
                  className="px-6 py-2 bg-emerald-500 text-neutral-950 font-bold rounded-lg text-xs uppercase"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 text-xs font-mono text-neutral-300 max-h-48 overflow-y-auto whitespace-pre-wrap">
                  {generateSerializedSummary()}
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleWhatsAppRequest}
                    className="w-full py-3 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Send via WhatsApp (+91 99507 87787)</span>
                  </button>

                  <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-neutral-800" />
                    <span className="flex-shrink mx-4 text-[10px] text-neutral-500 uppercase font-bold">OR</span>
                    <div className="flex-grow border-t border-neutral-800" />
                  </div>

                  <form onSubmit={handleDirectSubmit} className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-300 mb-1">
                        Your Mobile Number
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 98250XXXXX"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-base md:text-xs focus:outline-none focus:border-amber-500 font-mono"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-neutral-950 font-bold rounded-xl text-xs uppercase tracking-wider transition-all"
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
