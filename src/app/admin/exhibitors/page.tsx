'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { downloadXlsx, type CellValue } from '@/lib/exportXlsx';
import {
  Building2,
  Contact,
  Phone,
  Ruler,
  ShoppingBag,
  Download,
  RefreshCw,
  FileText,
  Search,
  PackageCheck,
  Layers,
  Award,
  Store,
  LogOut,
  Printer,
  FolderOpen,
  ExternalLink,
  FileCode,
  Trophy,
  Eye,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  CheckCircle2,
  X,
  Sparkles,
  Info,
  Crown,
  Users,
  Wrench,
  Check
} from 'lucide-react';
import BillModal from '@/components/extras/BillModal';
import ExhibitorDetailModal, { ExhibitorDetailData } from '@/components/admin/ExhibitorDetailModal';
import { EXTRAS_RATES } from '@/data/extras-rates';

interface ExhibitorItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  days?: number;
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
  items: ExhibitorItem[];
  special_notes: string;
  logo_file_url?: string;
  cdr_file_url?: string;
  drive_file_url?: string;
  drive_folder_url?: string;
  rental_days?: number;
  /** The exhibitor's own GSTIN, as given on their extras bill. */
  gstin?: string;
  /** Extras ordered with no usable GSTIN against them — somebody to chase. */
  gstin_missing?: boolean;
  /** They have put something of their own into the portal. */
  portal_filled?: boolean;
  /** One of the two organiser logins, not an exhibitor. */
  is_organiser?: boolean;
  last_updated: string;
}

/** A number with saved data that is on neither the master sheet nor an alias. */
interface UnknownProfile {
  mobile: string;
  brand_name: string;
  exhibitor_name: string;
  stall_number: string;
  stall_sqft: string;
  last_updated: string;
}

type FilterTab =
  | 'all'
  | 'portal-filled'
  | 'portal-pending'
  | 'with-extras'
  | 'no-extras'
  | 'gstin-missing'
  | 'with-artwork'
  | 'stall-drawn';
type DensityMode = 'comfortable' | 'compact';

export default function AdminExhibitorsPage() {
  const router = useRouter();
  const [exhibitors, setExhibitors] = useState<ExhibitorRecord[]>([]);
  const [unknownProfiles, setUnknownProfiles] = useState<UnknownProfile[]>([]);
  const [sheetExhibitorCount, setSheetExhibitorCount] = useState(0);
  const [portalFilledCount, setPortalFilledCount] = useState(0);
  const [portalPendingCount, setPortalPendingCount] = useState(0);
  const [organiserCount, setOrganiserCount] = useState(0);
  const [itemTotals, setItemTotals] = useState<ItemTotal[]>([]);
  const [totalSqftSum, setTotalSqftSum] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [selectedSizeFilter, setSelectedSizeFilter] = useState('all');

  // UI preferences
  const [density, setDensity] = useState<DensityMode>('comfortable');
  const [showSummaryCards, setShowSummaryCards] = useState(true);
  const [isFullWidth, setIsFullWidth] = useState(false);

  // Modals state
  const [selectedExhibitorForBill, setSelectedExhibitorForBill] = useState<ExhibitorRecord | null>(null);
  const [selectedExhibitorForDetail, setSelectedExhibitorForDetail] = useState<ExhibitorRecord | null>(null);

  // Table horizontal scrolling ref
  const tableContainerRef = useRef<HTMLDivElement | null>(null);
  const topScrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [scrollWidth, setScrollWidth] = useState(1400);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/exhibitor/login');
  };

  useEffect(() => {
    fetchExhibitors();
  }, []);

  const fetchExhibitors = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/exhibitors');
      if (res.status === 401 || res.status === 403) {
        router.push('/exhibitor/dashboard');
        return;
      }
      const data = await res.json();
      if (data.exhibitors) {
        setExhibitors(data.exhibitors);
      }
      setUnknownProfiles(data.unknownProfiles || []);
      setSheetExhibitorCount(data.sheetExhibitorCount || 0);
      setPortalFilledCount(data.portalFilledCount || 0);
      setPortalPendingCount(data.portalPendingCount || 0);
      setOrganiserCount(data.organiserCount || 0);
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

  // Check scroll positions
  const checkScrollState = () => {
    const el = tableContainerRef.current;
    if (el) {
      setCanScrollLeft(el.scrollLeft > 10);
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
      setScrollWidth(el.scrollWidth);
    }
  };

  useEffect(() => {
    const el = tableContainerRef.current;
    if (el) {
      checkScrollState();
      el.addEventListener('scroll', checkScrollState);
      window.addEventListener('resize', checkScrollState);
      return () => {
        el.removeEventListener('scroll', checkScrollState);
        window.removeEventListener('resize', checkScrollState);
      };
    }
  }, [exhibitors, loading, density]);

  const handleScrollLeft = () => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  // Sync top scrollbar with table container
  const handleTopScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  const handleTableScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (topScrollContainerRef.current) {
      topScrollContainerRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
    checkScrollState();
  };

  // Filtered exhibitors calculation
  const filteredExhibitors = useMemo(() => {
    return exhibitors.filter((ex) => {
      const q = searchQuery.toLowerCase().trim();
      const exName = (ex.exhibitor_name || '').toLowerCase();
      const desc = (ex.company_description || '').toLowerCase();
      const stallNo = (ex.stall_number || '').toLowerCase();
      const stallHall = (ex.stall_hall || '').toLowerCase();
      const fasciaStr = (ex.fascia_names || []).join(' ').toLowerCase();
      const notes = (ex.special_notes || '').toLowerCase();

      const matchesSearch =
        !q ||
        ex.brand_name.toLowerCase().includes(q) ||
        exName.includes(q) ||
        desc.includes(q) ||
        ex.mobile.includes(q) ||
        ex.stall_sqft.toLowerCase().includes(q) ||
        stallNo.includes(q) ||
        stallHall.includes(q) ||
        fasciaStr.includes(q) ||
        notes.includes(q);

      if (!matchesSearch) return false;

      // Tab filters
      // Both portal tabs are about exhibitors, so the organiser logins sit out.
      if (activeTab === 'portal-filled' && (!ex.portal_filled || ex.is_organiser)) return false;
      if (activeTab === 'portal-pending' && (ex.portal_filled || ex.is_organiser)) return false;
      if (activeTab === 'with-extras' && (!ex.items || ex.items.length === 0)) return false;
      if (activeTab === 'no-extras' && ex.items && ex.items.length > 0) return false;
      if (activeTab === 'gstin-missing' && !ex.gstin_missing) return false;
      if (
        activeTab === 'with-artwork' &&
        !ex.cdr_file_url &&
        !ex.logo_file_url &&
        !ex.drive_folder_url &&
        !ex.drive_file_url
      )
        return false;
      if (activeTab === 'stall-drawn' && !ex.stall_number) return false;

      // Size dropdown filter
      if (selectedSizeFilter !== 'all') {
        const sqftNum = parseInt(ex.stall_sqft.replace(/\D/g, ''), 10);
        if (selectedSizeFilter === '1000+' && sqftNum < 1000) return false;
        if (selectedSizeFilter !== '1000+' && ex.stall_sqft !== selectedSizeFilter) return false;
      }

      return true;
    });
  }, [exhibitors, searchQuery, activeTab, selectedSizeFilter]);

  // Counts for tabs
  const tabCounts = useMemo(() => {
    const withExtras = exhibitors.filter((e) => e.items && e.items.length > 0).length;
    const withArtwork = exhibitors.filter(
      (e) => e.cdr_file_url || e.logo_file_url || e.drive_folder_url || e.drive_file_url
    ).length;
    const stallDrawn = exhibitors.filter((e) => !!e.stall_number).length;
    const onlyExhibitors = exhibitors.filter((e) => !e.is_organiser);
    const portalFilled = onlyExhibitors.filter((e) => e.portal_filled).length;
    const gstinMissing = exhibitors.filter((e) => e.gstin_missing).length;
    return {
      all: exhibitors.length,
      portalFilled,
      portalPending: onlyExhibitors.length - portalFilled,
      withExtras,
      gstinMissing,
      noExtras: exhibitors.length - withExtras,
      withArtwork,
      stallDrawn
    };
  }, [exhibitors]);

  // The master report goes out as a real workbook, not a CSV: Excel treats a
  // CSV's first line as a header band it can quietly absorb, which left the
  // organiser looking at a sheet that opened straight onto exhibitor data with
  // no column labels anywhere.
  const exportExcel = () => {
    const headers = [
      'Time Stamp',
      'Brand Name',
      'Exhibitor Name',
      'Mobile (ID)',
      'Stall Size',
      'Stall Number',
      'Stall Hall',
      'Fascia Names',
      'GST Number',
      'Extras Requirements',
      'Drive Folder URL',
      'Special Notes',
      'Portal Filled'
    ];

    const rows = filteredExhibitors.map((ex) => {
      const timeStamp = ex.last_updated
        ? new Date(ex.last_updated).toLocaleString('en-IN')
        : '';
      const fasciaStr = (ex.fascia_names || [])
        .map((f) => (f || '').trim())
        .filter(Boolean)
        .join(' | ');
      const extrasStr = ex.items
        .map((i) => `${i.name} x${i.quantity} (${i.days || 2}d)`)
        .join('; ');
      // Mobile stays text so a long number never loses its shape.
      return [
        timeStamp,
        ex.brand_name,
        ex.exhibitor_name || '',
        ex.mobile,
        ex.stall_sqft,
        ex.stall_number || 'Not Drawn',
        ex.stall_hall || '',
        fasciaStr,
        ex.gstin || (ex.gstin_missing ? 'MISSING' : ''),
        extrasStr,
        ex.drive_folder_url || ex.drive_file_url || '',
        ex.special_notes || '',
        ex.portal_filled ? 'YES' : 'NO'
      ] as CellValue[];
    });

    downloadXlsx(
      `STE_2026_Admin_Master_Report_${new Date().toISOString().slice(0, 10)}.xlsx`,
      { sheetName: 'Exhibitor Master', headers, rows }
    );
  };

  const containerWidthClass = isFullWidth ? 'w-full px-3 sm:px-6' : 'max-w-[1920px] mx-auto px-3 sm:px-6 lg:px-8';

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans pb-24 selection:bg-amber-400 selection:text-slate-900">
      {/* Top Sticky Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs px-4 py-3">
        <div className={`${containerWidthClass} flex flex-wrap items-center justify-between gap-3`}>
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 relative rounded-xl bg-slate-900 p-1 border border-slate-200 shadow-xs flex items-center justify-center shrink-0 group-hover:border-amber-400 transition-colors">
              <Image
                src="/assets/logo_STE.webp"
                alt="Surat Textile Expo 2026 Logo"
                fill
                sizes="40px"
                className="object-contain p-0.5"
                priority
              />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                Organizer Master Console
                <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  STE 2026
                </span>
              </h1>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Exhibitor Management, Extra Amenities & Tax Invoices
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Full Width Toggle */}
            <button
              onClick={() => setIsFullWidth(!isFullWidth)}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold transition-all"
              title={isFullWidth ? 'Standard layout' : 'Full width layout'}
            >
              {isFullWidth ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span>{isFullWidth ? 'Standard View' : 'Full Screen Width'}</span>
            </button>

            <Link
              href="/admin/lottery"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-700 text-xs font-bold transition-all shadow-xs"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Lucky Draw Panel</span>
            </Link>

            <Link
              href="/exhibitor/dashboard"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-xs font-bold transition-all"
            >
              <Store className="w-3.5 h-3.5 text-amber-800" />
              <span className="hidden sm:inline">Exhibitor Portal</span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all border border-slate-200"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className={`${containerWidthClass} pt-6 space-y-6`}>
        {/* Page Banner & Primary Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold uppercase tracking-wider">
                Live Exhibitors & Amenities Database
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-bold text-slate-600">
                Total: <strong className="text-slate-900 font-mono">{exhibitors.length}</strong> Registered Exhibitors
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-serif mt-1">
              Exhibitors Management & Requirements Overview
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
              Real-time directory of exhibitor profiles, allocated stall numbers, amenities, and artwork files.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowSummaryCards(!showSummaryCards)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs font-bold text-slate-700 transition-all shadow-2xs"
              title={showSummaryCards ? 'Hide summary analytics cards' : 'Show summary analytics cards'}
            >
              {showSummaryCards ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              <span>{showSummaryCards ? 'Hide Analytics' : 'Show Analytics'}</span>
            </button>

            <button
              onClick={fetchExhibitors}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs font-bold text-slate-800 transition-all shadow-2xs"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Data</span>
            </button>

            <button
              onClick={exportExcel}
              disabled={filteredExhibitors.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold transition-all shadow-md shadow-amber-500/20 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>Export Excel ({filteredExhibitors.length})</span>
            </button>
          </div>
        </div>

        {/* Collapsible KPI & Product Demand Cards */}
        {showSummaryCards && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Top 4 KPI Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="bg-white border border-slate-200 p-4 sm:p-5 rounded-2xl flex items-center gap-4 shadow-xs">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 shrink-0">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-semibold block">Exhibitors on the Master Sheet</span>
                  <span className="text-2xl font-black text-slate-900 font-mono">{sheetExhibitorCount}</span>
                  <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                    +{organiserCount} organiser logins
                    {unknownProfiles.length > 0
                      ? ` · ${unknownProfiles.length} unrecognised below`
                      : ' · no unrecognised numbers'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab(activeTab === 'portal-filled' ? 'all' : 'portal-filled')}
                className={`bg-white border p-4 sm:p-5 rounded-2xl flex items-center gap-4 shadow-xs text-left transition-colors ${
                  activeTab === 'portal-filled'
                    ? 'border-emerald-500 ring-1 ring-emerald-200'
                    : 'border-slate-200 hover:border-emerald-300'
                }`}
              >
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 shrink-0">
                  <Contact className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-semibold block">Portal Filled</span>
                  <span className="text-2xl font-black text-slate-900 font-mono">
                    {portalFilledCount}
                    <span className="text-base text-slate-400"> / {sheetExhibitorCount}</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                    {portalPendingCount} still to fill in
                    {sheetExhibitorCount > 0
                      ? ` · ${Math.round((portalFilledCount / sheetExhibitorCount) * 100)}% done`
                      : ''}
                  </span>
                </div>
              </button>

              <div className="bg-white border border-slate-200 p-4 sm:p-5 rounded-2xl flex items-center gap-4 shadow-xs">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 shrink-0">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-semibold block">Total Stall Space Booked</span>
                  <span className="text-2xl font-black text-amber-700 font-mono">{totalSqftSum.toLocaleString()} sq ft</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-4 sm:p-5 rounded-2xl flex items-center gap-4 shadow-xs">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 shrink-0">
                  <PackageCheck className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-semibold block">Extra Amenities Ordered</span>
                  <span className="text-2xl font-black text-slate-900 font-mono">
                    {itemTotals.reduce((sum, item) => sum + item.quantity, 0)} items
                  </span>
                </div>
              </div>
            </div>

            {/* Item Breakdown Grid */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-600" />
                  Total Amenity Demand Aggregates
                </h3>
                <span className="text-[11px] text-slate-500">Live tally across all booths</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
                {/* Items */}
                {itemTotals.map((item) => (
                  <div
                    key={item.id}
                    className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex flex-col justify-between hover:border-amber-300 transition-colors"
                  >
                    <span className="text-[11px] font-semibold text-slate-700 line-clamp-1" title={item.name}>
                      {item.name}
                    </span>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-xl font-black text-amber-700 font-mono">{item.quantity}</span>
                      <span className="text-[10px] font-mono uppercase text-slate-500">{item.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Search, Filter Tabs, Density & Scroll Controls */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          {/* Top Row: Search input + Size dropdown + Density toggle */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[280px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search brand, exhibitor name, mobile, stall number (A-101), fascia header, notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-all shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Controls Right */}
            <div className="flex flex-wrap items-center gap-2.5 self-end lg:self-center">
              {/* Size Filter Dropdown */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs">
                <span className="text-slate-500 font-medium">Stall Size:</span>
                <select
                  value={selectedSizeFilter}
                  onChange={(e) => setSelectedSizeFilter(e.target.value)}
                  className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Sizes</option>
                  <option value="100 sq ft">100 sq ft</option>
                  <option value="200 sq ft">200 sq ft</option>
                  <option value="300 sq ft">300 sq ft</option>
                  <option value="400 sq ft">400 sq ft</option>
                  <option value="600 sq ft">600 sq ft</option>
                  <option value="800 sq ft">800 sq ft</option>
                  <option value="1000+">1000+ sq ft</option>
                </select>
              </div>

              {/* Density Toggle */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                <button
                  onClick={() => setDensity('comfortable')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    density === 'comfortable'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Comfortable
                </button>
                <button
                  onClick={() => setDensity('compact')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    density === 'compact'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Compact
                </button>
              </div>

              {/* Table Horizontal Scroll Navigation Buttons */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={handleScrollLeft}
                  disabled={!canScrollLeft}
                  className="p-1.5 rounded-lg text-slate-700 hover:bg-white hover:shadow-xs disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                  title="Scroll table left"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-[10px] font-bold text-slate-500 px-1 uppercase tracking-wider">Pan Columns</span>
                <button
                  type="button"
                  onClick={handleScrollRight}
                  disabled={!canScrollRight}
                  className="p-1.5 rounded-lg text-slate-700 hover:bg-white hover:shadow-xs disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                  title="Scroll table right"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Row: Filter Tabs & Active Counter */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'all'
                    ? 'bg-slate-900 text-amber-300 shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                All Exhibitors ({tabCounts.all})
              </button>

              <button
                onClick={() => setActiveTab('portal-filled')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'portal-filled'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Portal Filled ({tabCounts.portalFilled})
              </button>

              <button
                onClick={() => setActiveTab('portal-pending')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'portal-pending'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Not Filled ({tabCounts.portalPending})
              </button>

              <button
                onClick={() => setActiveTab('with-extras')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'with-extras'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Extras Ordered ({tabCounts.withExtras})
              </button>

              <button
                onClick={() => setActiveTab('gstin-missing')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'gstin-missing'
                    ? 'bg-red-600 text-white shadow-xs'
                    : tabCounts.gstinMissing > 0
                    ? 'bg-red-100 hover:bg-red-200 text-red-800 border border-red-300'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
                title="Ordered extras but has given no valid GST number"
              >
                GST Missing ({tabCounts.gstinMissing})
              </button>

              <button
                onClick={() => setActiveTab('no-extras')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'no-extras'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                No Extras ({tabCounts.noExtras})
              </button>

              <button
                onClick={() => setActiveTab('with-artwork')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'with-artwork'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Artwork Uploaded ({tabCounts.withArtwork})
              </button>

              <button
                onClick={() => setActiveTab('stall-drawn')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'stall-drawn'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Stall Drawn ({tabCounts.stallDrawn})
              </button>
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Showing: <strong className="text-slate-900 font-mono font-black">{filteredExhibitors.length}</strong> of{' '}
              {exhibitors.length} entries
            </div>
          </div>
        </div>

        {/* Master Exhibitors Data Table */}
        <div className="space-y-2">
          {/* Top Horizontal Synchronized Scrollbar (for instant panning at the top of the table) */}
          <div
            ref={topScrollContainerRef}
            onScroll={handleTopScroll}
            className="overflow-x-auto bg-slate-200/80 rounded-t-xl h-2.5 border border-slate-300/80"
            title="Slide to scroll table horizontally"
          >
            <div style={{ width: `${scrollWidth}px`, height: '1px' }} />
          </div>

          {loading ? (
            <div className="py-24 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
              <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-3" />
              <p className="text-sm text-slate-700 font-bold">Loading master exhibitor database...</p>
              <p className="text-xs text-slate-400 mt-1">Synchronizing orders, stall allotments, and uploads</p>
            </div>
          ) : filteredExhibitors.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Search className="w-6 h-6" />
              </div>
              <p className="text-slate-700 font-bold text-sm">No exhibitor records matching current criteria</p>
              <p className="text-xs text-slate-400">Try clearing search query or switching the category filter</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setActiveTab('all');
                  setSelectedSizeFilter('all');
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition-all shadow-xs"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div
                ref={tableContainerRef}
                onScroll={handleTableScroll}
                className="overflow-x-auto relative max-h-[75vh]"
              >
                <table className="w-full text-left text-slate-800 border-collapse">
                  {/* Table Header (Sticky) */}
                  <thead className="sticky top-0 z-30 bg-slate-100/95 backdrop-blur-md border-b border-slate-300 text-[11px] font-extrabold uppercase tracking-wider text-slate-700 shadow-2xs">
                    <tr>
                      {/* Sticky Left Column */}
                      <th className="py-3.5 px-4 sticky left-0 z-30 bg-slate-100/95 backdrop-blur-md border-r border-slate-200 min-w-[220px]">
                        Exhibitor & Photo
                      </th>
                      <th className="py-3.5 px-4 min-w-[130px]">Mobile (ID)</th>
                      <th className="py-3.5 px-4 min-w-[220px]">Brand / Company</th>
                      <th className="py-3.5 px-4 min-w-[140px]">Stall Space & Draw</th>
                      <th className="py-3.5 px-4 min-w-[240px]">Requested Extras</th>
                      <th className="py-3.5 px-4 min-w-[160px]">Artwork (CDR / Drive)</th>
                      <th className="py-3.5 px-4 min-w-[180px]">Special Notes</th>
                      <th className="py-3.5 px-4 min-w-[140px]">Last Updated</th>
                      {/* Sticky Right Action Column */}
                      <th className="py-3.5 px-4 sticky right-0 z-30 bg-slate-100/95 backdrop-blur-md border-l border-slate-200 text-center min-w-[180px] shadow-[-6px_0_12px_rgba(0,0,0,0.03)]">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-200 text-xs">
                    {filteredExhibitors.map((ex, idx) => {
                      const paddingClass = density === 'compact' ? 'py-2.5 px-3.5' : 'py-4 px-4';

                      return (
                        <tr
                          key={idx}
                          className="hover:bg-amber-50/40 transition-colors group cursor-pointer"
                          onClick={(e) => {
                            // Only trigger detail modal if not clicking an anchor or button directly
                            const target = e.target as HTMLElement;
                            if (!target.closest('button') && !target.closest('a')) {
                              setSelectedExhibitorForDetail(ex);
                            }
                          }}
                        >
                          {/* 1. Exhibitor & Photo (Sticky Left Column) */}
                          <td
                            className={`${paddingClass} sticky left-0 z-20 bg-white group-hover:bg-amber-50/40 transition-colors border-r border-slate-200 whitespace-nowrap`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="relative shrink-0">
                                {ex.profile_pic_url ? (
                                  <a
                                    href={ex.profile_pic_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="block w-10 h-10 rounded-xl overflow-hidden border border-amber-300 shadow-2xs hover:scale-110 transition-transform bg-slate-100"
                                    title="View full profile photo"
                                  >
                                    <img
                                      src={ex.profile_pic_url}
                                      alt={ex.exhibitor_name || ex.brand_name}
                                      className="w-full h-full object-cover"
                                    />
                                  </a>
                                ) : (
                                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-100 to-amber-50 border border-amber-200 flex items-center justify-center text-amber-800 font-bold font-mono">
                                    {ex.exhibitor_name ? ex.exhibitor_name.slice(0, 2).toUpperCase() : 'EX'}
                                  </div>
                                )}
                              </div>
                              <div className="truncate max-w-[160px]">
                                <span className="font-extrabold text-slate-900 block text-xs truncate">
                                  {ex.exhibitor_name || (
                                    <span className="text-amber-800 italic font-semibold">Not registered yet</span>
                                  )}
                                </span>
                                {ex.profile_pic_url ? (
                                  <a
                                    href={ex.profile_pic_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-[10px] text-amber-700 hover:underline font-semibold inline-flex items-center gap-0.5"
                                  >
                                    <span>Photo</span>
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                ) : (
                                  <span className="text-[10px] text-slate-400">No photo</span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* 2. Mobile (ID) */}
                          <td className={`${paddingClass} font-mono font-bold text-amber-800 whitespace-nowrap`}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(ex.mobile);
                              }}
                              className="hover:underline flex items-center gap-1"
                              title="Click to copy mobile"
                            >
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{ex.mobile}</span>
                            </button>
                          </td>

                          {/* 3. Brand / Company */}
                          <td className={`${paddingClass} max-w-[260px]`}>
                            <div className="font-extrabold text-slate-900 text-xs line-clamp-1" title={ex.brand_name}>
                              {ex.brand_name}
                            </div>
                            {ex.company_description && (
                              <p
                                className="text-[11px] text-slate-500 line-clamp-1 mt-0.5"
                                title={ex.company_description}
                              >
                                {ex.company_description}
                              </p>
                            )}
                            {ex.fascia_names && ex.fascia_names.some((n) => n && n.trim()) && (
                              <div className="mt-1 flex flex-col gap-0.5">
                                {ex.fascia_names.map((n, i) =>
                                  n && n.trim() ? (
                                    <span
                                      key={i}
                                      className="text-[10px] text-amber-900 bg-amber-50/90 px-1.5 py-0.5 rounded border border-amber-200/70 truncate max-w-[220px]"
                                      title={`Fascia Header ${i + 1}: ${n}`}
                                    >
                                      🏷️ H{i + 1}: <strong>{n}</strong>
                                    </span>
                                  ) : null
                                )}
                              </div>
                            )}
                          </td>

                          {/* 4. Stall Size & Draw */}
                          <td className={`${paddingClass} whitespace-nowrap`}>
                            <div className="space-y-1">
                              <span className="inline-block px-2.5 py-0.5 rounded-md bg-amber-50 border border-amber-300 font-mono text-amber-900 font-bold text-xs">
                                {ex.stall_sqft}
                              </span>
                              {ex.stall_number ? (
                                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Stall #{ex.stall_number}</span>
                                </div>
                              ) : (
                                <div className="text-[10px] text-slate-400 italic">Not drawn yet</div>
                              )}
                            </div>
                          </td>

                          {/* 5. Requested Extras */}
                          <td className={`${paddingClass} max-w-[280px]`}>
                            {ex.items && ex.items.length > 0 ? (
                              <div className="space-y-1">
                                {ex.items.slice(0, 3).map((item, i) => (
                                  <div key={i} className="flex items-center gap-1.5 text-xs truncate">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                                    <span className="font-bold text-slate-900 truncate" title={item.name}>
                                      {item.name}
                                    </span>
                                    <span className="text-slate-500 font-mono text-[11px] shrink-0">
                                      x{item.quantity} ({item.days || 2}d)
                                    </span>
                                  </div>
                                ))}
                                {ex.items.length > 3 && (
                                  <span className="text-[10px] text-amber-700 font-bold block">
                                    +{ex.items.length - 3} more items...
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">None selected</span>
                            )}
                          </td>

                          {/* 6. Artwork (CDR / Drive) */}
                          <td className={`${paddingClass} whitespace-nowrap`}>
                            {ex.cdr_file_url || ex.logo_file_url || ex.drive_file_url || ex.drive_folder_url ? (
                              <div className="flex flex-col gap-1">
                                {(ex.cdr_file_url || ex.logo_file_url) && (
                                  <a
                                    href={ex.cdr_file_url || ex.logo_file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold transition-all"
                                  >
                                    <FileCode className="w-3 h-3 text-amber-700" />
                                    <span>{ex.cdr_file_url ? 'CDR Vector' : 'Logo File'}</span>
                                    <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                                  </a>
                                )}
                                {(ex.drive_folder_url || ex.drive_file_url) && (
                                  <a
                                    href={ex.drive_folder_url || ex.drive_file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-bold transition-all"
                                  >
                                    <FolderOpen className="w-3 h-3 text-emerald-700" />
                                    <span>Drive Link</span>
                                    <ExternalLink className="w-2.5 h-2.5 text-emerald-600" />
                                  </a>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">None</span>
                            )}
                          </td>

                          {/* 7. Special Notes */}
                          <td className={`${paddingClass} max-w-[180px]`}>
                            <p className="text-slate-600 truncate text-[11px]" title={ex.special_notes || 'None'}>
                              {ex.special_notes || '—'}
                            </p>
                          </td>

                          {/* 8. Last Updated */}
                          <td className={`${paddingClass} text-slate-500 whitespace-nowrap text-[11px] font-mono`}>
                            {ex.last_updated ? new Date(ex.last_updated).toLocaleString('en-IN') : '—'}
                          </td>

                          {/* 9. Actions (Sticky Right Column) */}
                          <td
                            className={`${paddingClass} sticky right-0 z-20 bg-white group-hover:bg-amber-50/40 transition-colors border-l border-slate-200 text-center whitespace-nowrap shadow-[-6px_0_12px_rgba(0,0,0,0.03)]`}
                          >
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedExhibitorForDetail(ex);
                                }}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-bold text-[11px] transition-all flex items-center gap-1"
                                title="Inspect Complete Exhibitor Dossier"
                              >
                                <Eye className="w-3.5 h-3.5 text-slate-600" />
                                <span>Details</span>
                              </button>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedExhibitorForBill(ex);
                                }}
                                className="px-2.5 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-bold text-[11px] transition-all flex items-center gap-1 shadow-2xs"
                                title="Generate Official Tax Invoice / Bill"
                              >
                                <FileText className="w-3.5 h-3.5 text-amber-800" />
                                <span>Tax Bill</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Table Footer Summary Bar */}
              <div className="bg-slate-50 border-t border-slate-200 p-3.5 flex flex-wrap items-center justify-between text-xs text-slate-600">
                <div className="flex items-center gap-4">
                  <span>
                    Displayed Rows: <strong className="text-slate-900 font-mono">{filteredExhibitors.length}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Filtered Stall Space:{' '}
                    <strong className="text-amber-700 font-mono">
                      {filteredExhibitors
                        .reduce((sum, ex) => sum + (parseInt(ex.stall_sqft.replace(/\D/g, ''), 10) || 0), 0)
                        .toLocaleString()}{' '}
                      sq ft
                    </strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500">Tip: Click any exhibitor row to view full details</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Numbers with saved data that are on neither the sheet nor an alias */}
        {unknownProfiles.length > 0 && (
          <div className="bg-white border border-rose-200 rounded-2xl shadow-sm overflow-hidden mb-8">
            <div className="px-5 py-4 border-b border-rose-100 bg-rose-50/60">
              <h2 className="text-sm font-bold text-rose-900 flex items-center gap-2">
                Unrecognised numbers ({unknownProfiles.length})
              </h2>
              <p className="text-xs text-rose-800/80 mt-1">
                These numbers have a profile, an order or a drawn stall in the database
                but are on neither the master sheet nor an exhibitor&apos;s alias list. They are
                not counted above. Add the number to that exhibitor&apos;s row to merge it, or
                leave it here.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-800">
                <thead className="bg-slate-100 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  <tr>
                    <th className="py-3 px-4">Mobile</th>
                    <th className="py-3 px-4">Firm name saved</th>
                    <th className="py-3 px-4">Contact person</th>
                    <th className="py-3 px-4">Stall drawn</th>
                    <th className="py-3 px-4">Last activity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {unknownProfiles.map((u) => (
                    <tr key={u.mobile} className="hover:bg-rose-50/40">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{u.mobile}</td>
                      <td className="py-3 px-4">{u.brand_name || <span className="text-slate-400">—</span>}</td>
                      <td className="py-3 px-4">{u.exhibitor_name || <span className="text-slate-400">—</span>}</td>
                      <td className="py-3 px-4 font-mono">
                        {u.stall_number ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold">
                            {u.stall_number}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {u.last_updated ? new Date(u.last_updated).toLocaleString('en-IN') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Complete Exhibitor Details Inspector Modal */}
      {selectedExhibitorForDetail && (
        <ExhibitorDetailModal
          isOpen={true}
          onClose={() => setSelectedExhibitorForDetail(null)}
          exhibitor={selectedExhibitorForDetail}
          onOpenBillModal={(ex) => setSelectedExhibitorForBill(ex as ExhibitorRecord)}
        />
      )}

      {/* Bill Modal for Selected Exhibitor */}
      {selectedExhibitorForBill && (
        <BillModal
          isOpen={true}
          onClose={() => setSelectedExhibitorForBill(null)}
          brandName={selectedExhibitorForBill.brand_name || 'Registered Exhibitor'}
          mobile={selectedExhibitorForBill.mobile}
          stallSqft={selectedExhibitorForBill.stall_sqft || '200 sq ft'}
          fasciaNames={selectedExhibitorForBill.fascia_names}
          items={selectedExhibitorForBill.items.map((it) => {
            const master = EXTRAS_RATES.find((m) => m.id === it.id || m.name.toLowerCase() === it.name.toLowerCase());
            return {
              id: it.id,
              code: master?.code || 'DP',
              name: it.name,
              spec: master?.spec || null,
              rateInr: master?.rateInr || 600,
              quantity: it.quantity,
              days: it.days || 2,
            };
          })}
        />
      )}
    </div>
  );
}
