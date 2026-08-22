"use client";

import React, { useState } from "react";
import {
  Printer,
  Download,
  Copy,
  Check,
  X,
  Building2,
  Phone,
  Mail,
  FileText,
  CreditCard,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { STE_COMPANY_DETAILS, numberToWordsINR } from "@/data/company-details";
import { formatInr } from "@/data/extras-rates";

export interface InvoiceItem {
  id: string;
  code?: string;
  name: string;
  spec?: string | null;
  rateInr?: number;
  rate_inr?: number;
  quantity: number;
}

interface BillModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandName?: string;
  mobile?: string;
  stallSqft?: string;
  days?: number;
  items: InvoiceItem[];
}

export default function BillModal({
  isOpen,
  onClose,
  brandName = "Registered Exhibitor",
  mobile = "",
  stallSqft = "200 sq ft",
  days = 3,
  items = [],
}: BillModalProps) {
  const [copied, setCopied] = useState(false);
  const [downloadingDocx, setDownloadingDocx] = useState(false);

  if (!isOpen) return null;

  const invoiceNo = `STE/INV/2026/${mobile ? mobile.slice(-4) : "0001"}`;
  const currentDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  // Calculate totals
  const subtotal = items.reduce((sum, item) => {
    const rate = item.rateInr || item.rate_inr || 0;
    return sum + rate * item.quantity * days;
  }, 0);

  const cgst = Math.round(subtotal * 0.09);
  const sgst = Math.round(subtotal * 0.09);
  const totalGst = cgst + sgst;
  const grandTotal = subtotal + totalGst;
  const amountInWords = numberToWordsINR(grandTotal);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadDocx = async () => {
    setDownloadingDocx(true);
    try {
      const payload = {
        brand_name: brandName,
        mobile,
        stall_sqft: stallSqft,
        days,
        items: items.map((i) => ({
          code: i.code || "DP",
          name: i.name,
          spec: i.spec || "",
          rateInr: i.rateInr || i.rate_inr || 0,
          quantity: i.quantity,
        })),
      };

      const res = await fetch("/api/exhibitor/invoice/docx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to download DOCX");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `STE_Invoice_${brandName.replace(/[^a-zA-Z0-9]/g, "_") || "Bill"}_2026.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Unable to generate Word document. Please try printing to PDF instead.");
    } finally {
      setDownloadingDocx(false);
    }
  };

  const handleCopySummary = () => {
    const summary = [
      `🧾 SURAT TEXTILE EXHIBITION (STE) 2026 — TAX INVOICE`,
      `Header: ${STE_COMPANY_DETAILS.name}`,
      `Address: ${STE_COMPANY_DETAILS.address}`,
      `Phone: ${STE_COMPANY_DETAILS.phone} | Email: ${STE_COMPANY_DETAILS.email}`,
      `GSTIN: ${STE_COMPANY_DETAILS.gstin} | State: ${STE_COMPANY_DETAILS.state}`,
      `--------------------------------------------------`,
      `Invoice No: ${invoiceNo} | Date: ${currentDate}`,
      `Billed To: ${brandName} (${mobile}) | Stall: ${stallSqft}`,
      `Rental Duration: ${days} Days`,
      `--------------------------------------------------`,
      ...items.map(
        (it) =>
          `• ${it.quantity} × ${it.name} (${it.code || ""}) @ ₹${it.rateInr || it.rate_inr}/day × ${days}d = ${formatInr(
            (it.rateInr || it.rate_inr || 0) * it.quantity * days
          )}`
      ),
      `--------------------------------------------------`,
      `Subtotal (Taxable): ${formatInr(subtotal)}`,
      `CGST @ 9%: ${formatInr(cgst)}`,
      `SGST @ 9%: ${formatInr(sgst)}`,
      `Total GST @ 18%: ${formatInr(totalGst)}`,
      `Grand Total: ${formatInr(grandTotal)}`,
      `Amount in Words: ${amountInWords}`,
      `--------------------------------------------------`,
      `COMPANY BANK ACCOUNT DETAILS:`,
      `A/C NAME: ${STE_COMPANY_DETAILS.bankDetails.accountName}`,
      `A/C NO: ${STE_COMPANY_DETAILS.bankDetails.accountNumber}`,
      `IFSC CODE: ${STE_COMPANY_DETAILS.bankDetails.ifscCode}`,
      `BANK: ${STE_COMPANY_DETAILS.bankDetails.bankName}`,
    ].join("\n");

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto">
      <div className="bg-white text-slate-900 rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 print:shadow-none print:border-none print:max-h-none print:w-full print:rounded-none">
        {/* Action Header Bar (Hidden in Print) */}
        <div className="sticky top-0 z-20 bg-slate-900 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold">
              <FileText className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-white leading-none">
                Official Bill / Tax Invoice
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Surat Textile Exhibition 2026 — Extra Requirements
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              type="button"
              className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={handleDownloadDocx}
              disabled={downloadingDocx}
              type="button"
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-semibold transition-all flex items-center gap-1.5 disabled:opacity-50"
              title="Download Word Document (.docx)"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>{downloadingDocx ? "Generating..." : "Download Docs (.docx)"}</span>
            </button>

            <button
              onClick={handleCopySummary}
              type="button"
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-all flex items-center gap-1.5"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">{copied ? "Copied" : "Copy Text"}</span>
            </button>

            <button
              onClick={onClose}
              type="button"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Bill Canvas */}
        <div id="invoice-printable-area" className="p-6 sm:p-10 space-y-6 text-slate-900 bg-white">
          {/* 1. Official Header Section */}
          <div className="border-b-2 border-slate-900 pb-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-block px-2.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-extrabold uppercase tracking-wider mb-1">
                  Tax Invoice / Estimate Bill
                </div>
                <h1 className="text-2xl sm:text-3xl font-black font-serif text-slate-950 tracking-tight">
                  {STE_COMPANY_DETAILS.name}
                </h1>
                <p className="text-xs text-slate-700 font-medium leading-relaxed max-w-lg">
                  {STE_COMPANY_DETAILS.address}
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-800 font-medium pt-1">
                  <span>
                    <strong>Phone no.:</strong> {STE_COMPANY_DETAILS.phone}
                  </span>
                  <span>
                    <strong>Email:</strong> {STE_COMPANY_DETAILS.email}
                  </span>
                </div>
              </div>

              <div className="sm:text-right space-y-1 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="text-xs font-mono font-bold text-slate-900">
                  <span className="text-slate-500 font-normal">GSTIN: </span>
                  <span className="text-amber-800 font-black">{STE_COMPANY_DETAILS.gstin}</span>
                </div>
                <div className="text-xs font-mono text-slate-700">
                  <span className="text-slate-500">State: </span>
                  <strong>{STE_COMPANY_DETAILS.state}</strong>
                </div>
                <div className="text-xs font-mono text-slate-700">
                  <span className="text-slate-500">Invoice No: </span>
                  <strong className="text-slate-950">{invoiceNo}</strong>
                </div>
                <div className="text-xs font-mono text-slate-700">
                  <span className="text-slate-500">Date: </span>
                  <strong>{currentDate}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Exhibitor & Event Context Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-800 block mb-1">
                Billed To (Exhibitor)
              </span>
              <p className="text-base font-extrabold text-slate-950 leading-tight">
                {brandName || "Registered Exhibitor"}
              </p>
              <div className="mt-1 space-y-0.5 text-slate-700">
                {mobile && (
                  <p>
                    <span className="text-slate-500">Mobile No:</span>{" "}
                    <strong className="font-mono">{mobile}</strong>
                  </p>
                )}
                <p>
                  <span className="text-slate-500">Allocated Stall:</span>{" "}
                  <strong className="font-mono">{stallSqft}</strong>
                </p>
                <p>
                  <span className="text-slate-500">Place of Supply:</span>{" "}
                  <strong>24-Gujarat (Intra-State)</strong>
                </p>
              </div>
            </div>

            <div className="sm:border-l sm:border-slate-200 sm:pl-4">
              <span className="text-[10px] uppercase font-bold text-amber-800 block mb-1">
                Exhibition Event Details
              </span>
              <p className="text-sm font-bold text-slate-900 leading-tight">
                {STE_COMPANY_DETAILS.eventDetails.eventName}
              </p>
              <div className="mt-1 space-y-0.5 text-slate-700">
                <p>
                  <span className="text-slate-500">Dates:</span>{" "}
                  <strong>{STE_COMPANY_DETAILS.eventDetails.dates}</strong>
                </p>
                <p>
                  <span className="text-slate-500">Rental Duration:</span>{" "}
                  <strong className="font-mono text-amber-800">{days} Exhibition Days</strong>
                </p>
                <p className="text-slate-600 line-clamp-1">
                  <span className="text-slate-500">Venue:</span>{" "}
                  {STE_COMPANY_DETAILS.eventDetails.venue}
                </p>
              </div>
            </div>
          </div>

          {/* 3. Itemized Products Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-2.5 px-3 text-center w-12">#</th>
                  <th className="py-2.5 px-3">Item Code & Description</th>
                  <th className="py-2.5 px-3 text-right">Rate/Day</th>
                  <th className="py-2.5 px-3 text-center">Days</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Taxable Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400 italic">
                      No extra items selected
                    </td>
                  </tr>
                ) : (
                  items.map((item, idx) => {
                    const rate = item.rateInr || item.rate_inr || 0;
                    const lineTotal = rate * item.quantity * days;
                    return (
                      <tr
                        key={item.id || idx}
                        className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/70"}
                      >
                        <td className="py-2.5 px-3 text-center font-mono font-medium text-slate-500">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            {item.code && (
                              <span className="font-mono text-[10px] bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.5 rounded font-black">
                                {item.code}
                              </span>
                            )}
                            <span>{item.name}</span>
                          </div>
                          {item.spec && (
                            <span className="text-[10px] text-slate-500 block font-mono">
                              {item.spec}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-800">
                          ₹{rate.toLocaleString("en-IN")}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-medium text-slate-700">
                          {days}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-900">
                          {item.quantity}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-950">
                          ₹{lineTotal.toLocaleString("en-IN")}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* 4. Calculations Summary Breakdown */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-2">
            {/* Amount In Words & Terms */}
            <div className="space-y-3 sm:max-w-md text-xs">
              <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5">
                <span className="text-[10px] uppercase font-bold text-amber-800 block">
                  Invoice Amount in Words:
                </span>
                <p className="font-bold text-slate-950 mt-0.5 font-serif text-sm">
                  {amountInWords}
                </p>
              </div>

              <div className="text-[11px] text-slate-600 space-y-1">
                <span className="font-bold uppercase text-slate-800 block">
                  Terms & Conditions:
                </span>
                <ul className="list-disc pl-4 space-y-0.5 text-slate-600">
                  <li>100% advance payment required for reservation of extra items.</li>
                  <li>All rates exclude 18% GST (added above).</li>
                  <li>Images are for booking purpose only. Original product may slightly vary.</li>
                  <li>Strict cutoff: 05 September 2026, 12:00 PM.</li>
                </ul>
              </div>
            </div>

            {/* Tax Computation Table */}
            <div className="w-full sm:w-80 bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 font-mono text-xs shadow-xs">
              <div className="flex justify-between text-slate-700">
                <span>Subtotal ({days} Days):</span>
                <span className="font-bold text-slate-900">₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-slate-600 text-[11px]">
                <span>CGST @ 9%:</span>
                <span>₹{cgst.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-slate-600 text-[11px]">
                <span>SGST @ 9%:</span>
                <span>₹{sgst.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-slate-800 font-semibold border-t border-slate-200 pt-1.5">
                <span>Total GST @ 18%:</span>
                <span>₹{totalGst.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-amber-900 bg-amber-100 p-2.5 rounded-lg border border-amber-300 mt-1">
                <span className="font-serif">Grand Total (INR):</span>
                <span>₹{grandTotal.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          {/* 5. Company Bank Account Details Card (Exact as specified) */}
          <div className="bg-slate-900 text-white rounded-xl p-5 border border-amber-500/30 space-y-3 shadow-md">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
              <CreditCard className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-400">
                Official Company Bank Account Details (Payment Transfer)
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
              <div>
                <span className="text-[10px] uppercase text-slate-400 font-sans block">
                  Account Name
                </span>
                <p className="font-bold text-white text-sm">
                  {STE_COMPANY_DETAILS.bankDetails.accountName}
                </p>
              </div>

              <div>
                <span className="text-[10px] uppercase text-slate-400 font-sans block">
                  Account Number
                </span>
                <p className="font-black text-amber-400 text-base tracking-wider">
                  {STE_COMPANY_DETAILS.bankDetails.accountNumber}
                </p>
              </div>

              <div>
                <span className="text-[10px] uppercase text-slate-400 font-sans block">
                  IFSC Code & Bank
                </span>
                <p className="font-bold text-white text-sm">
                  {STE_COMPANY_DETAILS.bankDetails.ifscCode}
                  <span className="text-xs text-slate-400 font-sans ml-1">
                    ({STE_COMPANY_DETAILS.bankDetails.bankName})
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* 6. Signatory & Footer */}
          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-end gap-6 text-xs text-slate-600">
            <div>
              <p className="text-[10px] text-slate-500">
                This is a computer-generated tax invoice & billing requisition document for Surat Textile Exhibition 2026.
              </p>
            </div>

            <div className="text-right space-y-6 sm:w-64">
              <span className="font-bold text-slate-900 block">
                For Surat textile exhibition
              </span>
              <div className="border-b border-slate-400 w-48 ml-auto" />
              <span className="text-[11px] text-slate-500 uppercase font-bold block">
                Authorized Signatory
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
