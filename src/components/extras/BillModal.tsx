"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Printer,
  Download,
  X,
  FileText,
  CreditCard,
} from "lucide-react";
import { STE_COMPANY_DETAILS, numberToWordsINR } from "@/data/company-details";

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
  fasciaNames?: string[];
  days?: number;
  items: InvoiceItem[];
}

export default function BillModal({
  isOpen,
  onClose,
  brandName = "Registered Exhibitor",
  mobile = "",
  stallSqft = "200 sq ft",
  fasciaNames,
  days = 2,
  items = [],
}: BillModalProps) {
  const [mounted, setMounted] = useState(false);
  const [downloadingDocx, setDownloadingDocx] = useState(false);
  const [currentDays, setCurrentDays] = useState<number>(days || 2);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (days) setCurrentDays(days);
  }, [days]);

  if (!isOpen) return null;

  const invoiceNo = `STE/INV/2026/${mobile ? mobile.slice(-4) : "0001"}`;
  const currentDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const subtotal = items.reduce((sum, item) => {
    const rate = item.rateInr || item.rate_inr || 0;
    return sum + rate * item.quantity * currentDays;
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
        fascia_names: fasciaNames || [],
        days: currentDays,
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

      if (!res.ok) throw new Error("Failed to generate Word document");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `STE_Invoice_${mobile || "bill"}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Failed to download DOCX bill.");
    } finally {
      setDownloadingDocx(false);
    }
  };

  const modalContent = (
    <div className="bill-modal-portal-root">
      {/* Global Strict Print CSS rules injected when modal is active */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 6mm 8mm 6mm 8mm;
          }
          html, body {
            background: #ffffff !important;
            color: #0f172a !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            overflow: visible !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          /* Hide all elements on page except the bill modal portal */
          body > *:not(.bill-modal-portal-root) {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            overflow: hidden !important;
          }
          .bill-modal-portal-root {
            display: block !important;
            visibility: visible !important;
            position: static !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
          }
          .bill-modal-backdrop {
            position: static !important;
            display: block !important;
            background: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            overflow: visible !important;
            box-shadow: none !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
          }
          .bill-modal-card {
            position: static !important;
            display: block !important;
            max-height: none !important;
            width: 100% !important;
            max-width: 100% !important;
            border: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            background: #ffffff !important;
            overflow: visible !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .bill-modal-no-print {
            display: none !important;
            visibility: hidden !important;
          }
          .printable-invoice-content {
            padding: 2mm 0 !important;
            margin: 0 !important;
            width: 100% !important;
            overflow: visible !important;
            font-size: 10.5px !important;
            line-height: 1.3 !important;
          }
          .print-avoid-break {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>

      <div className="bill-modal-backdrop fixed inset-0 z-[100] overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white print:static print:overflow-visible">
        <div className="bill-modal-card relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:border-none print:shadow-none print:rounded-none print:w-full print:static">
          
          {/* Modal Action Bar (Hidden in Print) */}
          <div className="bill-modal-no-print flex items-center justify-between px-6 py-3.5 bg-slate-900 text-white border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" />
              <span className="font-bold text-sm">Official Tax Invoice & Requisition Summary</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 font-mono">
                Original For Recipient
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Quick Days Selector in Modal Header */}
              <div className="hidden sm:flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-lg p-1 text-xs">
                <span className="text-[11px] text-slate-400 font-bold px-1.5">Days:</span>
                <button
                  type="button"
                  onClick={() => setCurrentDays((d) => Math.max(1, d - 1))}
                  disabled={currentDays <= 1}
                  className="w-6 h-6 rounded bg-slate-700 hover:bg-slate-600 text-white font-bold flex items-center justify-center disabled:opacity-40"
                  aria-label="Decrease days"
                >
                  -
                </button>
                <span className="font-mono font-bold text-amber-300 px-1 text-xs">{currentDays}</span>
                <button
                  type="button"
                  onClick={() => setCurrentDays((d) => Math.min(30, d + 1))}
                  disabled={currentDays >= 30}
                  className="w-6 h-6 rounded bg-slate-700 hover:bg-slate-600 text-white font-bold flex items-center justify-center disabled:opacity-40"
                  aria-label="Increase days"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={handleDownloadDocx}
                disabled={downloadingDocx}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all border border-slate-700 disabled:opacity-50"
                title="Download editable Microsoft Word format"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>{downloadingDocx ? "Generating Word..." : "Download .DOCX"}</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all shadow-sm"
                title="Print Tax Invoice (A4 Size)"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Save as PDF</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all ml-1"
                aria-label="Close invoice modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Printable Tax Invoice Content (Optimized to fit on 1 A4 page) */}
          <div id="printable-bill" className="printable-invoice-content p-5 sm:p-7 overflow-y-auto space-y-4 print:p-0 print:overflow-visible print:space-y-3 text-slate-900">
            
            {/* 1. Official Header & Company Info */}
            <div className="border-b-2 border-slate-900 pb-3 print-avoid-break">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <span className="text-[9.5px] font-mono uppercase tracking-widest text-amber-800 font-black block mb-0.5">
                    TAX INVOICE / OFFICIAL PROFORMA BILL
                  </span>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-950 uppercase tracking-tight font-serif">
                    {STE_COMPANY_DETAILS.name}
                  </h1>
                  <p className="text-[11px] text-slate-600 mt-0.5 max-w-md font-medium leading-tight">
                    {STE_COMPANY_DETAILS.address}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-600 mt-0.5 font-mono">
                    <span>
                      <strong>Phone no.:</strong> {STE_COMPANY_DETAILS.phone}
                    </span>
                    <span>
                      <strong>Email:</strong> {STE_COMPANY_DETAILS.email}
                    </span>
                  </div>
                </div>

                <div className="sm:text-right space-y-0.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200 shrink-0 text-xs">
                  <div className="font-mono font-bold text-slate-900">
                    <span className="text-slate-500 font-normal text-[10.5px]">GSTIN: </span>
                    <span className="text-amber-800 font-black">{STE_COMPANY_DETAILS.gstin}</span>
                  </div>
                  <div className="font-mono text-slate-700 text-[11px]">
                    <span className="text-slate-500">Invoice No: </span>
                    <strong className="text-slate-950">{invoiceNo}</strong>
                  </div>
                  <div className="font-mono text-slate-700 text-[11px]">
                    <span className="text-slate-500">Date: </span>
                    <strong>{currentDate}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Exhibitor & Event Context Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 border border-slate-200 rounded-lg p-3 text-[11px] print-avoid-break">
              <div>
                <span className="text-[9.5px] uppercase font-black text-amber-800 block mb-0.5">
                  Billed To (Exhibitor)
                </span>
                <p className="text-sm font-black text-slate-950 leading-tight">
                  {brandName || "Registered Exhibitor"}
                </p>
                {fasciaNames && fasciaNames.some((n) => n && n.trim()) && (
                  <p className="text-[10px] text-amber-900 font-bold mt-0.5">
                    <span className="text-slate-500 font-normal">Fascia: </span>
                    {fasciaNames.filter(Boolean).join(" | ")}
                  </p>
                )}
                <div className="mt-0.5 space-y-0.5 text-slate-700">
                  {mobile && (
                    <p>
                      <span className="text-slate-500">Mobile No:</span>{" "}
                      <strong className="font-mono text-slate-950">{mobile}</strong>
                    </p>
                  )}
                  <p>
                    <span className="text-slate-500">Allocated Stall:</span>{" "}
                    <strong className="font-mono text-slate-950">{stallSqft}</strong>
                  </p>
                  <p>
                    <span className="text-slate-500">Place of Supply:</span>{" "}
                    <strong>24-Gujarat (Intra-State)</strong>
                  </p>
                </div>
              </div>

              <div className="sm:border-l sm:border-slate-200 sm:pl-3">
                <span className="text-[9.5px] uppercase font-black text-amber-800 block mb-0.5">
                  Exhibition Event Details
                </span>
                <p className="text-xs font-bold text-slate-900 leading-tight">
                  {STE_COMPANY_DETAILS.eventDetails.eventName}
                </p>
                <div className="mt-0.5 space-y-0.5 text-slate-700">
                  <p>
                    <span className="text-slate-500">Dates:</span>{" "}
                    <strong>{STE_COMPANY_DETAILS.eventDetails.dates}</strong>
                  </p>
                  <p>
                    <span className="text-slate-500">Rental Duration:</span>{" "}
                    <strong className="font-mono text-amber-800 font-bold">{currentDays} Exhibition {currentDays === 1 ? 'Day' : 'Days'}</strong>
                  </p>
                  <p className="text-slate-600">
                    <span className="text-slate-500">Venue:</span>{" "}
                    {STE_COMPANY_DETAILS.eventDetails.venue}
                  </p>
                </div>
              </div>
            </div>

            {/* 3. Itemized Products Table */}
            <div className="border border-slate-200 rounded-lg overflow-hidden shadow-xs">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-2 px-2.5 text-center w-10">#</th>
                    <th className="py-2 px-2.5">Item Code & Description</th>
                    <th className="py-2 px-2.5 text-right">Rate/Day</th>
                    <th className="py-2 px-2.5 text-center">Days</th>
                    <th className="py-2 px-2.5 text-center">Qty</th>
                    <th className="py-2 px-2.5 text-right">Amount (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-4 text-center text-slate-400 italic">
                        No extra items selected
                      </td>
                    </tr>
                  ) : (
                    items.map((item, idx) => {
                      const rate = item.rateInr || item.rate_inr || 0;
                      const lineTotal = rate * item.quantity * currentDays;
                      return (
                        <tr
                          key={item.id || idx}
                          className={`print-avoid-break ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"}`}
                        >
                          <td className="py-1.5 px-2.5 text-center font-mono font-medium text-slate-500">
                            {idx + 1}
                          </td>
                          <td className="py-1.5 px-2.5">
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              {item.code && (
                                <span className="font-mono text-[9px] bg-amber-100 text-amber-900 border border-amber-300 px-1 py-0.2 rounded font-black">
                                  {item.code}
                                </span>
                              )}
                              <span>{item.name}</span>
                            </div>
                            {item.spec && (
                              <span className="text-[9.5px] text-slate-500 block font-mono">
                                {item.spec}
                              </span>
                            )}
                          </td>
                          <td className="py-1.5 px-2.5 text-right font-mono font-semibold text-slate-800">
                            ₹{rate.toLocaleString("en-IN")}
                          </td>
                          <td className="py-1.5 px-2.5 text-center font-mono font-medium text-slate-700">
                            {currentDays}
                          </td>
                          <td className="py-1.5 px-2.5 text-center font-mono font-bold text-slate-900">
                            {item.quantity}
                          </td>
                          <td className="py-1.5 px-2.5 text-right font-mono font-bold text-slate-950">
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
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-1 print-avoid-break">
              {/* Amount In Words & Terms */}
              <div className="space-y-2 sm:max-w-md text-[10.5px]">
                <div className="bg-amber-50/80 border border-amber-200 rounded-lg p-2.5">
                  <span className="text-[9px] uppercase font-black text-amber-800 block">
                    Invoice Amount in Words:
                  </span>
                  <p className="font-black text-slate-950 mt-0.5 font-serif text-xs">
                    {amountInWords}
                  </p>
                </div>

                <div className="text-[10px] text-slate-600 space-y-0.5">
                  <span className="font-bold uppercase text-slate-800 block">
                    Terms & Conditions:
                  </span>
                  <ul className="list-disc pl-3.5 space-y-0.5 text-slate-600 leading-tight">
                    <li>100% advance payment required for reservation of extra items.</li>
                    <li>All rates exclude 18% GST (calculated below).</li>
                    <li>Images are for reference. Original items may slightly vary.</li>
                    <li>Strict modification cutoff: 05 September 2026, 12:00 PM.</li>
                  </ul>
                </div>
              </div>

              {/* Tax Computation Table */}
              <div className="w-full sm:w-72 bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1.5 font-mono text-[11px] shadow-xs shrink-0">
                <div className="flex justify-between text-slate-700">
                  <span>Subtotal ({currentDays} {currentDays === 1 ? 'Day' : 'Days'}):</span>
                  <span className="font-bold text-slate-900">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-slate-600 text-[10px]">
                  <span>CGST @ 9%:</span>
                  <span>₹{cgst.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-slate-600 text-[10px]">
                  <span>SGST @ 9%:</span>
                  <span>₹{sgst.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-slate-800 font-semibold border-t border-slate-200 pt-1 text-[10.5px]">
                  <span>Total GST @ 18%:</span>
                  <span>₹{totalGst.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-xs font-black text-amber-900 bg-amber-100/90 p-2 rounded-md border border-amber-300 mt-1">
                  <span className="font-serif">Grand Total (INR):</span>
                  <span>₹{grandTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            {/* 5. Company Bank Account Details Card */}
            <div className="bg-slate-900 text-white rounded-lg p-3.5 border border-amber-500/30 space-y-2 shadow-sm print-avoid-break print:bg-slate-100 print:text-slate-900 print:border-slate-300">
              <div className="flex items-center gap-1.5 border-b border-slate-800 print:border-slate-300 pb-1.5">
                <CreditCard className="w-3.5 h-3.5 text-amber-400 print:text-amber-800" />
                <h4 className="text-[10px] font-black uppercase tracking-wider text-amber-400 print:text-amber-900">
                  Official Company Bank Account Details (Payment Transfer)
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[11px]">
                <div>
                  <span className="text-[9px] uppercase text-slate-400 print:text-slate-600 font-sans block">
                    Account Name
                  </span>
                  <p className="font-bold text-white print:text-slate-950 text-xs">
                    {STE_COMPANY_DETAILS.bankDetails.accountName}
                  </p>
                </div>

                <div>
                  <span className="text-[9px] uppercase text-slate-400 print:text-slate-600 font-sans block">
                    Account Number
                  </span>
                  <p className="font-black text-amber-400 print:text-amber-900 text-xs tracking-wider">
                    {STE_COMPANY_DETAILS.bankDetails.accountNumber}
                  </p>
                </div>

                <div>
                  <span className="text-[9px] uppercase text-slate-400 print:text-slate-600 font-sans block">
                    IFSC Code & Bank
                  </span>
                  <p className="font-bold text-white print:text-slate-950 text-xs">
                    {STE_COMPANY_DETAILS.bankDetails.ifscCode}
                    <span className="text-[10px] text-slate-400 print:text-slate-600 font-sans ml-1">
                      ({STE_COMPANY_DETAILS.bankDetails.bankName})
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* 6. Signatory & Footer */}
            <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-end gap-3 text-[10.5px] text-slate-600 print-avoid-break">
              <div>
                <p className="text-[9.5px] text-slate-500 font-sans">
                  This is a computer-generated tax invoice & billing requisition document for Surat Textile Exhibition 2026.
                </p>
              </div>

              <div className="text-right space-y-3 sm:w-56 shrink-0">
                <span className="font-bold text-slate-900 text-[11px] block">
                  For Surat textile exhibition
                </span>
                <div className="border-b border-slate-400 w-36 ml-auto pt-2" />
                <span className="text-[9.5px] text-slate-500 uppercase font-black block tracking-wider">
                  Authorized Signatory
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );

  if (!mounted) return null;
  return createPortal(modalContent, document.body);
}
