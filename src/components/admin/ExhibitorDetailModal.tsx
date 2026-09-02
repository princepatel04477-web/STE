'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Building2,
  Phone,
  Ruler,
  ShoppingBag,
  FileCode,
  FolderOpen,
  ExternalLink,
  Calendar,
  FileText,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Store,
  Layers,
  Printer,
  Info
} from 'lucide-react';
import { EXTRAS_RATES } from '@/data/extras-rates';

export interface ExhibitorDetailItem {
  id: string;
  name: string;
  category?: string;
  quantity: number;
  unit: string;
  days?: number;
}

export interface ExhibitorDetailData {
  mobile: string;
  brand_name: string;
  exhibitor_name?: string;
  profile_pic_url?: string | null;
  company_description?: string;
  stall_sqft: string;
  stall_number?: string;
  stall_hall?: string;
  stall_allocated_at?: string;
  category?: string;
  market?: string;
  fascia_names?: string[];
  items: ExhibitorDetailItem[];
  special_notes: string;
  logo_file_url?: string;
  cdr_file_url?: string;
  drive_file_url?: string;
  drive_folder_url?: string;
  rental_days?: number;
  last_updated?: string;
}

interface ExhibitorDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  exhibitor: ExhibitorDetailData | null;
  onOpenBillModal?: (ex: ExhibitorDetailData) => void;
}

export default function ExhibitorDetailModal({
  isOpen,
  onClose,
  exhibitor,
  onOpenBillModal
}: ExhibitorDetailModalProps) {
  const [mounted, setMounted] = useState(false);
  const [copiedMobile, setCopiedMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !exhibitor) return null;

  const handleCopyMobile = () => {
    navigator.clipboard.writeText(exhibitor.mobile);
    setCopiedMobile(true);
    setTimeout(() => setCopiedMobile(false), 2000);
  };

  // Calculate items cost preview
  const itemsWithRates = exhibitor.items.map((it) => {
    const master = EXTRAS_RATES.find(
      (m) => m.id === it.id || m.name.toLowerCase() === it.name.toLowerCase()
    );
    const rate = master?.rateInr || 600;
    const days = it.days || exhibitor.rental_days || 2;
    const total = rate * it.quantity * days;
    return {
      ...it,
      code: master?.code || 'DP',
      rate,
      days,
      total
    };
  });

  const subtotal = itemsWithRates.reduce((sum, i) => sum + i.total, 0);
  const gst = Math.round(subtotal * 0.18);
  const grandTotal = subtotal + gst;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white text-slate-900 w-full max-w-4xl max-h-[92vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="exhibitor-modal-title"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white p-5 sm:p-6 flex items-start justify-between relative shrink-0">
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              {exhibitor.profile_pic_url ? (
                <a
                  href={exhibitor.profile_pic_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-md hover:scale-105 transition-transform bg-slate-800"
                  title="Click to view full photo"
                >
                  <img
                    src={exhibitor.profile_pic_url}
                    alt={exhibitor.exhibitor_name || exhibitor.brand_name}
                    className="w-full h-full object-cover"
                  />
                </a>
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-500/20 border-2 border-amber-400/40 flex items-center justify-center text-amber-400 font-extrabold text-2xl font-mono">
                  {exhibitor.exhibitor_name ? exhibitor.exhibitor_name.slice(0, 2).toUpperCase() : 'EX'}
                </div>
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-bold uppercase tracking-wider">
                  Exhibitor Master Profile
                </span>
                {exhibitor.stall_number && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Stall #{exhibitor.stall_number} ({exhibitor.stall_hall || 'Hall A'})
                  </span>
                )}
              </div>

              <h2 id="exhibitor-modal-title" className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {exhibitor.brand_name}
              </h2>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-1">
                <span className="font-semibold text-amber-300">
                  {exhibitor.exhibitor_name || 'Contact Name Not Registered'}
                </span>
                <span className="text-slate-500">•</span>
                <button
                  type="button"
                  onClick={handleCopyMobile}
                  className="inline-flex items-center gap-1 font-mono text-amber-400 hover:text-amber-300 transition-colors bg-white/10 px-2 py-0.5 rounded"
                  title="Click to copy mobile number"
                >
                  <Phone className="w-3 h-3" />
                  <span>{exhibitor.mobile}</span>
                  {copiedMobile ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
            title="Close details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 bg-slate-50">
          {/* Quick Stats Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Stall Space</span>
              <div className="text-lg font-black text-amber-700 font-mono mt-0.5">{exhibitor.stall_sqft}</div>
              <span className="text-[10px] text-slate-500">
                {exhibitor.stall_number ? `Allocated: ${exhibitor.stall_number}` : 'Not drawn yet'}
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Extra Amenities</span>
              <div className="text-lg font-black text-slate-900 font-mono mt-0.5">
                {exhibitor.items.reduce((s, i) => s + (i.quantity || 0), 0)} items
              </div>
              <span className="text-[10px] text-slate-500">{exhibitor.items.length} distinct products</span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-amber-300 shadow-2xs bg-gradient-to-br from-amber-50/50 to-white">
              <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block">Estimated Extras Bill</span>
              <div className="text-lg font-black text-amber-900 font-mono mt-0.5">₹{grandTotal.toLocaleString('en-IN')}</div>
              <span className="text-[10px] text-amber-700 font-medium">Incl. 18% GST</span>
            </div>
          </div>

          {/* Company Description */}
          {exhibitor.company_description && (
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-amber-600" />
                Company Overview & Profile
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed">{exhibitor.company_description}</p>
            </div>
          )}

          {/* Fascia / Main Header Names */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-600" />
              Main Stall Header (Fascia Names)
            </h3>
            {exhibitor.fascia_names && exhibitor.fascia_names.some((n) => n && n.trim()) ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {exhibitor.fascia_names.map((name, idx) =>
                  name && name.trim() ? (
                    <div key={idx} className="flex items-center gap-2 p-2.5 bg-amber-50/60 rounded-lg border border-amber-200">
                      <span className="px-2 py-0.5 bg-amber-200/80 text-amber-900 rounded font-mono font-bold text-[10px]">
                        Header {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-900">{name}</span>
                    </div>
                  ) : null
                )}
              </div>
            ) : (
              <div className="text-xs text-slate-500 italic p-2 bg-slate-50 rounded-lg border border-slate-100">
                Default header: <strong>{exhibitor.brand_name}</strong>
              </div>
            )}
          </div>

          {/* Requested Extra Amenities Table */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-amber-600" />
                Extra Amenities & Furniture Orders
              </h3>
              <span className="text-xs font-bold text-amber-700">
                {itemsWithRates.length} Items Ordered
              </span>
            </div>

            {itemsWithRates.length > 0 ? (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Item Description</th>
                      <th className="py-2.5 px-3 text-center">Quantity</th>
                      <th className="py-2.5 px-3 text-center">Rental Days</th>
                      <th className="py-2.5 px-3 text-right">Unit Rate</th>
                      <th className="py-2.5 px-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {itemsWithRates.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-slate-900 block">{item.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">Code: {item.code}</span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-900">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono text-slate-700">
                          {item.days} days
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                          ₹{item.rate.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-700">
                          ₹{item.total.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 border-t border-slate-200 font-bold text-xs">
                    <tr>
                      <td colSpan={4} className="py-2 px-3 text-right text-slate-600">
                        Subtotal:
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-slate-900">
                        ₹{subtotal.toLocaleString('en-IN')}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={4} className="py-1 px-3 text-right text-slate-600">
                        GST (18%):
                      </td>
                      <td className="py-1 px-3 text-right font-mono text-slate-900">
                        ₹{gst.toLocaleString('en-IN')}
                      </td>
                    </tr>
                    <tr className="bg-amber-50/70 border-t border-amber-200">
                      <td colSpan={4} className="py-2.5 px-3 text-right text-amber-900 font-extrabold">
                        Total Payable Amount:
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-black text-amber-900 text-sm">
                        ₹{grandTotal.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="py-6 text-center text-slate-400 italic text-xs bg-slate-50 rounded-lg border border-slate-100">
                No extra amenities or furniture ordered. Standard booth package applies.
              </div>
            )}
          </div>

          {/* Artwork & Drive Files */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5 text-amber-600" />
              Brand Artwork, Vector CDR & Cloud Drive Links
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {exhibitor.cdr_file_url && (
                <a
                  href={exhibitor.cdr_file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition-all shadow-2xs"
                >
                  <FileCode className="w-4 h-4 text-amber-700" />
                  <span>Download Vector Artwork (CDR)</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              )}

              {exhibitor.logo_file_url && (
                <a
                  href={exhibitor.logo_file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-300 text-xs font-bold transition-all shadow-2xs"
                >
                  <Sparkles className="w-4 h-4 text-blue-700" />
                  <span>View Brand Logo File</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              )}

              {(exhibitor.drive_folder_url || exhibitor.drive_file_url) && (
                <a
                  href={exhibitor.drive_folder_url || exhibitor.drive_file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold transition-all shadow-2xs"
                >
                  <FolderOpen className="w-4 h-4 text-emerald-700" />
                  <span>Open Google Drive Folder</span>
                  <ExternalLink className="w-3 h-3 text-emerald-600" />
                </a>
              )}

              {!exhibitor.cdr_file_url && !exhibitor.logo_file_url && !exhibitor.drive_folder_url && !exhibitor.drive_file_url && (
                <span className="text-xs text-slate-400 italic">No artwork or files uploaded yet</span>
              )}
            </div>
          </div>

          {/* Special Notes */}
          {exhibitor.special_notes && (
            <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200 shadow-2xs">
              <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-amber-700" />
                Special Instructions / Notes from Exhibitor
              </h3>
              <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">{exhibitor.special_notes}</p>
            </div>
          )}

          {/* Last Updated Timestamp */}
          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-200">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Last synchronized:{' '}
              {exhibitor.last_updated ? new Date(exhibitor.last_updated).toLocaleString('en-IN') : 'N/A'}
            </span>
            <span className="font-mono">Mobile ID: {exhibitor.mobile}</span>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="bg-white border-t border-slate-200 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all border border-slate-200"
          >
            Close Window
          </button>

          <div className="flex items-center gap-3">
            {onOpenBillModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenBillModal(exhibitor);
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold transition-all shadow-md shadow-amber-500/20"
              >
                <FileText className="w-4 h-4" />
                <span>Generate Official Tax Bill</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return mounted ? createPortal(modalContent, document.body) : null;
}
