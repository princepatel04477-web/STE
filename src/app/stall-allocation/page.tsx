'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Phone,
  Lock,
  User,
  Building2,
  Trophy,
  Sparkles,
  LogOut,
  MapPin,
  Compass,
  FileText,
  Printer,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Store,
  Layers,
  HelpCircle,
  X
} from 'lucide-react';
import LuckyBox from '@/components/lottery/LuckyBox';
import AllotmentSlipModal from '@/components/lottery/AllotmentSlipModal';
import FloorPlan2026 from '@/components/stallmap/FloorPlan2026';
import { findExhibitorByMobile } from '@/data/registeredExhibitors';
import { isAdminMobile } from '@/lib/adminMobiles';
import { normalizeExhibitorId } from '@/lib/exhibitorId';
import { LotteryAllocationRecord } from '@/lib/db';

const TEST_EXHIBITOR_PRESETS = [
  { label: '100 sqft', mobile: '9274669399', brand: 'Aashirwad Creation', sqft: '100 sq ft', corner: false },
  { label: '200 sqft', mobile: '9824886668', brand: 'Aalingan Art', sqft: '200 sq ft', corner: false },
  { label: '300 sqft', mobile: '9586921213', brand: 'Janani Designer', sqft: '300 sq ft', corner: false },
  { label: '400 sqft', mobile: '9979940730', brand: 'Abhaar Vastram', sqft: '400 sq ft', corner: false },
  { label: '600 sqft (L-Corner)', mobile: '9879861191', brand: 'Akashleela (Ramaan)', sqft: '600 sq ft', corner: true },
  { label: '800 sqft (L-Corner)', mobile: '6353582439', brand: 'Suparshav', sqft: '800 sq ft', corner: true },
  { label: '1000 sqft (Grand)', mobile: '9727256154', brand: 'Indian Women', sqft: '1000 sq ft', corner: true }
];

export default function StallAllocationPage() {
  const router = useRouter();

  // Authentication States
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobile, setMobile] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Active Tab: 'profile' | 'luckybox' | 'sitemap'
  const [activeTab, setActiveTab] = useState<'profile' | 'luckybox' | 'sitemap'>('profile');

  // Exhibitor Profile Data
  const [brandName, setBrandName] = useState('');
  const [contactName, setContactName] = useState('');
  const [categorySqft, setCategorySqft] = useState('200 sq ft');
  const [market, setMarket] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  // Lottery Allocation State
  const [hasDrawn, setHasDrawn] = useState(false);
  const [allocation, setAllocation] = useState<LotteryAllocationRecord | null>(null);
  const [showSlipModal, setShowSlipModal] = useState(false);

  const handleSelectPreset = (preset: typeof TEST_EXHIBITOR_PRESETS[0]) => {
    setMobile(preset.mobile);
  };

  // Check initial session
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const res = await fetch('/api/lottery/status');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.mobile) {
          setMobile(data.mobile);
          setBrandName(data.brandName || '');
          setContactName(data.brandName || 'STE Exhibitor');
          setCategorySqft(data.rawSqft || data.categorySqft || '200 sq ft');
          setMarket(data.market || '');
          setHasDrawn(data.hasDrawn);
          setAllocation(data.allocation);
          setIsLoggedIn(true);
        }
      }
    } catch (e) {
      console.error('Session check error:', e);
    }
  };

  /**
   * Read back the stall the database holds for this number.
   *
   * The draw already returns the allotment, but reading it back is what proves
   * it was written rather than merely drawn - the exhibitor sees the number
   * the database will still be showing tomorrow, not one that quietly failed
   * to save and left them looking at "Not assigned" a minute later.
   */
  const refreshAllocation = async (forMobile: string) => {
    try {
      const res = await fetch(`/api/lottery/status?mobile=${encodeURIComponent(forMobile)}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && data.allocation?.stall_number) {
        setAllocation(data.allocation);
        setHasDrawn(true);
      }
    } catch (e) {
      console.error('Allotment re-check error:', e);
    }
  };

  // An exhibitor who already holds a stall has nothing left to draw, so the
  // Lucky Box is closed to them and the floor plan takes its place.
  const hasStall = Boolean(allocation?.stall_number);

  // The tab actually shown: an exhibitor holding a stall never lands on the
  // draw, however they got there.
  const tab = hasStall && activeTab === 'luckybox' ? 'sitemap' : activeTab;

  // A few firms are registered under a short user ID rather than a number;
  // the +91 prefix only belongs on the numeric case.
  const isNumericEntry = mobile.trim() === '' || /^[0-9+\-\s()]+$/.test(mobile.trim());

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    const clean = normalizeExhibitorId(mobile);
    if (!clean) {
      setAuthError('Enter your registered 10-digit mobile number, or the user ID on your invoice.');
      return;
    }

    setAuthLoading(true);
    try {
      const registered = findExhibitorByMobile(clean);
      const res = await fetch(`/api/lottery/status?mobile=${clean}`);
      const data = await res.json();

      if (data.success) {
        // The draw posts this value, so keep the normalised form rather than
        // whatever spacing or +91 prefix was typed in.
        setMobile(data.mobile || clean);
        setBrandName(data.brandName || registered?.brandName || 'STE Exhibitor');
        setContactName(data.brandName || registered?.brandName || 'Exhibitor Contact');
        setCategorySqft(data.rawSqft || registered?.stallSqft || '200 sq ft');
        setMarket(data.market || registered?.market || '');
        setHasDrawn(data.hasDrawn);
        setAllocation(data.allocation);
        setIsLoggedIn(true);
      } else {
        setAuthError(data.error || 'That number is not on the exhibitor list. Please check it and try again.');
      }
    } catch (err) {
      setAuthError('Network error during login.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileSuccessMsg('');

    try {
      const res = await fetch('/api/exhibitor/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand_name: brandName,
          stall_sqft: categorySqft
        })
      });

      if (res.ok) {
        setProfileSuccessMsg('Profile updated successfully!');
        setTimeout(() => setProfileSuccessMsg(''), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProfileSaving(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    setIsLoggedIn(false);
    setAllocation(null);
    setHasDrawn(false);
  };

  const handleDrawComplete = (newAllocation: LotteryAllocationRecord) => {
    setAllocation(newAllocation);
    setHasDrawn(true);
    // One stall, drawn once: confirm it is the one on record before the
    // exhibitor walks away with the number.
    void refreshAllocation(normalizeExhibitorId(mobile) || mobile);
  };

  const isCornerEligible = parseInt(categorySqft.replace(/\D/g, ''), 10) >= 600;

  return (
    <div className="min-h-screen bg-[#0A0D14] text-slate-100 flex flex-col selection:bg-amber-500 selection:text-black">
      
      {/* Top Header Bar (Matching Video) */}
      <header className="w-full bg-[#05070B]/90 backdrop-blur-md border-b border-amber-500/20 py-3.5 px-4 sm:px-8 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Brand Logo & Event Tag */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-14 h-9">
              <Image
                src="/assets/logo_STE.webp"
                alt="STE Logo"
                fill
                className="object-contain transition-transform group-hover:scale-105"
              />
            </div>
            <div className="h-5 w-px bg-white/20" />
            <div className="flex flex-col">
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">SURAT TEXTILE</span>
              <span className="text-xs font-display font-black text-amber-400 tracking-wider">LUCKY DRAW PORTAL</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs uppercase tracking-wider font-semibold">
            <Link href="/" className="text-slate-400 hover:text-white transition-colors">Home</Link>
            <Link href="/exhibitor/dashboard" className="text-slate-400 hover:text-white transition-colors">Exhibitor&apos;s Panel</Link>
            <Link href="/stall-allocation" className="text-amber-400 font-bold border-b-2 border-amber-400 pb-0.5">
              Stall Allocation
            </Link>
          </nav>

          {/* Right Action */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 text-xs font-bold border border-white/15 flex items-center gap-1.5 transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            ) : null}
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 flex flex-col items-center justify-center">
        
        {!isLoggedIn ? (
          /* ========================================================================= */
          /* 1. AUTHENTICATION / LOGIN VIEW (Matching Video Exactly)                    */
          /* ========================================================================= */
          <div className="w-full max-w-lg my-8 space-y-6 animate-in fade-in zoom-in-95 duration-500">
            
            {/* Test Mode / Sandbox Bar */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center">
              <div className="flex items-center justify-center gap-2 text-amber-400 text-xs font-black uppercase tracking-wider mb-2">
                <Sparkles className="w-4 h-4" />
                <span>🧪 Testing / Sandbox Mode (Safe Simulation)</span>
              </div>
              <p className="text-[11px] text-slate-400 mb-3">
                Click any registered stall category preset below to simulate instant test login:
              </p>
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                {TEST_EXHIBITOR_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => handleSelectPreset(p)}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-slate-300 text-[10px] font-bold border border-white/10 transition-colors"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-slate-900/90 via-slate-900/80 to-slate-950 border border-amber-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.7)] backdrop-blur-xl relative overflow-hidden">
              
              {/* Header */}
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto mb-3 text-amber-400">
                  <Trophy className="w-6 h-6" />
                </div>
                <h1 className="text-xl sm:text-2xl font-display font-black text-white">
                  Stall Allocation Login
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Enter your registered mobile number to open the Lucky Draw.
                </p>
              </div>

              {authError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold text-center">
                  {authError}
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-4">

                {/* Mobile Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Registered Mobile Number / User ID
                  </label>
                  <div className="relative">
                    {isNumericEntry && (
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-xs">
                        +91
                      </div>
                    )}
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="10-digit number or user ID"
                      className={`w-full ${isNumericEntry ? 'pl-12' : 'pl-4'} pr-4 py-3 rounded-xl bg-slate-950/80 border border-white/15 text-white placeholder-slate-500 text-base sm:text-sm font-semibold focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors`}
                      required
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    The number or user ID on your STE booking. No code is sent.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-amber-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {authLoading ? (
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-slate-950" />
                      <span>Enter Lucky Draw</span>
                    </>
                  )}
                </button>

              </form>


            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* 2. EXHIBITOR LOTTERY DASHBOARD (Sidebar + Multi-tab Experience)            */
          /* ========================================================================= */
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 my-4">
            
            {/* Left Sidebar */}
            <aside className="lg:col-span-4 xl:col-span-3 space-y-4">
              
              {/* Exhibitor Identity Card */}
              <div className="p-5 rounded-3xl bg-slate-900/90 border border-white/10 shadow-xl flex flex-col items-center text-center relative overflow-hidden">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-display font-black text-2xl flex items-center justify-center shadow-lg border-2 border-emerald-300/30 mb-3">
                  {brandName ? brandName.charAt(0).toUpperCase() : 'S'}
                </div>
                <h3 className="font-bold text-white text-base leading-tight truncate w-full">{brandName}</h3>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full mt-1 border border-emerald-500/30">
                  EXHIBITOR
                </span>
                <p className="text-xs text-slate-400 font-mono mt-1">+91 {mobile}</p>
              </div>

              {/* Navigation Menu */}
              <div className="p-2 rounded-2xl bg-slate-900/90 border border-white/10 space-y-1">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full px-4 py-3 rounded-xl font-bold text-xs flex items-center justify-between transition-all ${
                    tab === 'profile'
                      ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                      : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </div>
                  <span className="text-[10px] opacity-70">Details</span>
                </button>

                {hasStall ? (
                  <button
                    onClick={() => setActiveTab('sitemap')}
                    className={`w-full px-4 py-3 rounded-xl font-bold text-xs flex items-center justify-between transition-all ${
                      tab === 'sitemap'
                        ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                        : 'text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <MapPin className="w-4 h-4 text-emerald-400" />
                      <span>My Stall</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-slate-950 text-emerald-300 font-mono text-[10px]">
                      {allocation?.stall_number}
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveTab('luckybox')}
                    className={`w-full px-4 py-3 rounded-xl font-bold text-xs flex items-center justify-between transition-all ${
                      tab === 'luckybox'
                        ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                        : 'text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Lucky Box</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] animate-pulse">
                      Ready
                    </span>
                  </button>
                )}

                <button
                  onClick={() => setActiveTab('sitemap')}
                  className={`w-full px-4 py-3 rounded-xl font-bold text-xs flex items-center justify-between transition-all ${
                    tab === 'sitemap'
                      ? 'bg-blue-500 text-white shadow-md font-extrabold'
                      : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Compass className="w-4 h-4" />
                    <span>Floor Plan / Map</span>
                  </div>
                  <span className="text-[10px] opacity-70">SIECC</span>
                </button>

                {/* Only the two event administrators ever see this. */}
                {isAdminMobile(mobile) && (
                  <Link
                    href="/admin/lottery"
                    className="w-full px-4 py-3 rounded-xl font-bold text-xs flex items-center gap-2.5 text-amber-400 hover:bg-amber-500/10 transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Admin Control Room</span>
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 rounded-xl font-bold text-xs flex items-center gap-2.5 text-rose-400 hover:bg-rose-500/10 transition-colors pt-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>

              {/* Allocation Summary Card if already drawn */}
              {allocation && (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/15 to-emerald-500/15 border border-amber-500/30 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-amber-400">Allotted Booth</span>
                    <span className="font-mono font-black text-white text-sm">{allocation.stall_number}</span>
                  </div>
                  <p className="text-[11px] text-slate-300">{allocation.hall} • {allocation.zone}</p>
                  <button
                    onClick={() => setShowSlipModal(true)}
                    className="w-full py-2 px-3 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors mt-1"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>View Allotment Slip</span>
                  </button>
                </div>
              )}

            </aside>

            {/* Right Main Tab Display */}
            <section className="lg:col-span-8 xl:col-span-9">
              
              {/* Tab 1: Profile View (Matching Video) */}
              {tab === 'profile' && (
                <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-white/10 shadow-xl relative animate-in fade-in">
                  
                  <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-white">My Profile</h2>
                      <p className="text-xs text-slate-400">Review your registered details and allocated booth status.</p>
                    </div>

                    <div className="px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-extrabold text-xs tracking-wider">
                      {categorySqft} {isCornerEligible ? '• Corner Priority' : ''}
                    </div>
                  </div>

                  {profileSuccessMsg && (
                    <div className="mb-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500 text-emerald-300 text-xs font-bold text-center">
                      {profileSuccessMsg}
                    </div>
                  )}

                  <form onSubmit={handleSaveProfile} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* Name */}
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                          Name / Contact Person
                        </label>
                        <input
                          type="text"
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-white text-sm font-semibold focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      {/* Company Name */}
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                          Company / Brand Name
                        </label>
                        <input
                          type="text"
                          value={brandName}
                          onChange={(e) => setBrandName(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-white text-sm font-semibold focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      {/* Registered mobile */}
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                          Registered Mobile
                        </label>
                        <input
                          type="text"
                          value={`+91 ${mobile}`}
                          disabled
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950/50 border border-white/5 text-slate-400 text-sm font-mono cursor-not-allowed"
                        />
                      </div>

                      {/* Lucky Number */}
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                          Lucky Number / Stall No.
                        </label>
                        <div className={`w-full px-4 py-2.5 rounded-xl border text-sm font-bold flex items-center justify-between ${
                          allocation
                            ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-mono text-base'
                            : 'bg-slate-950/50 border-white/5 text-slate-500'
                        }`}>
                          <span>{allocation ? allocation.stall_number : 'Not assigned'}</span>
                          {allocation?.is_corner === 1 && (
                            <span className="text-[10px] uppercase tracking-wider bg-amber-400 text-slate-950 px-2 py-0.5 rounded font-black">
                              L-Shape Corner
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Category */}
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                          Category (Stall Size)
                        </label>
                        <input
                          type="text"
                          value={categorySqft}
                          disabled
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950/50 border border-white/5 text-slate-300 text-sm font-semibold cursor-not-allowed"
                        />
                      </div>

                      {/* Market / Pavilion */}
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                          Market / Pavilion
                        </label>
                        <input
                          type="text"
                          value={market || 'Surat Main Pavilion'}
                          disabled
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950/50 border border-white/5 text-slate-300 text-sm font-semibold cursor-not-allowed"
                        />
                      </div>

                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={profileSaving}
                        className="py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider transition-all"
                      >
                        {profileSaving ? 'Saving...' : 'Save Profile'}
                      </button>

                      {!allocation ? (
                        <button
                          type="button"
                          onClick={() => setActiveTab('luckybox')}
                          className="py-3 px-6 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>Go to Lucky Box Draw</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowSlipModal(true)}
                          className="py-3 px-6 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider border border-white/20 flex items-center justify-center gap-2"
                        >
                          <Printer className="w-4 h-4 text-amber-400" />
                          <span>Download Allotment Certificate</span>
                        </button>
                      )}
                    </div>
                  </form>

                </div>
              )}

              {/* Tab 2: Lucky Box View (Matching Video Experience) */}
              {tab === 'luckybox' && !hasStall && (
                <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-white/10 shadow-xl animate-in fade-in">
                  <LuckyBox
                    categorySqft={categorySqft}
                    brandName={brandName}
                    mobile={mobile}
                    hasDrawn={hasDrawn}
                    allocation={allocation}
                    onDrawComplete={handleDrawComplete}
                    onOpenSlipModal={() => setShowSlipModal(true)}
                    onViewSitemap={() => setActiveTab('sitemap')}
                  />
                </div>
              )}

              {/* Tab 3: Sitemap / Floor Plan View */}
              {tab === 'sitemap' && (
                <div className="animate-in fade-in space-y-4">
                  {hasStall && (
                    <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-500/15 via-slate-900/60 to-amber-500/15 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                          Your allotted stall
                        </span>
                        <div className="flex items-baseline gap-3 mt-1">
                          <span className="text-4xl font-display font-black text-white tabular-nums">
                            {allocation?.stall_number}
                          </span>
                          <span className="text-xs text-slate-300">
                            {allocation?.stall_sqft} &middot; {allocation?.dimensions}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          {allocation?.hall} &middot; {allocation?.zone} &middot; marked on the plan below
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowSlipModal(true)}
                        className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[11px] uppercase tracking-wider flex items-center gap-2 transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Allotment slip</span>
                      </button>
                    </div>
                  )}
                  <FloorPlan2026
                    selectedUnitId={allocation?.stall_number || null}
                  />
                </div>
              )}

            </section>

          </div>
        )}

      </main>

      {/* Official Allotment Slip Modal */}
      <AllotmentSlipModal
        isOpen={showSlipModal}
        onClose={() => setShowSlipModal(false)}
        allocation={allocation}
      />

    </div>
  );
}
