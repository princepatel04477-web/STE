'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Building2, Phone, Ruler, ShoppingBag, Download, RefreshCw, FileText, Search, PackageCheck, Layers, Award, Store, LogOut, Printer } from 'lucide-react';
import BillModal from '@/components/extras/BillModal';
import { EXTRAS_RATES } from '@/data/extras-rates';

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
  fascia_names?: string[];
  items: ExhibitorItem[];
  special_notes: string;
  owner_badges?: number;
  sales_badges?: number;
  support_badges?: number;
  badge_names?: {
    owner?: string[];
    sales?: string[];
    support?: string[];
  };
  last_updated: string;
}

export default function AdminExhibitorsPage() {
  const router = useRouter();
  const [exhibitors, setExhibitors] = useState<ExhibitorRecord[]>([]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/exhibitor/login');
  };
  const [itemTotals, setItemTotals] = useState<ItemTotal[]>([]);
  const [totalSqftSum, setTotalSqftSum] = useState<number>(0);
  const [totalOwnerBadges, setTotalOwnerBadges] = useState<number>(0);
  const [totalSalesBadges, setTotalSalesBadges] = useState<number>(0);
  const [totalSupportBadges, setTotalSupportBadges] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExhibitorForBill, setSelectedExhibitorForBill] = useState<ExhibitorRecord | null>(null);

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
      setTotalOwnerBadges(data.totalOwnerBadges || 0);
      setTotalSalesBadges(data.totalSalesBadges || 0);
      setTotalSupportBadges(data.totalSupportBadges || 0);
    } catch (err) {
      console.error('Failed to load admin exhibitors:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredExhibitors = exhibitors.filter((ex) => {
    const q = searchQuery.toLowerCase();
    const ownerNames = (ex.badge_names?.owner || []).join(' ').toLowerCase();
    const salesNames = (ex.badge_names?.sales || []).join(' ').toLowerCase();
    const supportNames = (ex.badge_names?.support || []).join(' ').toLowerCase();
    const fasciaStr = (ex.fascia_names || []).join(' ').toLowerCase();
    return (
      ex.brand_name.toLowerCase().includes(q) ||
      ex.mobile.includes(q) ||
      ex.stall_sqft.toLowerCase().includes(q) ||
      fasciaStr.includes(q) ||
      ownerNames.includes(q) ||
      salesNames.includes(q) ||
      supportNames.includes(q)
    );
  });

  const exportCSV = () => {
    const headers = [
      'Mobile Number',
      'Brand Name',
      'Stall Size (Sq Ft)',
      'Fascia Main Header (Option 1)',
      'Fascia Main Header (Option 2)',
      'Fascia Main Header (Option 3)',
      'Fascia Main Header (Option 4)',
      'Owner Badges Count',
      'Owner Badge Names',
      'Sales Badges Count',
      'Sales Badge Names',
      'Support Badges Count',
      'Support Badge Names',
      'Extras Requested',
      'Special Notes',
      'Last Updated'
    ];
    const rows = filteredExhibitors.map((ex) => {
      const extrasStr = ex.items.map((i) => `${i.name} x${i.quantity}`).join('; ');
      const ownerNamesStr = (ex.badge_names?.owner || []).filter(Boolean).join(', ');
      const salesNamesStr = (ex.badge_names?.sales || []).filter(Boolean).join(', ');
      const supportNamesStr = (ex.badge_names?.support || []).filter(Boolean).join(', ');
      const f1 = ex.fascia_names?.[0] || ex.brand_name || '';
      const f2 = ex.fascia_names?.[1] || '';
      const f3 = ex.fascia_names?.[2] || '';
      const f4 = ex.fascia_names?.[3] || '';

      return [
        `"${ex.mobile}"`,
        `"${ex.brand_name.replace(/"/g, '""')}"`,
        `"${ex.stall_sqft.replace(/"/g, '""')}"`,
        `"${f1.replace(/"/g, '""')}"`,
        `"${f2.replace(/"/g, '""')}"`,
        `"${f3.replace(/"/g, '""')}"`,
        `"${f4.replace(/"/g, '""')}"`,
        `"${ex.owner_badges || 0}"`,
        `"${ownerNamesStr.replace(/"/g, '""')}"`,
        `"${ex.sales_badges || 0}"`,
        `"${salesNamesStr.replace(/"/g, '""')}"`,
        `"${ex.support_badges || 0}"`,
        `"${supportNamesStr.replace(/"/g, '""')}"`,
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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/95 md:backdrop-blur-sm border-b border-slate-200 shadow-sm px-4 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-md shadow-amber-500/20 text-slate-950 font-bold">
              STE
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                Organizer Admin Console
                <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  STE 2026
                </span>
              </h1>
              <p className="text-xs text-slate-500 font-medium">Exhibitor Management & Extra Amenities Reports</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/exhibitor/dashboard"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-xs font-bold transition-all"
            >
              <Store className="w-4 h-4 text-amber-800" />
              <span>Exhibitor Portal</span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all border border-slate-200"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 pt-8 space-y-8">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold uppercase tracking-wider">
                Live Organizers Control
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-serif mt-1">
              Exhibitors & Total Quantities Overview
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
              Real-time aggregate product demand summary and exhibitor requirements report
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={fetchExhibitors}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs font-bold text-slate-800 transition-all shadow-xs"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Live Data</span>
            </button>

            <button
              onClick={exportCSV}
              disabled={filteredExhibitors.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold transition-all shadow-md shadow-amber-500/20 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* KPI Top Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-semibold block">Total Exhibitor Profiles</span>
              <span className="text-2xl font-black text-slate-900 font-mono">{exhibitors.length}</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-semibold block">Total Stall Space Booked</span>
              <span className="text-2xl font-black text-amber-700 font-mono">{totalSqftSum.toLocaleString()} sq ft</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700">
              <PackageCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-semibold block">Total Extra Amenities Ordered</span>
              <span className="text-2xl font-black text-slate-900 font-mono">
                {itemTotals.reduce((sum, item) => sum + item.quantity, 0)} items
              </span>
            </div>
          </div>

          <div className="bg-white border border-amber-300 p-5 rounded-2xl flex items-center gap-4 shadow-sm bg-gradient-to-br from-amber-50/50 to-white">
            <div className="p-3 bg-amber-100 border border-amber-300 rounded-xl text-amber-800">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-amber-900 font-bold block">Total Entry Badges Requested</span>
              <span className="text-2xl font-black text-slate-900 font-mono">
                {totalOwnerBadges + totalSalesBadges + totalSupportBadges} badges
              </span>
            </div>
          </div>
        </div>

        {/* Item-wise Total Quantities & Badges Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 font-serif">
              <Award className="w-5 h-5 text-amber-700" />
              Total Quantities & Badges Summary
            </h2>
            <span className="text-xs text-slate-500 font-medium">Aggregated across all exhibitors</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {/* Badges Summary Cards */}
            <div className="bg-white border border-amber-300 p-4 rounded-xl flex flex-col justify-between shadow-xs">
              <span className="text-xs font-extrabold text-amber-800 flex items-center gap-1.5 mb-2">
                👑 Owner Badges
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-slate-900 font-mono">{totalOwnerBadges}</span>
                <span className="text-xs font-mono uppercase font-bold text-amber-700">passes</span>
              </div>
            </div>

            <div className="bg-white border border-amber-300 p-4 rounded-xl flex flex-col justify-between shadow-xs">
              <span className="text-xs font-extrabold text-amber-800 flex items-center gap-1.5 mb-2">
                👥 Sales Staff Badges
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-slate-900 font-mono">{totalSalesBadges}</span>
                <span className="text-xs font-mono uppercase font-bold text-amber-700">passes</span>
              </div>
            </div>

            <div className="bg-white border border-amber-300 p-4 rounded-xl flex flex-col justify-between shadow-xs">
              <span className="text-xs font-extrabold text-amber-800 flex items-center gap-1.5 mb-2">
                🛠️ Support Staff Badges
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-slate-900 font-mono">{totalSupportBadges}</span>
                <span className="text-xs font-mono uppercase font-bold text-amber-700">passes</span>
              </div>
            </div>

            {itemTotals.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col justify-between hover:border-amber-400 transition-colors shadow-xs"
              >
                <span className="text-xs font-bold text-slate-800 line-clamp-2 mb-2">
                  {item.name}
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-amber-700 font-mono">
                    {item.quantity}
                  </span>
                  <span className="text-xs font-mono uppercase text-slate-500">
                    {item.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Search & Submissions Table */}
        <div className="space-y-4 pt-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search brand, mobile, stall size..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
              />
            </div>

            <div className="text-xs text-slate-600 font-medium self-end sm:self-center">
              Showing Exhibitor Entries: <strong className="text-slate-900 font-mono">{filteredExhibitors.length}</strong>
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center text-xs text-slate-500 font-medium">Loading exhibitor submissions...</div>
          ) : filteredExhibitors.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
              No exhibitor submissions found.
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-800">
                  <thead className="bg-slate-100 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-700">
                    <tr>
                      <th className="py-3.5 px-4">Mobile (ID)</th>
                      <th className="py-3.5 px-4">Brand Name</th>
                      <th className="py-3.5 px-4">Stall Size</th>
                      <th className="py-3.5 px-4">Entry Badges</th>
                      <th className="py-3.5 px-4">Requested Extras</th>
                      <th className="py-3.5 px-4">Special Notes</th>
                      <th className="py-3.5 px-4">Last Updated</th>
                      <th className="py-3.5 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredExhibitors.map((ex, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-4 font-mono font-bold text-amber-700 whitespace-nowrap">
                          {ex.mobile}
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="font-bold text-slate-900">{ex.brand_name}</div>
                          {ex.fascia_names && ex.fascia_names.some((n) => n && n.trim()) && (
                            <div className="mt-1 flex flex-col gap-0.5 max-w-[220px]">
                              {ex.fascia_names.map((n, i) => n && n.trim() ? (
                                <span key={i} className="text-[10px] text-amber-900 bg-amber-50/80 px-1.5 py-0.5 rounded border border-amber-200/60 truncate" title={`Main Header Option ${i + 1}: ${n}`}>
                                  🏷️ Main Header {i + 1}: <strong className="font-semibold">{n}</strong>
                                </span>
                              ) : null)}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-md bg-amber-50 border border-amber-300 font-mono text-amber-900 font-bold text-xs">
                            {ex.stall_sqft}
                          </span>
                        </td>
                        <td className="py-4 px-4 min-w-[200px]">
                          <div className="flex flex-col gap-1.5 text-[11px]">
                            <div>
                              <span className="text-amber-800 font-bold">👑 Owner: <strong className="text-slate-900 font-mono">{ex.owner_badges || 0}</strong></span>
                              {ex.badge_names?.owner && ex.badge_names.owner.filter(Boolean).length > 0 && (
                                <p className="text-[10px] text-slate-600 font-medium truncate max-w-[200px]">
                                  {ex.badge_names.owner.filter(Boolean).join(', ')}
                                </p>
                              )}
                            </div>
                            <div>
                              <span className="text-slate-700 font-semibold">👥 Sales: <strong className="text-slate-900 font-mono">{ex.sales_badges || 0}</strong></span>
                              {ex.badge_names?.sales && ex.badge_names.sales.filter(Boolean).length > 0 && (
                                <p className="text-[10px] text-slate-600 font-medium truncate max-w-[200px]">
                                  {ex.badge_names.sales.filter(Boolean).join(', ')}
                                </p>
                              )}
                            </div>
                            <div>
                              <span className="text-slate-600 font-medium">🛠️ Support: <strong className="text-slate-900 font-mono">{ex.support_badges || 0}</strong></span>
                              {ex.badge_names?.support && ex.badge_names.support.filter(Boolean).length > 0 && (
                                <p className="text-[10px] text-slate-600 font-medium truncate max-w-[200px]">
                                  {ex.badge_names.support.filter(Boolean).join(', ')}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {ex.items && ex.items.length > 0 ? (
                            <div className="space-y-1">
                              {ex.items.map((item, i) => (
                                <div key={i} className="flex items-center gap-1.5 text-xs">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                  <span className="font-bold text-slate-900">{item.name}</span>
                                  <span className="text-slate-500 font-mono">({item.quantity} {item.unit})</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">None selected</span>
                          )}
                        </td>
                        <td className="py-4 px-4 max-w-xs text-slate-600 truncate">
                          {ex.special_notes || '—'}
                        </td>
                        <td className="py-4 px-4 text-slate-500 whitespace-nowrap text-xs">
                          {ex.last_updated ? new Date(ex.last_updated).toLocaleString() : '—'}
                        </td>
                        <td className="py-4 px-4 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setSelectedExhibitorForBill(ex)}
                            className="px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-bold text-[11px] transition-all flex items-center gap-1 mx-auto shadow-xs"
                            title="Generate Official Tax Invoice / Bill"
                          >
                            <FileText className="w-3.5 h-3.5 text-amber-800" />
                            <span>Tax Bill</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

      </main>

      {/* Bill Modal for Selected Exhibitor */}
      {selectedExhibitorForBill && (
        <BillModal
          isOpen={true}
          onClose={() => setSelectedExhibitorForBill(null)}
          brandName={selectedExhibitorForBill.brand_name || 'Registered Exhibitor'}
          mobile={selectedExhibitorForBill.mobile}
          stallSqft={selectedExhibitorForBill.stall_sqft || '200 sq ft'}
          fasciaNames={selectedExhibitorForBill.fascia_names}
          days={2}
          items={selectedExhibitorForBill.items.map((it) => {
            const master = EXTRAS_RATES.find((m) => m.id === it.id || m.name.toLowerCase() === it.name.toLowerCase());
            return {
              id: it.id,
              code: master?.code || 'DP',
              name: it.name,
              spec: master?.spec || null,
              rateInr: master?.rateInr || 600,
              quantity: it.quantity,
            };
          })}
        />
      )}
    </div>
  );
}
