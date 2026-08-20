'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  IdCard,
  Crown,
  Users,
  Wrench
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  unit: string;
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
  const [selectedSqftOption, setSelectedSqftOption] = useState<string>('100');
  const [customSqft, setCustomSqft] = useState<string>('');
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

  // Exhibitor Entry Badges State (Owner, Sales Staff, Support Staff)
  const [ownerBadges, setOwnerBadges] = useState<number>(1);
  const [salesBadges, setSalesBadges] = useState<number>(0);
  const [supportBadges, setSupportBadges] = useState<number>(0);

  // General Loading & Auth check
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, []);

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

      const existingSqft = profData.stall_sqft || '100';
      if (SQFT_PRESETS.includes(existingSqft)) {
        setSelectedSqftOption(existingSqft);
        setCustomSqft('');
      } else if (existingSqft) {
        setSelectedSqftOption('Other');
        setCustomSqft(existingSqft.replace(/^Other:\s*/i, ''));
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
        setOwnerBadges(catData.existingOrder.owner_badges ?? 1);
        setSalesBadges(catData.existingOrder.sales_badges ?? 0);
        setSupportBadges(catData.existingOrder.support_badges ?? 0);
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
        body: JSON.stringify({ brand_name: brandName, stall_sqft: finalSqft })
      });

      const data = await res.json();
      if (!res.ok) {
        setProfileError(data.error || 'Failed to save profile.');
      } else {
        setProfileSuccessMsg('Stall details saved successfully!');
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
          support_badges: supportBadges
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
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
          <p className="text-sm text-neutral-400 font-medium">Loading Exhibitor Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans pb-20">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-neutral-900/90 md:backdrop-blur-sm border-b border-neutral-800/80 px-4 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/10 text-neutral-950 font-bold">
              STE
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Exhibitor Portal
                <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  2026
                </span>
              </h1>
              <p className="text-xs text-neutral-400">Surat Textile Expo — Exhibitor Extras & Requirements</p>
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
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-300">
              <Phone className="w-3.5 h-3.5 text-amber-500" />
              <span>User ID: <strong className="text-white">{mobile}</strong></span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-all border border-neutral-700"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 pt-8 space-y-8">

        {/* Section 1: Exhibitor & Stall Profile Setup */}
        <section className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 lg:p-8 md:backdrop-blur-sm relative overflow-hidden shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">1. Exhibitor Details & Stall Size</h2>
              <p className="text-xs text-neutral-400">Enter your official brand name and select the size of your allocated stall</p>
            </div>
          </div>

          {profileError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
              {profileError}
            </div>
          )}

          {profileSuccessMsg && (
            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              {profileSuccessMsg}
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Brand Name Input */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-2">
                  Brand Name / Company Name <span className="text-amber-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Silks Pvt Ltd"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                  />
                </div>
              </div>

              {/* Mobile Number Read-Only */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-2">
                  Registered Mobile Number (User ID)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    disabled
                    value={mobile}
                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-950/60 border border-neutral-800/60 rounded-xl text-neutral-400 text-sm cursor-not-allowed font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Stall Square Footage Selection */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-2 flex items-center gap-1.5">
                <Ruler className="w-4 h-4 text-amber-400" />
                Stall Size (Square Feet) <span className="text-amber-500">*</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2.5">
                {SQFT_PRESETS.map((sqft) => (
                  <button
                    key={sqft}
                    type="button"
                    onClick={() => setSelectedSqftOption(sqft)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all flex flex-col items-center justify-center gap-0.5 ${
                      selectedSqftOption === sqft
                        ? 'bg-gradient-to-b from-amber-500 to-amber-600 border-amber-400 text-neutral-950 shadow-md shadow-amber-500/20 scale-[1.02]'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:bg-neutral-900'
                    }`}
                  >
                    <span className="text-sm font-bold">{sqft}</span>
                    <span className="text-xs opacity-75">sq ft</span>
                  </button>
                ))}

                {/* Other Option */}
                <button
                  type="button"
                  onClick={() => setSelectedSqftOption('Other')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all flex flex-col items-center justify-center gap-0.5 ${
                    selectedSqftOption === 'Other'
                      ? 'bg-gradient-to-b from-amber-500 to-amber-600 border-amber-400 text-neutral-950 shadow-md shadow-amber-500/20 scale-[1.02]'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:bg-neutral-900'
                  }`}
                >
                  <span className="text-sm font-bold">Other</span>
                  <span className="text-xs opacity-75">Custom</span>
                </button>
              </div>

              {/* Custom Sqft Field when 'Other' is selected */}
              {selectedSqftOption === 'Other' && (
                <div className="mt-3 p-4 bg-neutral-950 border border-amber-500/30 rounded-xl animate-fadeIn">
                  <label className="block text-xs text-amber-400 font-medium mb-1.5">
                    Specify Custom Stall Size:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 500 sq ft or 1500 sq ft"
                    value={customSqft}
                    onChange={(e) => setCustomSqft(e.target.value)}
                    className="w-full px-3.5 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={profileSaving}
                className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-amber-500/10 transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{profileSaving ? 'Saving...' : 'Save Stall Profile'}</span>
              </button>
            </div>
          </form>
        </section>

        {/* Section 2: Exhibitor Entry Badges */}
        <section className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 lg:p-8 md:backdrop-blur-sm shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <IdCard className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">2. Exhibitor Entry Badges Request</h2>
                <p className="text-xs text-neutral-400">Request official hall entry badges for Owners, Sales Staff, and Support Team</p>
              </div>
            </div>

            <span className="self-start sm:self-center px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-semibold">
              Total Badges: {ownerBadges + salesBadges + supportBadges}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* For Owner */}
            <div className="bg-neutral-950/80 border border-neutral-800 hover:border-amber-500/40 rounded-xl p-5 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                    <Crown className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">For Owner</h3>
                    <p className="text-[11px] text-neutral-400">Directors / Stall Owners</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-neutral-800 text-neutral-300">Max 2</span>
              </div>
              <p className="text-xs text-neutral-400 mb-4">Official VIP exhibitor badge with full access to hall & VIP lounge</p>
              <div className="flex items-center justify-between bg-neutral-900 border border-neutral-800 rounded-lg p-1.5">
                <button
                  type="button"
                  onClick={() => setOwnerBadges(Math.max(0, ownerBadges - 1))}
                  className="w-8 h-8 rounded bg-neutral-800 hover:bg-neutral-700 text-white flex items-center justify-center font-bold"
                >
                  -
                </button>
                <span className="text-base font-bold text-amber-400">{ownerBadges}</span>
                <button
                  type="button"
                  onClick={() => setOwnerBadges(Math.min(2, ownerBadges + 1))}
                  className="w-8 h-8 rounded bg-amber-500 hover:bg-amber-400 text-neutral-950 flex items-center justify-center font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* For Sales Staff */}
            <div className="bg-neutral-950/80 border border-neutral-800 hover:border-amber-500/40 rounded-xl p-5 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">For Sales Staff</h3>
                    <p className="text-[11px] text-neutral-400">Sales Team & Executives</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-neutral-800 text-neutral-300">Max 10</span>
              </div>
              <p className="text-xs text-neutral-400 mb-4">Exhibitor floor badges for your active sales team inside booth</p>
              <div className="flex items-center justify-between bg-neutral-900 border border-neutral-800 rounded-lg p-1.5">
                <button
                  type="button"
                  onClick={() => setSalesBadges(Math.max(0, salesBadges - 1))}
                  className="w-8 h-8 rounded bg-neutral-800 hover:bg-neutral-700 text-white flex items-center justify-center font-bold"
                >
                  -
                </button>
                <span className="text-base font-bold text-amber-400">{salesBadges}</span>
                <button
                  type="button"
                  onClick={() => setSalesBadges(Math.min(10, salesBadges + 1))}
                  className="w-8 h-8 rounded bg-amber-500 hover:bg-amber-400 text-neutral-950 flex items-center justify-center font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* For Support Staff */}
            <div className="bg-neutral-950/80 border border-neutral-800 hover:border-amber-500/40 rounded-xl p-5 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">For Support Staff</h3>
                    <p className="text-[11px] text-neutral-400">Setup & Technical Team</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-neutral-800 text-neutral-300">Max 10</span>
              </div>
              <p className="text-xs text-neutral-400 mb-4">Work passes for booth setup, technical maintenance & logistics staff</p>
              <div className="flex items-center justify-between bg-neutral-900 border border-neutral-800 rounded-lg p-1.5">
                <button
                  type="button"
                  onClick={() => setSupportBadges(Math.max(0, supportBadges - 1))}
                  className="w-8 h-8 rounded bg-neutral-800 hover:bg-neutral-700 text-white flex items-center justify-center font-bold"
                >
                  -
                </button>
                <span className="text-base font-bold text-amber-400">{supportBadges}</span>
                <button
                  type="button"
                  onClick={() => setSupportBadges(Math.min(10, supportBadges + 1))}
                  className="w-8 h-8 rounded bg-amber-500 hover:bg-amber-400 text-neutral-950 flex items-center justify-center font-bold"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Extras Catalog Store */}
        <section className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 lg:p-8 md:backdrop-blur-sm shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">3. Additional Requirements & Extras</h2>
                <p className="text-xs text-neutral-400">Select extra furniture, models, lighting, and props needed for your booth</p>
              </div>
            </div>

            {totalSelectedItemsCount > 0 && (
              <span className="self-start sm:self-center px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                {totalSelectedItemsCount} Extra Item(s) Selected
              </span>
            )}
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none border-b border-neutral-800">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-neutral-100 text-neutral-950 font-bold shadow-md'
                    : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((p) => {
              const qty = quantities[p.id] || 0;
              return (
                <div
                  key={p.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                    qty > 0
                      ? 'bg-neutral-900 border-amber-500/50 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/30'
                      : 'bg-neutral-950/80 border-neutral-800/80 hover:border-neutral-700'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 bg-neutral-800 text-neutral-300 rounded-md">
                        {p.category}
                      </span>
                      <span className="text-xs text-neutral-400 font-mono">
                        Per {p.unit}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white mb-1">{p.name}</h3>
                    <p className="text-xs text-neutral-400 mb-4">{p.description}</p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-neutral-800/60">
                    <span className="text-xs font-medium text-neutral-400">
                      Quantity:
                    </span>
                    <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 rounded-lg p-1">
                      <button
                        type="button"
                        onClick={() => updateQuantity(p.id, -1)}
                        className="w-7 h-7 rounded-md bg-neutral-900 hover:bg-neutral-800 flex items-center justify-center text-neutral-300 transition-colors active:scale-95"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-bold text-white font-mono">
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(p.id, 1)}
                        className="w-7 h-7 rounded-md bg-amber-500 hover:bg-amber-400 flex items-center justify-center text-neutral-950 font-bold transition-colors active:scale-95"
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
          <div className="mt-8 pt-6 border-t border-neutral-800">
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-2">
              Special Requests or Custom Requirements
            </label>
            <textarea
              rows={3}
              placeholder="Mention any specific color preferences, dimensions, positioning notes, or unlisted extras you need..."
              value={specialNotes}
              onChange={(e) => setSpecialNotes(e.target.value)}
              className="w-full p-3.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
            />
          </div>

          {/* Save Extras Submission */}
          {extrasSuccessMsg && (
            <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              {extrasSuccessMsg}
            </div>
          )}

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-neutral-400 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>
                {lastSubmittedAt ? `Last submitted at ${lastSubmittedAt}` : 'No extra items submitted yet'}
              </span>
            </div>

            <button
              onClick={handleSaveExtras}
              disabled={extrasSaving}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 font-bold rounded-xl text-xs uppercase tracking-wider shadow-xl shadow-amber-500/10 transition-all active:scale-95 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{extrasSaving ? 'Submitting...' : 'Submit Extra Requirements'}</span>
            </button>
          </div>
        </section>

        {/* Section 3: Summary of Submitted Requirements */}
        <section className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-neutral-800 text-neutral-300">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-white">Submitted Summary Overview</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800">
              <span className="text-xs text-neutral-400 font-semibold uppercase">Brand Name</span>
              <p className="text-base font-bold text-white mt-1">{brandName || 'Not saved yet'}</p>
            </div>

            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800">
              <span className="text-xs text-neutral-400 font-semibold uppercase">Stall Size</span>
              <p className="text-base font-bold text-amber-400 mt-1">
                {selectedSqftOption === 'Other'
                  ? customSqft ? `${customSqft} sq ft` : 'Custom (Other)'
                  : `${selectedSqftOption} sq ft`}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800">
              <span className="text-xs text-neutral-400 font-semibold uppercase">Total Requested Extras</span>
              <p className="text-base font-bold text-emerald-400 mt-1">{totalSelectedItemsCount} item(s)</p>
            </div>
          </div>

          {totalSelectedItemsCount > 0 && (
            <div className="bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden">
              <div className="px-4 py-3 bg-neutral-900 border-b border-neutral-800 text-xs font-semibold text-neutral-300 uppercase tracking-wider flex justify-between">
                <span>Selected Item</span>
                <span>Quantity</span>
              </div>
              <div className="divide-y divide-neutral-900">
                {products
                  .filter((p) => (quantities[p.id] || 0) > 0)
                  .map((p) => (
                    <div key={p.id} className="px-4 py-3 text-xs flex justify-between items-center text-neutral-300">
                      <div>
                        <span className="font-semibold text-white">{p.name}</span>
                        <span className="text-neutral-500 ml-2">({p.category})</span>
                      </div>
                      <span className="font-mono font-bold text-amber-400">
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
      <div className="fixed bottom-0 inset-x-0 z-40 bg-neutral-900/95 md:backdrop-blur-sm border-t border-amber-500/30 p-4 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
            <div className="text-xs">
              <span className="text-white font-bold block sm:inline">
                {brandName ? brandName : 'Stall Profile'}: {selectedSqftOption === 'Other' ? (customSqft ? `${customSqft} sq ft` : 'Custom') : `${selectedSqftOption} sq ft`}
              </span>
              <span className="text-neutral-400 sm:ml-2">
                ({totalSelectedItemsCount} extra item{totalSelectedItemsCount === 1 ? '' : 's'}, {ownerBadges + salesBadges + supportBadges} badge{ownerBadges + salesBadges + supportBadges === 1 ? '' : 's'})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleSaveProfile}
              disabled={profileSaving}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold rounded-xl text-xs border border-neutral-700 transition-all disabled:opacity-50"
            >
              {profileSaving ? 'Saving...' : '1. Save Details'}
            </button>

            <button
              onClick={handleSaveExtras}
              disabled={extrasSaving}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 font-bold rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all transform active:scale-95 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{extrasSaving ? 'Submitting...' : '2. Submit All Requirements'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
