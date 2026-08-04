'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Building2, Phone, Ruler, ShoppingBag, Download, RefreshCw, FileText, Search, PackageCheck, Layers, Award, Store } from 'lucide-react';

interface ExhibitorItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
}

interface ItemTotal {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}

interface ExhibitorRecord {
  mobile: string;
  brand_name: string;
  stall_sqft: string;
  items: ExhibitorItem[];
  special_notes: string;
  last_updated: string;
}

export default function AdminExhibitorsPage() {
  const [exhibitors, setExhibitors] = useState<ExhibitorRecord[]>([]);
  const [itemTotals, setItemTotals] = useState<ItemTotal[]>([]);
  const [totalSqftSum, setTotalSqftSum] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchExhibitors();
  }, []);

  const fetchExhibitors = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/exhibitors');
      const data = await res.json();
      if (data.exhibitors) {
        setExhibitors(data.exhibitors);
      }
      if (data.itemTotals) {
        setItemTotals(data.itemTotals);
      }
      if (data.totalSqftSum) {
        setTotalSqftSum(data.totalSqftSum);
      }
    } catch (err) {
      console.error('Failed to load admin exhibitors:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredExhibitors = exhibitors.filter((ex) => {
    const q = searchQuery.toLowerCase();
    return (
      ex.brand_name.toLowerCase().includes(q) ||
      ex.mobile.includes(q) ||
      ex.stall_sqft.toLowerCase().includes(q)
    );
  });

  const exportCSV = () => {
    const headers = ['Mobile Number', 'Brand Name', 'Stall Size (Sq Ft)', 'Extras Requested', 'Special Notes', 'Last Updated'];
    const rows = filteredExhibitors.map((ex) => {
      const extrasStr = ex.items.map((i) => `${i.name} x${i.quantity}`).join('; ');
      return [
        `"${ex.mobile}"`,
        `"${ex.brand_name.replace(/"/g, '""')}"`,
        `"${ex.stall_sqft.replace(/"/g, '""')}"`,
        `"${extrasStr.replace(/"/g, '""')}"`,
        `"${(ex.special_notes || '').replace(/"/g, '""')}"`,
        `"${ex.last_updated || ''}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `STE_Admin_Master_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans p-4 sm:p-6 lg:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                👑 Organizer Master Admin Console
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-serif mt-1">
              Exhibitors & Total Quantities Overview
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              Real-time aggregate product demand summary and exhibitor requirements report
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/exhibitor/dashboard"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent hover:bg-amber-500/20 border border-amber-500/40 text-xs font-bold text-amber-300 transition-all shadow-sm"
            >
              <Store className="w-4 h-4 text-amber-400" />
              <span>Exhibitor Portal</span>
            </Link>

            <button
              onClick={fetchExhibitors}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-semibold text-neutral-300 transition-all shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Live Data</span>
            </button>

            <button
              onClick={exportCSV}
              disabled={filteredExhibitors.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition-all shadow-lg shadow-amber-500/10 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* KPI Top Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-neutral-900/80 border border-neutral-800 p-5 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-neutral-400 font-medium block">Total Exhibitor Profiles</span>
              <span className="text-2xl font-black text-white font-mono">{exhibitors.length}</span>
            </div>
          </div>

          <div className="bg-neutral-900/80 border border-neutral-800 p-5 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-neutral-400 font-medium block">Total Stall Space Booked</span>
              <span className="text-2xl font-black text-amber-400 font-mono">{totalSqftSum.toLocaleString()} sq ft</span>
            </div>
          </div>

          <div className="bg-neutral-900/80 border border-neutral-800 p-5 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
              <PackageCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-neutral-400 font-medium block">Total Extra Amenities Ordered</span>
              <span className="text-2xl font-black text-white font-mono">
                {itemTotals.reduce((sum, item) => sum + item.quantity, 0)} items
              </span>
            </div>
          </div>
        </div>

        {/* Item-wise Total Quantities Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 font-serif">
              <Award className="w-5 h-5 text-amber-400" />
              Total Quantities Ordered (Item-wise Summary)
            </h2>
            <span className="text-xs text-neutral-400">Aggregated across all exhibitors</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {itemTotals.map((item) => (
              <div
                key={item.id}
                className="bg-neutral-900/60 border border-neutral-800/80 p-4 rounded-xl flex flex-col justify-between hover:border-amber-500/40 transition-colors"
              >
                <span className="text-xs font-semibold text-neutral-300 line-clamp-2 mb-2">
                  {item.name}
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-amber-400 font-mono">
                    {item.quantity}
                  </span>
                  <span className="text-[10px] font-mono uppercase text-neutral-500">
                    {item.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Search & Submissions Table */}
        <div className="space-y-4 pt-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-neutral-900/60 p-4 rounded-xl border border-neutral-800">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search brand, mobile, stall size..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="text-xs text-neutral-400 font-medium self-end sm:self-center">
              Showing Exhibitor Entries: <strong className="text-white font-mono">{filteredExhibitors.length}</strong>
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center text-xs text-neutral-400">Loading exhibitor submissions...</div>
          ) : filteredExhibitors.length === 0 ? (
            <div className="py-16 text-center bg-neutral-900/40 rounded-2xl border border-neutral-800 text-neutral-500 text-sm">
              No exhibitor submissions found.
            </div>
          ) : (
            <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-neutral-300">
                  <thead className="bg-neutral-950 border-b border-neutral-800 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                    <tr>
                      <th className="py-3.5 px-4">Mobile (ID)</th>
                      <th className="py-3.5 px-4">Brand Name</th>
                      <th className="py-3.5 px-4">Stall Size</th>
                      <th className="py-3.5 px-4">Requested Extras</th>
                      <th className="py-3.5 px-4">Special Notes</th>
                      <th className="py-3.5 px-4">Last Updated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60">
                    {filteredExhibitors.map((ex, idx) => (
                      <tr key={idx} className="hover:bg-neutral-800/30 transition-colors">
                        <td className="py-4 px-4 font-mono font-bold text-amber-400 whitespace-nowrap">
                          {ex.mobile}
                        </td>
                        <td className="py-4 px-4 font-semibold text-white whitespace-nowrap">
                          {ex.brand_name}
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-md bg-neutral-950 border border-neutral-800 font-mono text-amber-300 text-[11px]">
                            {ex.stall_sqft}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          {ex.items && ex.items.length > 0 ? (
                            <div className="space-y-1">
                              {ex.items.map((item, i) => (
                                <div key={i} className="flex items-center gap-1.5 text-[11px]">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                  <span className="font-medium text-white">{item.name}</span>
                                  <span className="text-neutral-500 font-mono">({item.quantity} {item.unit})</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-neutral-500 italic">None selected</span>
                          )}
                        </td>
                        <td className="py-4 px-4 max-w-xs text-neutral-400 truncate">
                          {ex.special_notes || '—'}
                        </td>
                        <td className="py-4 px-4 text-neutral-500 whitespace-nowrap text-[11px]">
                          {ex.last_updated ? new Date(ex.last_updated).toLocaleString() : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
