'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getStallPackageBySqft, STALL_PACKAGES, StallPackage } from '@/data/stallPackages';
import { getProductImage, DISCLAIMER_TEXT } from '@/data/productImages';
import BillModal from '@/components/extras/BillModal';
import {
  Building2,
  Phone,
  Ruler,
  ShoppingBag,
  CheckCircle2,
  Plus,
  Minus,
  LogOut,
  Sparkles,
  Save,
  Send,
  HelpCircle,
  Clock,
  Layers,
  ChevronRight,
  Info,
  Contact,
  Crown,
  Users,
  Wrench,
  AlertTriangle,
  Package,
  Gift,
  Video,
  Newspaper,
  Radio,
  Tv,
  Check,
  X,
  FileText,
  Store
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  unit: string;
  rate_inr?: number;
  icon_name: string;
}

interface OrderItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  quantity: number;
}

const SQFT_PRESETS = ['100', '200', '300', '400', '600', '800', '1000'];

export default function ExhibitorDashboardPage() {
  const router = useRouter();

  // Profile State
  const [mobile, setMobile] = useState('');
  const [brandName, setBrandName] = useState('');
  const [category, setCategory] = useState('');
  const [market, setMarket] = useState('');
  const [selectedSqftOption, setSelectedSqftOption] = useState<string>('200');
  const [customSqft, setCustomSqft] = useState<string>('');
  const [fasciaNames, setFasciaNames] = useState<string[]>(['', '', '', '']);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [profileError, setProfileError] = useState('');

  // Extras Catalog State
  const [products, setProducts] = useState<Product[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [specialNotes, setSpecialNotes] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [extrasSaving, setExtrasSaving] = useState(false);
  const [extrasSuccessMsg, setExtrasSuccessMsg] = useState('');
  const [lastSubmittedAt, setLastSubmittedAt] = useState<string | null>(null);
  const [showBillModal, setShowBillModal] = useState(false);

  // Exhibitor Entry Badges State (Owner, Sales Staff, Support Staff & Names)
  const [ownerBadges, setOwnerBadges] = useState<number>(1);
  const [salesBadges, setSalesBadges] = useState<number>(0);
  const [supportBadges, setSupportBadges] = useState<number>(0);
  const [ownerBadgeNames, setOwnerBadgeNames] = useState<string[]>(['']);
  const [salesBadgeNames, setSalesBadgeNames] = useState<string[]>([]);
  const [supportBadgeNames, setSupportBadgeNames] = useState<string[]>([]);

  // General Loading & Auth check
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleOwnerBadgesChange = (count: number) => {
    const val = Math.min(5, Math.max(0, count));
    setOwnerBadges(val);
    setOwnerBadgeNames((prev) => {
      const copy = [...prev];
      while (copy.length < val) copy.push('');
      return copy.slice(0, val);
    });
  };

  const handleSalesBadgesChange = (count: number) => {
    const val = Math.min(5, Math.max(0, count));
    setSalesBadges(val);
    setSalesBadgeNames((prev) => {
      const copy = [...prev];
      while (copy.length < val) copy.push('');
      return copy.slice(0, val);
    });
  };

  const handleSupportBadgesChange = (count: number) => {
    const val = Math.min(5, Math.max(0, count));
    setSupportBadges(val);
    setSupportBadgeNames((prev) => {
      const copy = [...prev];
      while (copy.length < val) copy.push('');
      return copy.slice(0, val);
    });
  };

  const fetchInitialData = async () => {
    try {
      // 1. Fetch Profile
      const profRes = await fetch('/api/exhibitor/profile');
      if (profRes.status === 401) {
        router.push('/exhibitor/login');
        return;
      }
      const profData = await profRes.json();

      setMobile(profData.mobile || '');
      setBrandName(profData.brand_name || '');
      setCategory(profData.category || '');
      setMarket(profData.market || '');

      const existingSqft = profData.stall_sqft || '200 sq ft';
      if (SQFT_PRESETS.includes(existingSqft)) {
        setSelectedSqftOption(existingSqft);
        setCustomSqft('');
      } else if (existingSqft) {
        setSelectedSqftOption('Other');
        setCustomSqft(existingSqft.replace(/^Other:\s*/i, ''));
      }

      if (Array.isArray(profData.fascia_names)) {
        setFasciaNames([
          profData.fascia_names[0] || '',
          profData.fascia_names[1] || '',
          profData.fascia_names[2] || '',
          profData.fascia_names[3] || ''
        ]);
      } else if (profData.brand_name) {
        setFasciaNames([profData.brand_name, '', '', '']);
      }

      // 2. Fetch Extras Catalog & existing order
      const catRes = await fetch('/api/exhibitor/extras');
      const catData = await catRes.json();

      if (catData.products) {
        setProducts(catData.products);
      }

      if (catData.existingOrder) {
        const qMap: Record<string, number> = {};
        if (Array.isArray(catData.existingOrder.items)) {
          catData.existingOrder.items.forEach((item: OrderItem) => {
            if (item.id && item.quantity > 0) {
              qMap[item.id] = item.quantity;
            }
          });
        }
        setQuantities(qMap);
        setSpecialNotes(catData.existingOrder.special_notes || '');
        const oCount = catData.existingOrder.owner_badges ?? 1;
        const sCount = catData.existingOrder.sales_badges ?? 0;
        const supCount = catData.existingOrder.support_badges ?? 0;
        setOwnerBadges(oCount);
        setSalesBadges(sCount);
        setSupportBadges(supCount);

        if (catData.existingOrder.badge_names) {
          const bn = catData.existingOrder.badge_names;
          if (Array.isArray(bn.owner)) {
            const arr = [...bn.owner];
            while (arr.length < oCount) arr.push('');
            setOwnerBadgeNames(arr.slice(0, oCount));
          }
          if (Array.isArray(bn.sales)) {
            const arr = [...bn.sales];
            while (arr.length < sCount) arr.push('');
            setSalesBadgeNames(arr.slice(0, sCount));
          }
          if (Array.isArray(bn.support)) {
            const arr = [...bn.support];
            while (arr.length < supCount) arr.push('');
            setSupportBadgeNames(arr.slice(0, supCount));
          }
        } else {
          setOwnerBadgeNames(Array(oCount).fill(''));
          setSalesBadgeNames(Array(sCount).fill(''));
          setSupportBadgeNames(Array(supCount).fill(''));
        }

        setLastSubmittedAt(catData.existingOrder.updated_at || null);
      }
    } catch (err) {
      console.error('Failed to load exhibitor dashboard data:', err);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setProfileSaving(true);
    setProfileSuccessMsg('');
    setProfileError('');

    const finalSqft =
      selectedSqftOption === 'Other'
        ? customSqft.trim()
          ? `Other: ${customSqft.trim()}`
          : 'Other'
        : selectedSqftOption;

    try {
      const res = await fetch('/api/exhibitor/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand_name: brandName,
          stall_sqft: finalSqft,
          fascia_names: fasciaNames
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setProfileError(data.error || 'Failed to save profile.');
      } else {
        setProfileSuccessMsg('Stall and Fascia details saved successfully!');
        setTimeout(() => setProfileSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error(err);
      setProfileError('Failed to save exhibitor profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[id] || 0;
      const updated = Math.max(0, current + delta);
      return { ...prev, [id]: updated };
    });
  };

  const handleSaveExtras = async () => {
    setExtrasSaving(true);
    setExtrasSuccessMsg('');

    const selectedItems: OrderItem[] = products
      .filter((p) => (quantities[p.id] || 0) > 0)
      .map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        unit: p.unit,
        quantity: quantities[p.id]
      }));

    try {
      // Also save stall profile
      await handleSaveProfile();

      const res = await fetch('/api/exhibitor/extras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: selectedItems,
          special_notes: specialNotes,
          owner_badges: ownerBadges,
          sales_badges: salesBadges,
          support_badges: supportBadges,
          badge_names: {
            owner: ownerBadgeNames.slice(0, ownerBadges),
            sales: salesBadgeNames.slice(0, salesBadges),
            support: supportBadgeNames.slice(0, supportBadges)
          }
        })
      });

      const data = await res.json();
      if (res.ok) {
        setExtrasSuccessMsg('Your requirements have been submitted successfully! Redirecting to homepage...');
        setLastSubmittedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        setTimeout(() => {
          router.push('/');
        }, 1500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setExtrasSaving(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/exhibitor/login');
  };

  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts =
    selectedCategory === 'All'
      ? products
      : products.filter((p) => p.category === selectedCategory);

  const totalSelectedItemsCount = Object.values(quantities).reduce((a, b) => a + b, 0);

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
          <p className="text-sm text-slate-600 font-medium">Loading Exhibitor Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-28">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/95 md:backdrop-blur-sm border-b border-slate-200 shadow-sm px-4 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-md shadow-amber-500/20 text-slate-950 font-bold">
              STE
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                Exhibitor Portal
                <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  2026
                </span>
              </h1>
              <p className="text-xs text-slate-500 font-medium">Surat Textile Expo — Exhibitor Extras & Requirements</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {(mobile === '9106139666' || mobile === '9950787787') && (
              <a
                href="/admin/exhibitors"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-extrabold transition-all shadow-md animate-pulse"
              >
                👑 Organizer Admin Console
              </a>
            )}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-700 font-medium">
              <Phone className="w-3.5 h-3.5 text-amber-600" />
              <span>User ID: <strong className="text-slate-900 font-bold">{mobile}</strong></span>
            </div>
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

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 pt-6 sm:pt-8 pb-32 sm:pb-28 space-y-6 sm:space-y-8">

        {/* Deadline Caution Banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 text-amber-900 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-amber-500 text-slate-950 shadow-md flex-shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
                <span>CRITICAL DEADLINE NOTICE</span>
                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold bg-amber-500 text-slate-950">
                  Strict Cutoff
                </span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 font-semibold mt-0.5">
                Exhibitor stall details, entry badges, and extra requirements <strong className="text-red-700 underline font-black">CANNOT be edited or modified after 5th September 2026 at 12:00 PM</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-amber-300 shadow-xs text-xs font-mono font-bold text-amber-900 self-stretch sm:self-auto justify-center whitespace-nowrap">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>Cutoff: 05 Sept 2026, 12:00 PM</span>
          </div>
        </div>

        {/* Section 1: Official Exhibitor Profile & Stall Allocation */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 lg:p-8 relative overflow-hidden shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">1. Verified Exhibitor Profile & Stall Allocation</h2>
              <p className="text-xs text-slate-500">Official stall size and brand allocation registered with STE 2026 Organizers</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Brand Name Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 block mb-1">
                  Registered Brand Name
                </span>
                <h3 className="text-lg font-bold text-slate-900 leading-snug">
                  {brandName || 'Registered Exhibitor'}
                </h3>
              </div>
              {category && (
                <div className="mt-3">
                  <span className="inline-block px-2.5 py-1 rounded text-[11px] font-semibold bg-slate-200 text-slate-800">
                    Category: {category}
                  </span>
                </div>
              )}
            </div>

            {/* Stall Size Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 block mb-1">
                  Allocated Stall Size
                </span>
                <h3 className="text-lg font-bold text-slate-900 font-mono leading-snug">
                  {selectedSqftOption === 'Other' ? (customSqft || '200 sq ft') : (selectedSqftOption.includes('sq ft') ? selectedSqftOption : `${selectedSqftOption} sq ft`)}
                </h3>
              </div>
              {market && (
                <div className="mt-3">
                  <span className="inline-block px-2.5 py-1 rounded text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 font-mono">
                    Market: {market}
                  </span>
                </div>
              )}
            </div>

            {/* Registered Mobile Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 block mb-1">
                  Registered Mobile (User ID)
                </span>
                <h3 className="text-lg font-bold text-slate-900 font-mono leading-snug">
                  {mobile}
                </h3>
              </div>
              <div className="mt-3">
                <span className="inline-block px-2.5 py-1 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-300">
                  ✓ Verified Exhibitor
                </span>
              </div>
            </div>
          </div>

          {/* Facia / Banner Name of Companies (4 Options) */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-900 border border-amber-300">
                  <Store className="w-5 h-5 text-amber-800" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <span>Stall Facia & Banner Names</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500 text-slate-950">
                      4 Firm Name Options
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Enter up to 4 company / firm name options to be printed on your booth fascia board header and promotional banners
                  </p>
                </div>
              </div>
            </div>

            {/* 4 Firm Name Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              {/* Option 1 */}
              <div className="p-4 bg-slate-50 border border-slate-200 hover:border-amber-400 rounded-xl transition-all shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 text-[11px] font-black flex items-center justify-center">1</span>
                    <span>Option 1 (Main Header Firm Name)</span>
                  </label>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">Main Header</span>
                </div>
                <input
                  type="text"
                  placeholder="e.g. Ambika Silk Mills (Main Header Option 1)"
                  value={fasciaNames[0] || ''}
                  onChange={(e) => {
                    const copy = [...fasciaNames];
                    copy[0] = e.target.value;
                    setFasciaNames(copy);
                  }}
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Main header firm name option 1 for booth fascia board</span>
              </div>

              {/* Option 2 */}
              <div className="p-4 bg-slate-50 border border-slate-200 hover:border-amber-400 rounded-xl transition-all shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 text-[11px] font-black flex items-center justify-center">2</span>
                    <span>Option 2 (Main Header Firm Name)</span>
                  </label>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">Main Header</span>
                </div>
                <input
                  type="text"
                  placeholder="e.g. Ambika Tex Fab (Main Header Option 2)"
                  value={fasciaNames[1] || ''}
                  onChange={(e) => {
                    const copy = [...fasciaNames];
                    copy[1] = e.target.value;
                    setFasciaNames(copy);
                  }}
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Main header firm name option 2 for booth fascia board</span>
              </div>

              {/* Option 3 */}
              <div className="p-4 bg-slate-50 border border-slate-200 hover:border-amber-400 rounded-xl transition-all shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 text-[11px] font-black flex items-center justify-center">3</span>
                    <span>Option 3 (Main Header Firm Name)</span>
                  </label>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">Main Header</span>
                </div>
                <input
                  type="text"
                  placeholder="e.g. Ambika Digital Prints (Main Header Option 3)"
                  value={fasciaNames[2] || ''}
                  onChange={(e) => {
                    const copy = [...fasciaNames];
                    copy[2] = e.target.value;
                    setFasciaNames(copy);
                  }}
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Main header firm name option 3 for booth fascia board</span>
              </div>

              {/* Option 4 */}
              <div className="p-4 bg-slate-50 border border-slate-200 hover:border-amber-400 rounded-xl transition-all shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 text-[11px] font-black flex items-center justify-center">4</span>
                    <span>Option 4 (Main Header Firm Name)</span>
                  </label>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">Main Header</span>
                </div>
                <input
                  type="text"
                  placeholder="e.g. Ambika Fabrics (Main Header Option 4)"
                  value={fasciaNames[3] || ''}
                  onChange={(e) => {
                    const copy = [...fasciaNames];
                    copy[3] = e.target.value;
                    setFasciaNames(copy);
                  }}
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Main header firm name option 4 for booth fascia board</span>
              </div>
            </div>

            {/* Live Facia Board Mockup Preview */}
            <div className="p-4 bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 rounded-xl border border-amber-500/30 text-white shadow-md mb-4">
              <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-neutral-800">
                <span className="text-[10px] uppercase tracking-widest text-amber-400 font-bold flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5" />
                  <span>Stall Entrance Facia Board Mockup Preview (Main Header):</span>
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">STE 2026 SURAT</span>
              </div>
              <div className="py-3 px-4 bg-neutral-900/90 rounded-lg border border-amber-400/20 text-center">
                {fasciaNames.some((n) => n && n.trim()) ? (
                  <div className="space-y-2">
                    {fasciaNames.map((n, i) => n && n.trim() ? (
                      <div key={i} className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2.5">
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider">
                          Main Header Option {i + 1}
                        </span>
                        <span className="text-sm sm:text-base font-black text-amber-400 uppercase tracking-wide font-sans">
                          {n}
                        </span>
                      </div>
                    ) : null)}
                  </div>
                ) : (
                  <h4 className="text-base sm:text-lg font-black text-amber-400 uppercase tracking-wide font-sans">
                    {brandName || 'YOUR MAIN HEADER FIRM NAME'}
                  </h4>
                )}
              </div>
            </div>

            {/* Save Button for Profile & Facia */}
            <div className="flex items-center justify-between">
              {profileSuccessMsg ? (
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {profileSuccessMsg}
                </span>
              ) : profileError ? (
                <span className="text-xs font-bold text-red-600">{profileError}</span>
              ) : (
                <span className="text-xs text-slate-500">Make sure spellings are exact as they will be printed on physical boards.</span>
              )}

              <button
                type="button"
                onClick={() => handleSaveProfile()}
                disabled={profileSaving}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 shadow-xs flex items-center gap-2"
              >
                {profileSaving ? 'Saving...' : 'Save Facia & Stall Details'}
              </button>
            </div>
          </div>

          {/* Included Stall Package & Amenities Breakdown */}
          {(() => {
            const effectiveSqft = selectedSqftOption === 'Other' ? (customSqft || '200') : selectedSqftOption;
            const currentPackage = getStallPackageBySqft(effectiveSqft);
            if (!currentPackage) return null;

            return (
              <div className="mt-8 pt-6 border-t border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-amber-100 text-amber-900 border border-amber-300">
                      <Gift className="w-5 h-5 text-amber-800" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                        <span>Complimentary Stall Package: <span className="text-amber-800 font-bold underline underline-offset-2">{currentPackage.package_name} ({currentPackage.size_sqft} sq ft)</span></span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500 text-slate-950 shadow-xs">
                          Free Inclusions
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">Standard amenities & marketing assets provided by STE 2026 organizers for your stall</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Group A: Furniture & Electrical Infrastructure */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-xs">
                    <div className="flex items-center gap-2 mb-3.5 pb-2.5 border-b border-slate-200">
                      <Package className="w-4 h-4 text-amber-700" />
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">Furniture & Electrical</h4>
                    </div>
                    <ul className="space-y-2 text-xs font-semibold text-slate-700">
                      <li className="flex justify-between items-center">
                        <span>Exhibition Chairs</span>
                        <span className="font-extrabold text-amber-800 font-mono bg-white px-2 py-0.5 rounded border border-slate-200">{currentPackage.exhibition_chairs} pcs</span>
                      </li>
                      <li className="flex justify-between items-center">
                        <span>Rectangular Table</span>
                        <span className="font-extrabold text-amber-800 font-mono bg-white px-2 py-0.5 rounded border border-slate-200">{currentPackage.rectangular_table} pcs</span>
                      </li>
                      {currentPackage.reception_table > 0 && (
                        <li className="flex justify-between items-center">
                          <span>Reception Table</span>
                          <span className="font-extrabold text-amber-800 font-mono bg-white px-2 py-0.5 rounded border border-slate-200">{currentPackage.reception_table} pcs</span>
                        </li>
                      )}
                      {currentPackage.sofa > 0 && (
                        <li className="flex justify-between items-center">
                          <span>Sofa Set</span>
                          <span className="font-extrabold text-amber-800 font-mono bg-white px-2 py-0.5 rounded border border-slate-200">{currentPackage.sofa} set</span>
                        </li>
                      )}
                      {currentPackage.mannequin > 0 && (
                        <li className="flex justify-between items-center">
                          <span>Display Mannequin</span>
                          <span className="font-extrabold text-amber-800 font-mono bg-white px-2 py-0.5 rounded border border-slate-200">{currentPackage.mannequin} pcs</span>
                        </li>
                      )}
                      <li className="flex justify-between items-center">
                        <span>Hanger Stand</span>
                        <span className="font-extrabold text-amber-800 font-mono bg-white px-2 py-0.5 rounded border border-slate-200">{currentPackage.hanger_stand} pcs</span>
                      </li>
                      <li className="flex justify-between items-center">
                        <span>Metal Lights</span>
                        <span className="font-extrabold text-amber-800 font-mono bg-white px-2 py-0.5 rounded border border-slate-200">{currentPackage.metal_lights} units</span>
                      </li>
                      <li className="flex justify-between items-center">
                        <span>Power Plug Points</span>
                        <span className="font-extrabold text-amber-800 font-mono bg-white px-2 py-0.5 rounded border border-slate-200">{currentPackage.plug_points} points</span>
                      </li>
                      <li className="flex justify-between items-center">
                        <span>Dust Bin</span>
                        <span className="font-extrabold text-amber-800 font-mono bg-white px-2 py-0.5 rounded border border-slate-200">{currentPackage.dust_bin} pcs</span>
                      </li>
                    </ul>
                  </div>

                  {/* Group B: Marketing & Media Coverage */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-xs">
                    <div className="flex items-center gap-2 mb-3.5 pb-2.5 border-b border-slate-200">
                      <Newspaper className="w-4 h-4 text-amber-700" />
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">Marketing & Media</h4>
                    </div>
                    <ul className="space-y-2 text-xs font-semibold text-slate-700">
                      <li className="flex justify-between items-center">
                        <span>Physical Invitation Cards</span>
                        <span className="font-extrabold text-amber-800 font-mono bg-white px-2 py-0.5 rounded border border-slate-200">{currentPackage.invitation_cards} cards</span>
                      </li>
                      <li className="flex justify-between items-center">
                        <span>Digital Invite Creatives</span>
                        <span className="font-extrabold text-amber-800 font-mono bg-white px-2 py-0.5 rounded border border-slate-200">{currentPackage.digital_invitation_designs} designs</span>
                      </li>
                      <li className="flex justify-between items-center">
                        <span>Logo Animated Promo Video</span>
                        <span className="font-extrabold text-amber-800 font-mono bg-white px-2 py-0.5 rounded border border-slate-200">{currentPackage.logo_animated_videos} videos</span>
                      </li>
                      <li className="flex justify-between items-center">
                        <span>Newspaper Media Coverage</span>
                        <span className="font-extrabold text-amber-800 font-mono bg-white px-2 py-0.5 rounded border border-slate-200">{currentPackage.newspaper_coverage} edition</span>
                      </li>
                      <li className="flex justify-between items-center">
                        <span>Magazine Advertisement</span>
                        <span className="font-extrabold text-amber-800 font-mono bg-white px-2 py-0.5 rounded border border-slate-200">{currentPackage.magazine_advertisement} feature</span>
                      </li>
                    </ul>
                  </div>

                  {/* Group C: VIP & Media Special Perks */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-xs">
                    <div className="flex items-center gap-2 mb-3.5 pb-2.5 border-b border-slate-200">
                      <Crown className="w-4 h-4 text-amber-700" />
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">VIP Perks & Media</h4>
                    </div>
                    <ul className="space-y-2.5 text-xs font-semibold">
                      <li className="flex justify-between items-center">
                        <span>Corner Stall Allocation</span>
                        {currentPackage.corner_stall ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">✓ Included</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-200 text-slate-600">Standard</span>
                        )}
                      </li>
                      <li className="flex justify-between items-center">
                        <span>Video Interview Coverage</span>
                        {currentPackage.video_interview ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">✓ Included</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-200 text-slate-600">Not Included</span>
                        )}
                      </li>
                      <li className="flex justify-between items-center">
                        <span>Podcast Shoot Feature</span>
                        {currentPackage.podcast_shoot ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">✓ Included</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-200 text-slate-600">Not Included</span>
                        )}
                      </li>
                      <li className="flex justify-between items-center">
                        <span>5 Social Media Reels</span>
                        {currentPackage.reels_5 ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">✓ Included</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-200 text-slate-600">Not Included</span>
                        )}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            );
          })()}
        </section>

        {/* Section 2: Exhibitor Entry Badges */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 lg:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
                <Contact className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">2. Exhibitor Entry Badges Request</h2>
                <p className="text-xs text-slate-500">Request official hall entry badges for Owners, Sales Staff, and Support Team</p>
              </div>
            </div>

            <span className="self-start sm:self-center px-3 py-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-extrabold">
              Total Badges: {ownerBadges + salesBadges + supportBadges}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* For Owner */}
            <div className="bg-slate-50 border border-slate-200 hover:border-amber-400 rounded-xl p-5 transition-all shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-amber-100 text-amber-800">
                      <Crown className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">For Owner</h3>
                      <p className="text-[11px] text-slate-500">Directors / Stall Owners</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">Max 5</span>
                </div>
                <p className="text-xs text-slate-600 mb-4">Official VIP exhibitor badge with full access to hall & VIP lounge</p>
                <div className="flex items-center justify-between bg-white border border-slate-300 rounded-lg p-1.5 mb-3">
                  <button
                    type="button"
                    onClick={() => handleOwnerBadgesChange(ownerBadges - 1)}
                    className="w-8 h-8 rounded bg-slate-100 hover:bg-slate-200 text-slate-900 flex items-center justify-center font-bold border border-slate-200"
                  >
                    -
                  </button>
                  <span className="text-base font-extrabold text-amber-700">{ownerBadges}</span>
                  <button
                    type="button"
                    onClick={() => handleOwnerBadgesChange(ownerBadges + 1)}
                    className="w-8 h-8 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center font-extrabold shadow-sm"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Owner Badge Holder Names */}
              {ownerBadges > 0 && (
                <div className="pt-3 border-t border-slate-200 space-y-2 mt-2">
                  <span className="text-[11px] font-bold text-slate-700 block uppercase tracking-wide">
                    Owner Name(s) to be printed:
                  </span>
                  {Array.from({ length: ownerBadges }).map((_, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-200 shrink-0">
                        #{idx + 1}
                      </span>
                      <input
                        type="text"
                        placeholder={`Owner / Director Full Name ${idx + 1}`}
                        value={ownerBadgeNames[idx] || ''}
                        onChange={(e) => {
                          const copy = [...ownerBadgeNames];
                          copy[idx] = e.target.value;
                          setOwnerBadgeNames(copy);
                        }}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* For Sales Staff */}
            <div className="bg-slate-50 border border-slate-200 hover:border-amber-400 rounded-xl p-5 transition-all shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-amber-100 text-amber-800">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">For Sales Staff</h3>
                      <p className="text-[11px] text-slate-500">Sales Team & Executives</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">Max 5</span>
                </div>
                <p className="text-xs text-slate-600 mb-4">Exhibitor floor badges for your active sales team inside booth</p>
                <div className="flex items-center justify-between bg-white border border-slate-300 rounded-lg p-1.5 mb-3">
                  <button
                    type="button"
                    onClick={() => handleSalesBadgesChange(salesBadges - 1)}
                    className="w-8 h-8 rounded bg-slate-100 hover:bg-slate-200 text-slate-900 flex items-center justify-center font-bold border border-slate-200"
                  >
                    -
                  </button>
                  <span className="text-base font-extrabold text-amber-700">{salesBadges}</span>
                  <button
                    type="button"
                    onClick={() => handleSalesBadgesChange(salesBadges + 1)}
                    className="w-8 h-8 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center font-extrabold shadow-sm"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Sales Badge Holder Names */}
              {salesBadges > 0 && (
                <div className="pt-3 border-t border-slate-200 space-y-2 mt-2">
                  <span className="text-[11px] font-bold text-slate-700 block uppercase tracking-wide">
                    Sales Person Name(s):
                  </span>
                  {Array.from({ length: salesBadges }).map((_, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-slate-700 bg-slate-200 px-1.5 py-0.5 rounded border border-slate-300 shrink-0">
                        #{idx + 1}
                      </span>
                      <input
                        type="text"
                        placeholder={`Sales Staff Full Name ${idx + 1}`}
                        value={salesBadgeNames[idx] || ''}
                        onChange={(e) => {
                          const copy = [...salesBadgeNames];
                          copy[idx] = e.target.value;
                          setSalesBadgeNames(copy);
                        }}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* For Support Staff */}
            <div className="bg-slate-50 border border-slate-200 hover:border-amber-400 rounded-xl p-5 transition-all shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-amber-100 text-amber-800">
                      <Wrench className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">For Support Staff</h3>
                      <p className="text-[11px] text-slate-500">Setup & Technical Team</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">Max 5</span>
                </div>
                <p className="text-xs text-slate-600 mb-4">Work passes for booth setup, technical maintenance & logistics staff</p>
                <div className="flex items-center justify-between bg-white border border-slate-300 rounded-lg p-1.5 mb-3">
                  <button
                    type="button"
                    onClick={() => handleSupportBadgesChange(supportBadges - 1)}
                    className="w-8 h-8 rounded bg-slate-100 hover:bg-slate-200 text-slate-900 flex items-center justify-center font-bold border border-slate-200"
                  >
                    -
                  </button>
                  <span className="text-base font-extrabold text-amber-700">{supportBadges}</span>
                  <button
                    type="button"
                    onClick={() => handleSupportBadgesChange(supportBadges + 1)}
                    className="w-8 h-8 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center font-extrabold shadow-sm"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Support Badge Holder Names */}
              {supportBadges > 0 && (
                <div className="pt-3 border-t border-slate-200 space-y-2 mt-2">
                  <span className="text-[11px] font-bold text-slate-700 block uppercase tracking-wide">
                    Support Person Name(s):
                  </span>
                  {Array.from({ length: supportBadges }).map((_, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-slate-700 bg-slate-200 px-1.5 py-0.5 rounded border border-slate-300 shrink-0">
                        #{idx + 1}
                      </span>
                      <input
                        type="text"
                        placeholder={`Support Staff Full Name ${idx + 1}`}
                        value={supportBadgeNames[idx] || ''}
                        onChange={(e) => {
                          const copy = [...supportBadgeNames];
                          copy[idx] = e.target.value;
                          setSupportBadgeNames(copy);
                        }}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Section 3: Extras Catalog Store */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 lg:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">3. Additional Requirements & Extras</h2>
                <p className="text-xs text-slate-500">Select extra furniture, display fixtures, audio-visual gear, and electrical connections needed for your booth</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href="/exhibitor-extras"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
              >
                <Layers className="w-4 h-4 text-amber-700" />
                <span>View Full Rate Card</span>
              </a>

              {totalSelectedItemsCount > 0 && (
                <span className="px-3 py-2 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                  {totalSelectedItemsCount} Extra Item(s)
                </span>
              )}
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none border-b border-slate-200">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white font-bold shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product Image Reference & Rate Disclaimer Banner */}
          <div className="mb-6 p-4 bg-amber-50/80 border border-amber-300 rounded-xl flex items-start gap-3 text-amber-900 shadow-xs">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <span className="font-extrabold block text-amber-950 uppercase tracking-wide">
                Product Image & GST Notice:
              </span>
              <p className="text-amber-900 font-bold">
                • Note: The images are for booking purpose only. The original product may change.
              </p>
              <p className="text-amber-950 font-extrabold">
                • All rates shown are EXCLUDING GST. Applicable 18% GST will be added at final billing.
              </p>
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProducts.map((p) => {
              const qty = quantities[p.id] || 0;
              const imgUrl = getProductImage(p.id);
              return (
                <div
                  key={p.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                    qty > 0
                      ? 'bg-amber-50/70 border-amber-400 shadow-md ring-1 ring-amber-400/40'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    {/* Reference Product Image */}
                    <div className="relative w-full h-44 mb-3 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 group shadow-xs">
                      <img
                        src={imgUrl}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute bottom-0 inset-x-0 bg-slate-900/90 backdrop-blur-xs text-[10px] text-amber-300 px-2 py-1 font-bold text-center leading-tight">
                        ⚠️ Note: The images are for booking purpose only. The original product may change.
                      </div>
                    </div>

                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 bg-slate-200 text-slate-700 rounded-md">
                        {p.category}
                      </span>
                      {p.rate_inr ? (
                        <div className="text-right">
                          <span className="text-xs font-mono font-extrabold text-amber-700 block">
                            ₹{p.rate_inr.toLocaleString('en-IN')} / day
                          </span>
                          <span className="text-[9px] font-extrabold text-amber-800 uppercase tracking-tight block">
                            + 18% GST Extra
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 font-mono">
                          Per {p.unit}
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mb-1">{p.name}</h3>
                    <p className="text-xs text-slate-600 mb-3">{p.description}</p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-200 mt-2">
                    <span className="text-xs font-semibold text-slate-600">
                      Quantity:
                    </span>
                    <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-lg p-1">
                      <button
                        type="button"
                        onClick={() => updateQuantity(p.id, -1)}
                        className="w-7 h-7 rounded-md bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-800 border border-slate-200 transition-colors active:scale-95 font-bold"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-extrabold text-slate-900 font-mono">
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(p.id, 1)}
                        className="w-7 h-7 rounded-md bg-amber-500 hover:bg-amber-400 flex items-center justify-center text-slate-950 font-extrabold transition-colors active:scale-95 shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Special Instructions & Notes */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
              Special Requests or Custom Requirements
            </label>
            <textarea
              rows={3}
              placeholder="Mention any specific color preferences, dimensions, positioning notes, or unlisted extras you need..."
              value={specialNotes}
              onChange={(e) => setSpecialNotes(e.target.value)}
              className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 focus:bg-white transition-all"
            />
          </div>

          {/* Save Extras Submission */}
          {extrasSuccessMsg && (
            <div className="mt-4 p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {extrasSuccessMsg}
            </div>
          )}

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>
                {lastSubmittedAt ? `Last submitted at ${lastSubmittedAt}` : 'No extra items submitted yet'}
              </span>
            </div>

            <button
              onClick={handleSaveExtras}
              disabled={extrasSaving}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-md shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{extrasSaving ? 'Submitting...' : 'Submit Extra Requirements'}</span>
            </button>
          </div>
        </section>

        {/* Section 3: Summary of Submitted Requirements */}
        <section className="bg-slate-100/80 border border-slate-200 rounded-2xl p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-200 text-slate-700">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Submitted Summary Overview</h3>
            </div>

            {totalSelectedItemsCount > 0 && (
              <button
                type="button"
                onClick={() => setShowBillModal(true)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-sm flex items-center gap-1.5 transition-all self-start sm:self-center"
              >
                <FileText className="w-4 h-4" />
                <span>View / Print Official Tax Invoice Bill</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-semibold uppercase">Brand Name</span>
              <p className="text-base font-bold text-slate-900 mt-1">{brandName || 'Not saved yet'}</p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-semibold uppercase">Stall Size</span>
              <p className="text-base font-bold text-amber-800 mt-1">
                {selectedSqftOption === 'Other'
                  ? customSqft ? `${customSqft} sq ft` : 'Custom (Other)'
                  : `${selectedSqftOption} sq ft`}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-semibold uppercase">Total Requested Extras</span>
              <p className="text-base font-bold text-emerald-700 mt-1">{totalSelectedItemsCount} item(s)</p>
            </div>
          </div>

          {/* Facia / Banner Board Names Summary */}
          {fasciaNames.some((n) => n && n.trim()) && (
            <div className="mb-6 p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-2">
                Fascia / Banner Board Main Header Options (To be printed):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {fasciaNames.map((fn, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                    <span className="text-[10px] font-bold text-amber-700 block uppercase">
                      Main Header Option {idx + 1}:
                    </span>
                    <p className="font-bold text-slate-900 mt-0.5 truncate">
                      {fn.trim() ? fn : <span className="text-slate-400 font-normal italic">Not specified</span>}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Badges Breakdown Summary */}
          {(ownerBadges > 0 || salesBadges > 0 || supportBadges > 0) && (
            <div className="mb-6 p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-3">
                Requested Badges ({ownerBadges + salesBadges + supportBadges} Total):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {ownerBadges > 0 && (
                  <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg text-xs">
                    <div className="flex items-center justify-between font-bold text-amber-900 mb-1">
                      <span>👑 Owner Badges:</span>
                      <span>{ownerBadges}</span>
                    </div>
                    <ul className="text-[11px] text-slate-700 space-y-0.5 mt-1 list-disc list-inside">
                      {ownerBadgeNames.slice(0, ownerBadges).map((n, i) => (
                        <li key={i}>{n.trim() ? n : `Owner ${i + 1} (Name not set)`}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {salesBadges > 0 && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                      <span>👥 Sales Staff:</span>
                      <span>{salesBadges}</span>
                    </div>
                    <ul className="text-[11px] text-slate-700 space-y-0.5 mt-1 list-disc list-inside">
                      {salesBadgeNames.slice(0, salesBadges).map((n, i) => (
                        <li key={i}>{n.trim() ? n : `Sales Staff ${i + 1} (Name not set)`}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {supportBadges > 0 && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                      <span>🔧 Support Staff:</span>
                      <span>{supportBadges}</span>
                    </div>
                    <ul className="text-[11px] text-slate-700 space-y-0.5 mt-1 list-disc list-inside">
                      {supportBadgeNames.slice(0, supportBadges).map((n, i) => (
                        <li key={i}>{n.trim() ? n : `Support Staff ${i + 1} (Name not set)`}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {totalSelectedItemsCount > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <div className="px-4 py-3 bg-slate-100 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider flex justify-between">
                <span>Selected Item</span>
                <span>Quantity</span>
              </div>
              <div className="divide-y divide-slate-100">
                {products
                  .filter((p) => (quantities[p.id] || 0) > 0)
                  .map((p) => (
                    <div key={p.id} className="px-4 py-3 text-xs flex justify-between items-center text-slate-700">
                      <div>
                        <span className="font-bold text-slate-900">{p.name}</span>
                        <span className="text-slate-500 ml-2">({p.category})</span>
                      </div>
                      <span className="font-mono font-bold text-amber-700">
                        {quantities[p.id]} {p.unit}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </section>

      </main>

      {/* Sticky Floating Bottom Submit Bar for Easy Mobile & Desktop Access */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 md:backdrop-blur-sm border-t border-amber-300 p-4 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <div className="text-xs">
              <span className="text-slate-900 font-extrabold block sm:inline">
                {brandName ? brandName : 'Stall Profile'}: {selectedSqftOption === 'Other' ? (customSqft ? `${customSqft} sq ft` : 'Custom') : `${selectedSqftOption} sq ft`}
              </span>
              <span className="text-slate-600 sm:ml-2">
                ({totalSelectedItemsCount} extra item{totalSelectedItemsCount === 1 ? '' : 's'}, {ownerBadges + salesBadges + supportBadges} badge{ownerBadges + salesBadges + supportBadges === 1 ? '' : 's'})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {totalSelectedItemsCount > 0 && (
              <button
                type="button"
                onClick={() => setShowBillModal(true)}
                className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-900 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-xs"
              >
                <FileText className="w-4 h-4 text-amber-700" />
                <span>View Bill</span>
              </button>
            )}

            <button
              onClick={handleSaveExtras}
              disabled={extrasSaving}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all transform active:scale-95 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{extrasSaving ? 'Submitting...' : 'Submit All Requirements'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Official Tax Invoice / Bill Modal */}
      <BillModal
        isOpen={showBillModal}
        onClose={() => setShowBillModal(false)}
        brandName={brandName || "Registered Exhibitor"}
        mobile={mobile}
        stallSqft={selectedSqftOption === 'Other' ? (customSqft ? `${customSqft} sq ft` : '200 sq ft') : `${selectedSqftOption} sq ft`}
        fasciaNames={fasciaNames}
        days={2}
        items={products
          .filter((p) => (quantities[p.id] || 0) > 0)
          .map((p) => ({
            id: p.id,
            name: p.name,
            rateInr: p.rate_inr || 0,
            quantity: quantities[p.id],
          }))}
      />
    </div>
  );
}
