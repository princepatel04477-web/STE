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
  Contact,
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
      <main className="max-w-7xl mx-auto px-4 lg:px-8 pt-8 space-y-8">

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
            <div className="bg-slate-50 border border-slate-200 hover:border-amber-400 rounded-xl p-5 transition-all shadow-xs">
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
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200 text-slate-700">Max 2</span>
              </div>
              <p className="text-xs text-slate-600 mb-4">Official VIP exhibitor badge with full access to hall & VIP lounge</p>
              <div className="flex items-center justify-between bg-white border border-slate-300 rounded-lg p-1.5">
                <button
                  type="button"
                  onClick={() => setOwnerBadges(Math.max(0, ownerBadges - 1))}
                  className="w-8 h-8 rounded bg-slate-100 hover:bg-slate-200 text-slate-900 flex items-center justify-center font-bold border border-slate-200"
                >
                  -
                </button>
                <span className="text-base font-extrabold text-amber-700">{ownerBadges}</span>
                <button
                  type="button"
                  onClick={() => setOwnerBadges(Math.min(2, ownerBadges + 1))}
                  className="w-8 h-8 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center font-extrabold shadow-sm"
                >
                  +
                </button>
              </div>
            </div>

            {/* For Sales Staff */}
            <div className="bg-slate-50 border border-slate-200 hover:border-amber-400 rounded-xl p-5 transition-all shadow-xs">
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
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200 text-slate-700">Max 10</span>
              </div>
              <p className="text-xs text-slate-600 mb-4">Exhibitor floor badges for your active sales team inside booth</p>
              <div className="flex items-center justify-between bg-white border border-slate-300 rounded-lg p-1.5">
                <button
                  type="button"
                  onClick={() => setSalesBadges(Math.max(0, salesBadges - 1))}
                  className="w-8 h-8 rounded bg-slate-100 hover:bg-slate-200 text-slate-900 flex items-center justify-center font-bold border border-slate-200"
                >
                  -
                </button>
                <span className="text-base font-extrabold text-amber-700">{salesBadges}</span>
                <button
                  type="button"
                  onClick={() => setSalesBadges(Math.min(10, salesBadges + 1))}
                  className="w-8 h-8 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center font-extrabold shadow-sm"
                >
                  +
                </button>
              </div>
            </div>

            {/* For Support Staff */}
            <div className="bg-slate-50 border border-slate-200 hover:border-amber-400 rounded-xl p-5 transition-all shadow-xs">
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
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200 text-slate-700">Max 10</span>
              </div>
              <p className="text-xs text-slate-600 mb-4">Work passes for booth setup, technical maintenance & logistics staff</p>
              <div className="flex items-center justify-between bg-white border border-slate-300 rounded-lg p-1.5">
                <button
                  type="button"
                  onClick={() => setSupportBadges(Math.max(0, supportBadges - 1))}
                  className="w-8 h-8 rounded bg-slate-100 hover:bg-slate-200 text-slate-900 flex items-center justify-center font-bold border border-slate-200"
                >
                  -
                </button>
                <span className="text-base font-extrabold text-amber-700">{supportBadges}</span>
                <button
                  type="button"
                  onClick={() => setSupportBadges(Math.min(10, supportBadges + 1))}
                  className="w-8 h-8 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center font-extrabold shadow-sm"
                >
                  +
                </button>
              </div>
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

          {/* Product Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((p) => {
              const qty = quantities[p.id] || 0;
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
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 bg-slate-200 text-slate-700 rounded-md">
                        {p.category}
                      </span>
                      {p.rate_inr ? (
                        <span className="text-xs font-mono font-bold text-amber-700">
                          ₹{p.rate_inr.toLocaleString('en-IN')} / day
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500 font-mono">
                          Per {p.unit}
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mb-1">{p.name}</h3>
                    <p className="text-xs text-slate-600 mb-4">{p.description}</p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-200">
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
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-slate-200 text-slate-700">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Submitted Summary Overview</h3>
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
    </div>
  );
}
