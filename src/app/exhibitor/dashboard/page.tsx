'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  AlertTriangle,
  AlertCircle,
  Package,
  Gift,
  Check,
  X,
  FileText,
  Store,
  Calendar,
  ArrowRight,
  Upload,
  ExternalLink,
  FileCode,
  Image as ImageIcon,
  User,
  Camera,
  Trash2,
  Edit3,
  Loader2,
  MoreVertical,
  Search
} from 'lucide-react';

const STRICT_CUTOFF_DATE = '5th September 2026, 12:00 PM';

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
  days?: number;
  rate_inr?: number;
}

const SQFT_PRESETS = ['100', '200', '300', '400', '600', '800', '1000', '1200', '2000', '2600'];

export default function ExhibitorDashboardPage() {
  const router = useRouter();

  // Profile State
  const [mobile, setMobile] = useState('');
  const [exhibitorName, setExhibitorName] = useState('');
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);
  const [companyDescription, setCompanyDescription] = useState('');
  const [brandName, setBrandName] = useState('');
  const [category, setCategory] = useState('');
  const [market, setMarket] = useState('');
  const [selectedSqftOption, setSelectedSqftOption] = useState<string>('200');
  const [customSqft, setCustomSqft] = useState<string>('');
  const [fasciaNames, setFasciaNames] = useState<string[]>(['', '']);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [profileError, setProfileError] = useState('');

  // Profile Picture Upload State
  const [uploadingProfilePic, setUploadingProfilePic] = useState(false);
  const [profilePicSuccess, setProfilePicSuccess] = useState('');
  const [profilePicError, setProfilePicError] = useState('');
  const profilePicInputRef = useRef<HTMLInputElement | null>(null);
  const exhibitorNameRef = useRef<HTMLInputElement | null>(null);

  const handleAddFasciaName = () => {
    if (fasciaNames.length < 4) {
      setFasciaNames((prev) => [...prev, '']);
    }
  };

  const handleRemoveFasciaName = (indexToRemove: number) => {
    if (fasciaNames.length > 2) {
      setFasciaNames((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    } else {
      setFasciaNames((prev) => {
        const copy = [...prev];
        copy[indexToRemove] = '';
        return copy;
      });
    }
  };

  const handleFasciaNameChange = (index: number, val: string) => {
    setFasciaNames((prev) => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };

  // Extras Catalog State
  const [products, setProducts] = useState<Product[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [itemDays, setItemDays] = useState<Record<string, number>>({}); // per-item rental duration in days (default 2)
  const [specialNotes, setSpecialNotes] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [extrasSaving, setExtrasSaving] = useState(false);
  const [extrasSuccessMsg, setExtrasSuccessMsg] = useState('');
  const [lastSubmittedAt, setLastSubmittedAt] = useState<string | null>(null);
  const [showBillModal, setShowBillModal] = useState(false);

  // Mobile navigation, search & UI State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [isDisclaimerDismissed, setIsDisclaimerDismissed] = useState(false);
  const [expandedMobileCards, setExpandedMobileCards] = useState<Record<string, boolean>>({});

  const toggleMobileCard = (id: string) => {
    setExpandedMobileCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Exhibitor Entry Badges State (Owner, Sales Staff, Support Staff & Names)
  const [ownerBadges, setOwnerBadges] = useState<number>(1);
  const [salesBadges, setSalesBadges] = useState<number>(0);
  const [supportBadges, setSupportBadges] = useState<number>(0);
  const [ownerBadgeNames, setOwnerBadgeNames] = useState<string[]>(['']);
  const [salesBadgeNames, setSalesBadgeNames] = useState<string[]>([]);
  const [supportBadgeNames, setSupportBadgeNames] = useState<string[]>([]);
  const [badgeErrors, setBadgeErrors] = useState<string[]>([]);
  const [nameError, setNameError] = useState('');
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  // Brand Logo & Vector Artwork (CDR) Upload State
  const [logoFileUrl, setLogoFileUrl] = useState<string | null>(null);
  const [cdrFileUrl, setCdrFileUrl] = useState<string | null>(null);
  const [driveFileUrl, setDriveFileUrl] = useState<string | null>(null);
  const [driveFolderUrl, setDriveFolderUrl] = useState<string | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState('');
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // General Loading & Auth check
  const [initialLoading, setInitialLoading] = useState(true);
  const [autosaveStatus, setAutosaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const autosaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = useRef(false);

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
    if (badgeErrors.length > 0) setBadgeErrors([]);
  };

  const handleSalesBadgesChange = (count: number) => {
    const val = Math.min(5, Math.max(0, count));
    setSalesBadges(val);
    setSalesBadgeNames((prev) => {
      const copy = [...prev];
      while (copy.length < val) copy.push('');
      return copy.slice(0, val);
    });
    if (badgeErrors.length > 0) setBadgeErrors([]);
  };

  const handleSupportBadgesChange = (count: number) => {
    const val = Math.min(5, Math.max(0, count));
    setSupportBadges(val);
    setSupportBadgeNames((prev) => {
      const copy = [...prev];
      while (copy.length < val) copy.push('');
      return copy.slice(0, val);
    });
    if (badgeErrors.length > 0) setBadgeErrors([]);
  };

  const validateBadgeNames = (): string[] => {
    return [];
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
      setExhibitorName(profData.exhibitor_name || '');
      setProfilePicUrl(profData.profile_pic_url || null);
      setCompanyDescription(profData.company_description || '');
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
        const loaded = profData.fascia_names.map((n: any) => String(n || ''));
        if (loaded[3]?.trim()) {
          setFasciaNames([loaded[0] || '', loaded[1] || '', loaded[2] || '', loaded[3] || '']);
        } else if (loaded[2]?.trim()) {
          setFasciaNames([loaded[0] || '', loaded[1] || '', loaded[2] || '']);
        } else {
          setFasciaNames([loaded[0] || '', loaded[1] || '']);
        }
      } else if (profData.brand_name) {
        setFasciaNames([profData.brand_name, '']);
      } else {
        setFasciaNames(['', '']);
      }

      setLogoFileUrl(profData.logo_file_url || null);
      setCdrFileUrl(profData.cdr_file_url || null);
      setDriveFileUrl(profData.drive_file_url || null);
      setDriveFolderUrl(profData.drive_folder_url || null);

      // 2. Fetch Extras Catalog & existing order
      const catRes = await fetch('/api/exhibitor/extras');
      const catData = await catRes.json();

      if (catData.products) {
        setProducts(catData.products);
      }

      if (catData.existingOrder) {
        const qMap: Record<string, number> = {};
        const dMap: Record<string, number> = {};
        if (Array.isArray(catData.existingOrder.items)) {
          catData.existingOrder.items.forEach((item: any) => {
            if (item.id) {
              if (item.quantity > 0) {
                qMap[item.id] = item.quantity;
              }
              dMap[item.id] = Number(item.days) || 2;
            }
          });
        }
        setQuantities(qMap);
        setItemDays(dMap);
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
      setTimeout(() => {
        isInitializedRef.current = true;
      }, 600);
    }
  };

  // Debounced cloud autosave on change across all profile and order requirements
  useEffect(() => {
    if (!isInitializedRef.current || initialLoading) return;

    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
    }

    autosaveTimeoutRef.current = setTimeout(async () => {
      setAutosaveStatus('saving');
      try {
        const finalSqft =
          selectedSqftOption === 'Other'
            ? customSqft.trim()
              ? `Other: ${customSqft.trim()}`
              : 'Other'
            : selectedSqftOption;

        const profPromise = fetch('/api/exhibitor/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            exhibitor_name: exhibitorName.trim(),
            company_description: companyDescription.trim(),
            brand_name: brandName,
            stall_sqft: finalSqft,
            fascia_names: fasciaNames
          })
        });

        const selectedItems: OrderItem[] = products
          .filter((p) => (quantities[p.id] || 0) > 0)
          .map((p) => ({
            id: p.id,
            name: p.name,
            category: p.category,
            unit: p.unit,
            rate_inr: p.rate_inr || 0,
            quantity: quantities[p.id],
            days: itemDays[p.id] || 2
          }));

        // The order write is rejected without a name, so hold it back rather
        // than flashing a save error at someone still filling the form in.
        const extrasPromise = !exhibitorName.trim()
          ? Promise.resolve(new Response(null, { status: 204 }))
          : fetch('/api/exhibitor/extras', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            exhibitor_name: exhibitorName.trim(),
            items: selectedItems,
            special_notes: specialNotes,
            owner_badges: ownerBadges,
            sales_badges: salesBadges,
            support_badges: supportBadges,
            badge_names: {
              owner: ownerBadgeNames,
              sales: salesBadgeNames,
              support: supportBadgeNames
            },
            rental_days: 2
          })
        });

        const [profRes, extrasRes] = await Promise.all([profPromise, extrasPromise]);
        if (profRes.ok && extrasRes.ok) {
          setAutosaveStatus('saved');
          setTimeout(() => {
            setAutosaveStatus((prev) => (prev === 'saved' ? 'idle' : prev));
          }, 3500);
        } else {
          setAutosaveStatus('error');
        }
      } catch (err) {
        console.error('Autosave sync exception:', err);
        setAutosaveStatus('error');
      }
    }, 1200);

    return () => {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }
    };
  }, [
    exhibitorName,
    companyDescription,
    brandName,
    selectedSqftOption,
    customSqft,
    fasciaNames,
    quantities,
    itemDays,
    specialNotes,
    ownerBadges,
    salesBadges,
    supportBadges,
    ownerBadgeNames,
    salesBadgeNames,
    supportBadgeNames,
    initialLoading
  ]);

  const handleProfilePicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProfilePicError('');
    setProfilePicSuccess('');
    setUploadingProfilePic(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'profile_pic');

      const res = await fetch('/api/exhibitor/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload profile picture.');
      }

      if (data.profilePicUrl || data.fileUrl) {
        setProfilePicUrl(data.profilePicUrl || data.fileUrl);
      }
      setProfilePicSuccess('Profile picture updated successfully!');
      setTimeout(() => setProfilePicSuccess(''), 4000);
    } catch (err: any) {
      setProfilePicError(err.message || 'Failed to upload profile picture.');
    } finally {
      setUploadingProfilePic(false);
      if (profilePicInputRef.current) profilePicInputRef.current.value = '';
    }
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>,
    directFile?: File
  ) => {
    let file: File | null = null;
    if (directFile) {
      file = directFile;
    } else if ('dataTransfer' in e && e.dataTransfer.files?.[0]) {
      file = e.dataTransfer.files[0];
    } else if ('target' in e && (e.target as HTMLInputElement).files?.[0]) {
      file = (e.target as HTMLInputElement).files![0];
    }

    if (!file) return;

    setUploadError('');
    setUploadSuccessMsg('');
    setUploadingFile(true);
    setUploadProgress(25);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const ext = file.name.split('.').pop()?.toLowerCase();
      const isCdr = ext === 'cdr';
      formData.append('category', isCdr ? 'cdr' : 'logo');

      setUploadProgress(55);

      const res = await fetch('/api/exhibitor/upload', {
        method: 'POST',
        body: formData,
      });

      setUploadProgress(85);

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload file');
      }

      if (data.logoUrl) setLogoFileUrl(data.logoUrl);
      if (data.cdrUrl) setCdrFileUrl(data.cdrUrl);
      if (data.profilePicUrl) setProfilePicUrl(data.profilePicUrl);
      if (data.driveFileUrl) setDriveFileUrl(data.driveFileUrl);
      if (data.driveFolderUrl) setDriveFolderUrl(data.driveFolderUrl);

      setUploadSuccessMsg(data.message || 'File uploaded successfully and synced to Google Drive!');
      setUploadProgress(100);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload file. Please try again.');
    } finally {
      setUploadingFile(false);
      setTimeout(() => setUploadProgress(0), 1500);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (companyDescription && companyDescription.length > 400) {
      setProfileError('Company description cannot exceed 400 characters.');
      return;
    }

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
          exhibitor_name: exhibitorName.trim(),
          company_description: companyDescription.trim(),
          brand_name: brandName,
          stall_sqft: finalSqft,
          fascia_names: fasciaNames
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setProfileError(data.error || 'Failed to save profile.');
      } else {
        setProfileSuccessMsg('Exhibitor profile, stall, and fascia details saved successfully!');
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

  const updateItemDays = (id: string, days: number) => {
    setItemDays((prev) => ({
      ...prev,
      [id]: Math.max(1, Math.min(30, days))
    }));
  };

  const handleSaveExtras = async () => {
    setHasAttemptedSubmit(true);
    setExtrasSuccessMsg('');

    // Nothing can be acted on at the venue without a name against the order.
    if (!exhibitorName.trim()) {
      setNameError('Enter your name before submitting your requirements.');
      const profile = document.getElementById('section-profile');
      if (profile) {
        profile.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      exhibitorNameRef.current?.focus({ preventScroll: true });
      return;
    }
    setNameError('');

    const errs = validateBadgeNames();
    if (errs.length > 0) {
      setBadgeErrors(errs);
      const section = document.getElementById('section-badges');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return;
    }
    setBadgeErrors([]);

    setExtrasSaving(true);

    const selectedItems: OrderItem[] = products
      .filter((p) => (quantities[p.id] || 0) > 0)
      .map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        unit: p.unit,
        rate_inr: p.rate_inr || 0,
        quantity: quantities[p.id],
        days: itemDays[p.id] || 2
      }));

    try {
      // Save profile and fascia simultaneously
      const finalSqft =
        selectedSqftOption === 'Other'
          ? customSqft.trim()
            ? `Other: ${customSqft.trim()}`
            : 'Other'
          : selectedSqftOption;

      await fetch('/api/exhibitor/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exhibitor_name: exhibitorName.trim(),
          company_description: companyDescription.trim(),
          brand_name: brandName,
          stall_sqft: finalSqft,
          fascia_names: fasciaNames
        })
      });

      const res = await fetch('/api/exhibitor/extras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exhibitor_name: exhibitorName.trim(),
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
        setExtrasSuccessMsg('Your requirements have been submitted successfully!');
        setLastSubmittedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        setTimeout(() => setExtrasSuccessMsg(''), 5000);
      } else {
        alert(data.error || 'Failed to submit requirements.');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to submit requirements. Please check your network connection.');
    } finally {
      setExtrasSaving(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/exhibitor/login');
  };

  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      !searchFilter.trim() ||
      p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.description.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.category.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 sm:w-10 sm:h-10 relative rounded-xl bg-slate-900 p-1 border border-slate-200 shadow-xs flex items-center justify-center shrink-0 group-hover:border-amber-400 transition-colors">
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
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight whitespace-nowrap">
                  Exhibitor Portal
                </h1>
                <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-1.5 sm:px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 shrink-0">
                  2026
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Surat Textile Expo — Exhibitor Extras & Requirements
              </p>
            </div>
          </Link>

          {/* Cloud Sync Status Indicator & Desktop Navigation */}
          <div className="flex items-center gap-2">
            {autosaveStatus === 'saving' && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold animate-pulse shadow-2xs">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                <span className="hidden sm:inline">Saving to Cloud...</span>
                <span className="sm:hidden">Saving...</span>
              </div>
            )}
            {autosaveStatus === 'saved' && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">Saved to Cloud</span>
                <span className="sm:hidden">Saved</span>
              </div>
            )}
            {autosaveStatus === 'error' && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold shadow-2xs">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                <span className="hidden sm:inline">Sync error</span>
                <span className="sm:hidden">Error</span>
              </div>
            )}

            <div className="hidden sm:flex items-center gap-2.5">
              <Link
                href="/stall-allocation"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Stall Lottery</span>
              </Link>
            {(mobile === '9106139666' || mobile === '9950787787') && (
              <a
                href="/admin/exhibitors"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-extrabold transition-all shadow-xs"
              >
                👑 Organizer Admin Console
              </a>
            )}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-700 font-medium">
              <Phone className="w-3.5 h-3.5 text-amber-600" />
              <span>User ID: <strong className="text-slate-900 font-bold">{mobile}</strong></span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all border border-slate-200 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

          {/* Mobile Kebab / Quick Actions */}
          <div className="flex sm:hidden items-center gap-2 relative">
            <Link
              href="/stall-allocation"
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-2xs"
            >
              <Sparkles className="w-3 h-3" />
              <span>Lottery</span>
            </Link>
            
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              aria-label="Toggle user menu"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* Mobile Dropdown Menu */}
            {mobileMenuOpen && (
              <div className="absolute right-0 top-11 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2 border-b border-slate-100 text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Logged In As</span>
                  <span className="font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3 text-amber-600" />
                    {mobile}
                  </span>
                </div>
                {(mobile === '9106139666' || mobile === '9950787787') && (
                  <a
                    href="/admin/exhibitors"
                    className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 transition-colors"
                  >
                    👑 Organizer Admin Console
                  </a>
                )}
                <Link
                  href="/stall-allocation"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Stall Lottery & Draw</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 pt-4 sm:pt-8 pb-36 sm:pb-32 space-y-6 sm:space-y-8">

        {/* Deadline Caution Banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border-2 border-amber-400/80 text-amber-950 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3 w-full sm:w-auto">
            <div className="p-2.5 rounded-xl bg-amber-500 text-slate-950 shadow-xs shrink-0 mt-0.5 sm:mt-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1 w-full">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                  CRITICAL DEADLINE NOTICE
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold bg-amber-500 text-slate-950 shrink-0">
                  Strict Cutoff
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 font-medium">
                Exhibitor stall details, entry badges, and extra requirements <strong className="text-red-700 font-black">CANNOT be edited or modified after {STRICT_CUTOFF_DATE}</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-amber-300 shadow-2xs text-xs font-mono font-bold text-amber-950 self-stretch sm:self-auto justify-center whitespace-nowrap shrink-0">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Cutoff: {STRICT_CUTOFF_DATE}</span>
          </div>
        </div>

        {/* Lucky Draw / Stall Allocation Banner */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-amber-500/40 rounded-2xl p-5 sm:p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg relative overflow-hidden">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-black uppercase tracking-wider mb-1">
                <span>Official Lucky Draw System Live</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white leading-snug">
                Participate in Stall Allocation & Lucky Draw
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Open your digital Lucky Box to claim your allocated booth on the SIECC floor plan.
              </p>
            </div>
          </div>

          <Link
            href="/stall-allocation"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>Open Lucky Box</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
          </Link>
        </div>

        {/* Section 1: Official Exhibitor Profile & Stall Allocation */}
        <section id="section-profile" className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 lg:p-8 relative overflow-hidden shadow-xs scroll-mt-20 sm:scroll-mt-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">1. Verified Exhibitor Profile & Stall Allocation</h2>
              <p className="text-xs text-slate-500">Official stall size, exhibitor identity, and company profile for STE 2026</p>
            </div>
          </div>

          {/* Top Profile Card: Avatar, Compulsory Exhibitor Name & Company Summary */}
          <div className="bg-gradient-to-br from-amber-50/70 via-slate-50 to-white border border-amber-200/80 rounded-2xl p-5 sm:p-6 mb-6 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {/* Profile Photo Avatar */}
              <div className="relative group shrink-0 self-center sm:self-auto">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-amber-400 bg-slate-100 shadow-md flex items-center justify-center relative">
                  {profilePicUrl ? (
                    <img
                      src={profilePicUrl}
                      alt={exhibitorName || 'Exhibitor Profile'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-tr from-amber-100 to-amber-50 text-amber-700">
                      <User className="w-10 h-10 mb-1 opacity-70" />
                      <span className="text-[10px] font-black uppercase tracking-tight">Add Photo</span>
                    </div>
                  )}
                  {uploadingProfilePic && (
                    <div className="absolute inset-0 bg-slate-950/70 flex flex-col items-center justify-center text-white">
                      <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
                      <span className="text-[10px] font-bold mt-1">Uploading...</span>
                    </div>
                  )}
                </div>

                <input
                  type="file"
                  ref={profilePicInputRef}
                  onChange={handleProfilePicUpload}
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => profilePicInputRef.current?.click()}
                  disabled={uploadingProfilePic}
                  className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md border-2 border-white transition-all hover:scale-110 active:scale-95 cursor-pointer"
                  title="Upload / Change Profile Picture"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              {/* Exhibitor Name & Info */}
              <div className="flex-1 w-full space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-200/80 px-2.5 py-0.5 rounded-full border border-amber-300 inline-block">
                      Exhibitor Representative
                    </span>
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
                      {exhibitorName || (
                        <span className="text-red-600 font-bold text-sm">Please enter your name below (Compulsory)</span>
                      )}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => profilePicInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5 text-amber-600" />
                      <span>{profilePicUrl ? 'Change Profile Picture' : 'Upload Profile Picture'}</span>
                    </button>
                  </div>
                </div>

                {profilePicSuccess && (
                  <p className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{profilePicSuccess}</span>
                  </p>
                )}
                {profilePicError && (
                  <p className="text-xs font-bold text-red-600 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span>{profilePicError}</span>
                  </p>
                )}

                {/* Live Name Input */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-900 mb-1">
                    Exhibitor / Representative Name <span className="text-red-600 font-black">* (Compulsory)</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name (e.g. Rajesh Kumar Mehta)..."
                    ref={exhibitorNameRef}
                    value={exhibitorName}
                    onChange={(e) => {
                      setExhibitorName(e.target.value);
                      if (nameError) setNameError('');
                    }}
                    className={`w-full max-w-lg px-3.5 py-2 bg-white border rounded-xl text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 shadow-2xs ${
                      nameError
                        ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-slate-300 focus:border-amber-500 focus:ring-amber-500/20'
                    }`}
                  />
                  {nameError && (
                    <p className="mt-1.5 text-xs font-bold text-red-600 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{nameError}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Company Description Paragraph Input (Max 400 Chars) */}
            <div className="mt-5 pt-4 border-t border-amber-200/60">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-amber-700" />
                  <span>About Your Company / Products (Paragraph)</span>
                </label>
                <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${companyDescription.length > 380 ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-slate-100 text-slate-700'}`}>
                  {companyDescription.length} / 400 characters
                </span>
              </div>
              <textarea
                rows={3}
                maxLength={400}
                placeholder="Briefly describe your company, products, and specialties (fabrics, sarees, kurtis, zari, lehengas, etc.). Maximum 400 characters."
                value={companyDescription}
                onChange={(e) => setCompanyDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 focus:border-amber-500 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 shadow-2xs resize-none"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                This description will appear in the STE 2026 Exhibitor Directory and Admin exports.
              </p>
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

          {/* Facia / Banner Name of Companies (Dynamic: 2 visible by default, addable up to 4) */}
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
                      {fasciaNames.length} Firm Name Option{fasciaNames.length > 1 ? 's' : ''}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Enter company / firm name options to be printed on your booth fascia board header and promotional banners
                  </p>
                </div>
              </div>

              {fasciaNames.length < 4 && (
                <button
                  type="button"
                  onClick={handleAddFasciaName}
                  className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider transition-all shadow-xs hover:scale-105 active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Option {fasciaNames.length + 1}</span>
                </button>
              )}
            </div>

            {/* Dynamic Firm Name Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {fasciaNames.map((name, index) => (
                <div
                  key={index}
                  className="p-4 bg-slate-50 border border-slate-200 hover:border-amber-400 rounded-xl transition-all shadow-xs relative"
                >
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 text-[11px] font-black flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span>Option {index + 1} (Main Header Firm Name)</span>
                    </label>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                        Main Header
                      </span>
                      {index >= 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveFasciaName(index)}
                          className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title={`Remove Option ${index + 1}`}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder={`e.g. Ambika Silk Mills (Main Header Option ${index + 1})`}
                    value={name || ''}
                    onChange={(e) => handleFasciaNameChange(index, e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Main header firm name option {index + 1} for booth fascia board
                  </span>
                </div>
              ))}
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
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 shadow-xs flex items-center gap-2 cursor-pointer"
              >
                {profileSaving ? 'Saving Profile...' : 'Save Exhibitor Profile & Stall Details'}
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
                      <p className="text-xs text-slate-500 font-medium">Standard booth amenities & furniture provided by STE 2026 organizers for your stall</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-xs">
                  <div className="flex items-center gap-2 mb-3.5 pb-2.5 border-b border-slate-200">
                    <Package className="w-4 h-4 text-amber-700" />
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">Complimentary Stall Amenities & Furniture</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between shadow-2xs">
                      <span className="text-xs font-semibold text-slate-700">Exhibition Chairs</span>
                      <span className="font-extrabold text-amber-800 font-mono bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-xs">{currentPackage.exhibition_chairs} pcs</span>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between shadow-2xs">
                      <span className="text-xs font-semibold text-slate-700">Rectangular Table</span>
                      <span className="font-extrabold text-amber-800 font-mono bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-xs">{currentPackage.rectangular_table} pcs</span>
                    </div>
                    {currentPackage.reception_table > 0 && (
                      <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between shadow-2xs">
                        <span className="text-xs font-semibold text-slate-700">Reception Table</span>
                        <span className="font-extrabold text-amber-800 font-mono bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-xs">{currentPackage.reception_table} pcs</span>
                      </div>
                    )}
                    {currentPackage.sofa > 0 && (
                      <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between shadow-2xs">
                        <span className="text-xs font-semibold text-slate-700">Sofa Set</span>
                        <span className="font-extrabold text-amber-800 font-mono bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-xs">{currentPackage.sofa} set</span>
                      </div>
                    )}
                    {currentPackage.mannequin > 0 && (
                      <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between shadow-2xs">
                        <span className="text-xs font-semibold text-slate-700">Display Mannequin</span>
                        <span className="font-extrabold text-amber-800 font-mono bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-xs">{currentPackage.mannequin} pcs</span>
                      </div>
                    )}
                    <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between shadow-2xs">
                      <span className="text-xs font-semibold text-slate-700">Hanger Stand</span>
                      <span className="font-extrabold text-amber-800 font-mono bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-xs">{currentPackage.hanger_stand} pcs</span>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between shadow-2xs">
                      <span className="text-xs font-semibold text-slate-700">Metal Lights</span>
                      <span className="font-extrabold text-amber-800 font-mono bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-xs">{currentPackage.metal_lights} units</span>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between shadow-2xs">
                      <span className="text-xs font-semibold text-slate-700">Power Plug Points</span>
                      <span className="font-extrabold text-amber-800 font-mono bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-xs">{currentPackage.plug_points} points</span>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between shadow-2xs">
                      <span className="text-xs font-semibold text-slate-700">Dust Bin</span>
                      <span className="font-extrabold text-amber-800 font-mono bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-xs">{currentPackage.dust_bin} pcs</span>
                    </div>
                    {currentPackage.corner_stall && (
                      <div className="p-3 bg-emerald-50/70 rounded-lg border border-emerald-300 flex items-center justify-between shadow-2xs">
                        <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                          <Crown className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Corner Stall Allocation</span>
                        </span>
                        <span className="font-extrabold text-emerald-800 font-mono bg-white px-2 py-0.5 rounded border border-emerald-300 text-xs">✓ Included</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
        </section>

        {/* Section 2: Official Brand Logo & CDR / Vector Artwork Upload */}
        <section id="section-artwork" className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 lg:p-8 relative overflow-hidden shadow-xs scroll-mt-20 sm:scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
                <FileCode className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <span>2. Official Brand Logo & Vector Artwork (CDR)</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Upload your master CorelDRAW (.cdr) or high-resolution logo (.png / .jpg) for stall fascia printing & event branding
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Upload Drag & Drop Area */}
            <div className="lg:col-span-7">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleFileUpload(e);
                }}
                className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all flex flex-col items-center justify-center gap-3 relative ${
                  uploadingFile
                    ? 'border-amber-400 bg-amber-50/50'
                    : 'border-slate-300 hover:border-amber-500 hover:bg-slate-50/80 bg-slate-50/40'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,.cdr"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="cdr-logo-file-input"
                  disabled={uploadingFile}
                />

                <div className="w-14 h-14 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 shadow-xs">
                  {uploadingFile ? (
                    <div className="w-6 h-6 border-3 border-amber-700/30 border-t-amber-700 rounded-full animate-spin" />
                  ) : (
                    <Upload className="w-7 h-7" />
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {uploadingFile ? 'Uploading file...' : 'Drag & drop your CDR / Logo file here'}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    Supported formats: <strong className="text-slate-800">.PNG, .JPG, .JPEG, .CDR</strong> (Up to 50MB)
                  </p>
                </div>

                {uploadingFile ? (
                  <div className="w-full max-w-xs space-y-1.5 mt-2">
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 transition-all duration-300 rounded-full"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-mono text-amber-800 font-bold block">
                      Uploading: {uploadProgress}%
                    </span>
                  </div>
                ) : (
                  <label
                    htmlFor="cdr-logo-file-input"
                    className="mt-2 px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider cursor-pointer shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                  >
                    <Upload className="w-3.5 h-3.5 text-amber-400" />
                    <span>Choose CDR or Logo File</span>
                  </label>
                )}

                {uploadSuccessMsg && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2 mt-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{uploadSuccessMsg}</span>
                  </div>
                )}

                {uploadError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-300 text-red-700 text-xs font-bold flex items-center gap-2 mt-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Uploaded File Status & Information Card */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 block mb-2">
                  Uploaded Brand Artwork
                </span>

                {cdrFileUrl || logoFileUrl ? (
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 font-black text-xs flex items-center justify-center uppercase shadow-xs">
                          {cdrFileUrl ? 'CDR' : 'IMG'}
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-slate-900 leading-snug">
                            {brandName || 'Brand'} Artwork File
                          </h5>
                          <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                            <Check className="w-3 h-3 text-emerald-600" />
                            Uploaded & Saved Successfully
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <a
                          href={cdrFileUrl || logoFileUrl || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold border border-slate-300 transition-all flex items-center gap-1"
                        >
                          <span>View</span>
                          <ExternalLink className="w-3 h-3 text-slate-500" />
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center text-slate-400">
                    <ImageIcon className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="text-xs font-semibold text-slate-600">No artwork file uploaded yet</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Upload your CorelDRAW (.cdr) or high-resolution brand logo file.
                    </p>
                  </div>
                )}
              </div>

              {/* Artwork Guidelines Note */}
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-950 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <Info className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Artwork Guidelines</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Please upload your vector CorelDRAW (.CDR) or high-resolution logo (.PNG / .JPG). This will be used by the organizing team for your stall fascia printing and promotional catalogue.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Exhibitor Entry Badges Registration */}
        <section id="section-badges" className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xs scroll-mt-20 sm:scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
                <Contact className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <span>3. Exhibitor & Staff Badges Registration</span>
                  <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-md bg-amber-200 text-amber-900 border border-amber-300">
                    Official Form
                  </span>
                </h2>
                <p className="text-xs text-slate-500">Register owner, sales staff, and support team badges for official STE 2026 entry passes</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 inline-block shadow-xs">
                Online Registration Required
              </span>
              <h3 className="text-lg sm:text-xl font-extrabold text-white">
                Submit Your Exhibitor & Staff Badges
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Please complete your team’s badge registration on the official STE 2026 registration portal for your digital and physical entry passes.
              </p>
            </div>

            <a
              href="https://eventmanagement.isavgo.com/ste2026-registration"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2.5 shrink-0"
            >
              <span>Fill Badge Form</span>
              <ExternalLink className="w-4 h-4 text-slate-950" />
            </a>
          </div>
        </section>

        {/* Section 4: Extras Catalog Store */}
        <section id="section-extras" className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xs scroll-mt-20 sm:scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">4. Additional Requirements & Extras</h2>
                <p className="text-xs text-slate-500">Select extra furniture, display fixtures, audio-visual gear, and electrical connections</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <a
                href="/exhibitor-extras"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 text-amber-700" />
                <span>View Full Rate Card</span>
              </a>

              {totalSelectedItemsCount > 0 && (
                <span className="px-3 py-1.5 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                  <span>{totalSelectedItemsCount} Extra Item{totalSelectedItemsCount === 1 ? '' : 's'}</span>
                </span>
              )}
            </div>
          </div>

          {/* Search Bar & Sticky Category Filter */}
          <div className="space-y-3 mb-6">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search extra furniture, lighting, TV screens, counters..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-amber-500 focus:bg-white transition-all shadow-2xs"
              />
              {searchFilter && (
                <button
                  type="button"
                  onClick={() => setSearchFilter('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Chips with High WCAG AA Contrast */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border shrink-0 cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-amber-400 border-slate-900 shadow-xs'
                        : cat === 'Furniture & Seating'
                        ? 'bg-blue-50/80 text-blue-900 border-blue-200 hover:bg-blue-100'
                        : cat === 'Electrical & Lighting'
                        ? 'bg-amber-50/80 text-amber-950 border-amber-300 hover:bg-amber-100'
                        : cat === 'Display & AV'
                        ? 'bg-purple-50/80 text-purple-900 border-purple-200 hover:bg-purple-100'
                        : cat === 'Manpower & Staff'
                        ? 'bg-emerald-50/80 text-emerald-950 border-emerald-300 hover:bg-emerald-100'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Single Dismissible Product Image Reference & Rate Disclaimer Banner */}
          {!isDisclaimerDismissed && (
            <div className="mb-6 p-3.5 sm:p-4 bg-amber-50 border border-amber-300/80 rounded-xl flex items-start justify-between gap-3 text-amber-950 shadow-2xs animate-in fade-in duration-200">
              <div className="flex items-start gap-2.5 sm:gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <span className="font-extrabold block text-amber-950 uppercase tracking-wide">
                    Product Image & GST Notice
                  </span>
                  <p className="text-amber-900 font-medium">
                    • Note: The images are for booking purpose only. The original product may change.
                  </p>
                  <p className="text-amber-950 font-bold">
                    • All rates shown are EXCLUDING GST. Applicable 18% GST will be added at final billing.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDisclaimerDismissed(true)}
                className="p-1 rounded-md text-amber-700 hover:text-amber-950 hover:bg-amber-100 transition-colors shrink-0 cursor-pointer"
                aria-label="Dismiss disclaimer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Product Grid / List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
            {filteredProducts.map((p) => {
              const qty = quantities[p.id] || 0;
              const d = itemDays[p.id] || 2;
              const imgUrl = getProductImage(p.id);
              const baseLineTotal = (p.rate_inr || 0) * qty * d;
              const gstAmount = Math.round(baseLineTotal * 0.18);
              const totalWithGst = baseLineTotal + gstAmount;
              const isExpanded = expandedMobileCards[p.id] || qty > 0;

              return (
                <div
                  key={p.id}
                  className={`p-3 sm:p-4 rounded-xl border transition-all flex flex-col justify-between ${
                    qty > 0
                      ? 'bg-amber-50/60 border-amber-400 shadow-xs ring-1 ring-amber-400/40'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  {/* --- MOBILE COMPACT VIEW (< 640px) --- */}
                  <div className="sm:hidden">
                    <div className="flex items-center gap-3">
                      {/* Square Thumbnail */}
                      <div 
                        onClick={() => toggleMobileCard(p.id)}
                        className="w-16 h-16 rounded-lg bg-slate-100 border border-slate-200 shrink-0 overflow-hidden flex items-center justify-center p-1 cursor-pointer"
                      >
                        <img
                          src={imgUrl}
                          alt={p.name}
                          className="w-full h-full object-contain"
                          loading="lazy"
                        />
                      </div>

                      {/* Item Info Center */}
                      <div className="flex-1 min-w-0" onClick={() => toggleMobileCard(p.id)}>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                            p.category === 'Furniture & Seating'
                              ? 'bg-blue-100 text-blue-900 border-blue-200'
                              : p.category === 'Electrical & Lighting'
                              ? 'bg-amber-100 text-amber-950 border-amber-300'
                              : p.category === 'Display & AV'
                              ? 'bg-purple-100 text-purple-900 border-purple-200'
                              : p.category === 'Manpower & Staff'
                              ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {p.category}
                          </span>
                        </div>
                        <h3 className="text-xs font-bold text-slate-900 truncate">{p.name}</h3>
                        {p.rate_inr ? (
                          <div className="flex items-baseline gap-1 mt-0.5">
                            <span className="text-xs font-mono font-black text-amber-800">
                              ₹{p.rate_inr.toLocaleString('en-IN')}/d
                            </span>
                            <span className="text-[9px] font-bold text-slate-500 uppercase">
                              +18% GST
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-mono">Per {p.unit}</span>
                        )}
                      </div>

                      {/* Stepper on Mobile */}
                      <div className="flex items-center gap-1 bg-slate-50 border border-slate-300 rounded-lg p-0.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => updateQuantity(p.id, -1)}
                          disabled={qty <= 0}
                          className="w-7 h-7 rounded bg-white hover:bg-slate-100 text-slate-800 flex items-center justify-center font-bold text-xs disabled:opacity-30 border border-slate-200 active:scale-95 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-mono font-black text-slate-900">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(p.id, 1)}
                          className="w-7 h-7 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center font-extrabold text-xs shadow-2xs active:scale-95 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Expandable details & Rental Days on Mobile */}
                    {isExpanded && (
                      <div className="mt-2.5 pt-2.5 border-t border-slate-200/80 space-y-2 animate-in fade-in duration-150">
                        <p className="text-[11px] text-slate-600">{p.description}</p>
                        
                        {/* Rental Days Segmented Control */}
                        {qty > 0 && (
                          <div className="flex items-center justify-between bg-amber-100/60 p-2 rounded-lg border border-amber-300/60">
                            <span className="text-[10px] font-bold text-amber-950 flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-amber-700" />
                              <span>Rental Duration:</span>
                            </span>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3].map((num) => (
                                <button
                                  key={num}
                                  type="button"
                                  onClick={() => updateItemDays(p.id, num)}
                                  className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                                    (itemDays[p.id] || 2) === num
                                      ? 'bg-slate-900 text-amber-400 font-black shadow-2xs'
                                      : 'bg-white text-slate-700 hover:bg-amber-50 border border-slate-300'
                                  }`}
                                >
                                  {num} {num === 1 ? 'Day' : 'Days'}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Live Total Calculation */}
                        {qty > 0 && p.rate_inr ? (
                          <div className="p-2 bg-amber-200/60 border border-amber-300 rounded-lg flex items-center justify-between text-xs">
                            <span className="text-amber-950 font-bold text-[11px]">Item Total:</span>
                            <span className="font-mono font-black text-amber-950 text-xs">
                              ₹{baseLineTotal.toLocaleString('en-IN')}{' '}
                              <span className="text-[10px] text-slate-700 font-normal">
                                (+ GST ₹{gstAmount.toLocaleString('en-IN')} = ₹{totalWithGst.toLocaleString('en-IN')})
                              </span>
                            </span>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>

                  {/* --- DESKTOP GRID VIEW (sm: and above) --- */}
                  <div className="hidden sm:block">
                    {/* Product Image */}
                    <div className="relative w-full h-36 mb-3 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 group flex items-center justify-center p-2">
                      <img
                        src={imgUrl}
                        alt={p.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>

                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className={`text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                        p.category === 'Furniture & Seating'
                          ? 'bg-blue-100 text-blue-900 border-blue-200'
                          : p.category === 'Electrical & Lighting'
                          ? 'bg-amber-100 text-amber-950 border-amber-300'
                          : p.category === 'Display & AV'
                          ? 'bg-purple-100 text-purple-900 border-purple-200'
                          : p.category === 'Manpower & Staff'
                          ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {p.category}
                      </span>
                      {p.rate_inr ? (
                        <div className="text-right">
                          <span className="text-xs font-mono font-extrabold text-amber-800 block">
                            ₹{p.rate_inr.toLocaleString('en-IN')} / day
                          </span>
                          <span className="text-[9px] font-bold text-amber-900 uppercase tracking-tight block">
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
                    <p className="text-xs text-slate-600 mb-3 line-clamp-2">{p.description}</p>
                  </div>

                  {/* Desktop Actions Footer */}
                  <div className="hidden sm:block space-y-2 pt-2 border-t border-slate-200 mt-2">
                    {/* Rental Days Selector per Item (Only if qty > 0) */}
                    {qty > 0 ? (
                      <div className="flex items-center justify-between bg-amber-50/80 p-2 rounded-lg border border-amber-200">
                        <span className="text-[11px] font-bold text-amber-950 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-amber-700" />
                          <span>Rental Days:</span>
                        </span>

                        <div className="flex items-center gap-1">
                          {[1, 2, 3].map((num) => (
                            <button
                              key={num}
                              type="button"
                              onClick={() => updateItemDays(p.id, num)}
                              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                                (itemDays[p.id] || 2) === num
                                  ? 'bg-slate-900 text-amber-400 font-black shadow-2xs'
                                  : 'bg-white text-slate-700 hover:bg-amber-50 border border-slate-300'
                              }`}
                            >
                              {num} {num === 1 ? 'Day' : 'Days'}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {/* Quantity Selector */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-semibold text-slate-600">
                        Quantity:
                      </span>
                      <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-lg p-1">
                        <button
                          type="button"
                          onClick={() => updateQuantity(p.id, -1)}
                          disabled={qty <= 0}
                          className="w-7 h-7 rounded-md bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-800 border border-slate-200 transition-colors active:scale-95 font-bold disabled:opacity-30 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-extrabold text-slate-900 font-mono">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(p.id, 1)}
                          className="w-7 h-7 rounded-md bg-amber-500 hover:bg-amber-400 flex items-center justify-center text-slate-950 font-extrabold transition-colors active:scale-95 shadow-sm cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Live Line Total when Quantity > 0 */}
                    {qty > 0 && p.rate_inr ? (
                      <div className="mt-2 p-2 bg-amber-100/90 border border-amber-300 rounded-lg flex items-center justify-between text-xs">
                        <span className="text-amber-950 font-bold">Item Total:</span>
                        <span className="font-mono font-black text-amber-950">
                          ₹{baseLineTotal.toLocaleString('en-IN')}{' '}
                          <span className="text-[10px] text-slate-700 font-medium font-sans">
                            ({qty} {p.unit} × {d}d)
                          </span>
                        </span>
                      </div>
                    ) : null}
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
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
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

        {/* Section 5: Live Order & Badges Summary */}
        <section id="section-summary" className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-6 lg:p-8 space-y-6 scroll-mt-20 sm:scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">5. Overall Requisition Summary</h2>
              <p className="text-xs text-slate-500">Review your booth configuration, fascia details, entry badges, and extra amenities</p>
            </div>
            {lastSubmittedAt && (
              <span className="text-xs text-emerald-700 font-medium flex items-center gap-1.5 self-start sm:self-auto bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Last saved at {lastSubmittedAt}</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-1">
                Stall & Booth Details
              </span>
              <p className="text-base font-black text-slate-900">{brandName || 'Not configured'}</p>
              <p className="text-xs text-slate-600 mt-0.5">
                Stall Size:{' '}
                <span className="font-bold text-slate-900">
                  {selectedSqftOption === 'Other'
                    ? customSqft ? `${customSqft} sq ft` : 'Custom'
                    : `${selectedSqftOption} sq ft`}
                </span>
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-1">
                Fascia / Main Header ({fasciaNames.length} Option{fasciaNames.length > 1 ? 's' : ''})
              </span>
              <div className="space-y-1 text-xs">
                {fasciaNames.map((name, i) => (
                  <p key={i} className="text-slate-800">
                    <span className="font-bold text-amber-800">{i + 1}.</span>{' '}
                    {name?.trim() ? (
                      name.trim()
                    ) : i === 0 ? (
                      <span className="text-slate-400 italic">Same as Firm Name</span>
                    ) : (
                      <span className="text-slate-400 italic">Not set</span>
                    )}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Badges Summary */}
          {(ownerBadges > 0 || salesBadges > 0 || supportBadges > 0) && (
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">
                Exhibitor Entry Badges Allocation ({ownerBadges + salesBadges + supportBadges} Total Badges)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {ownerBadges > 0 && (
                  <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg text-xs">
                    <div className="flex items-center justify-between font-bold text-amber-950 mb-1">
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
                      <span>💼 Sales Staff:</span>
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

          {/* Selected Extra Items Breakdown */}
          {totalSelectedItemsCount > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <div className="px-4 py-3 bg-slate-100 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider flex justify-between">
                <span>Selected Extra Item</span>
                <span>Qty & Duration</span>
              </div>
              <div className="divide-y divide-slate-100">
                {products
                  .filter((p) => (quantities[p.id] || 0) > 0)
                  .map((p) => {
                    const d = itemDays[p.id] || 2;
                    const lineTot = (p.rate_inr || 0) * (quantities[p.id] || 0) * d;
                    return (
                      <div key={p.id} className="px-4 py-3 text-xs flex justify-between items-center text-slate-700">
                        <div>
                          <span className="font-bold text-slate-900">{p.name}</span>
                          <span className="text-slate-500 ml-2">({p.category})</span>
                        </div>
                        <div className="text-right font-mono">
                          <span className="font-bold text-amber-700 block">
                            {quantities[p.id]} {p.unit} × {d} {d === 1 ? 'day' : 'days'}
                          </span>
                          {p.rate_inr ? (
                            <span className="text-[11px] text-slate-500 font-medium">
                              ₹{lineTot.toLocaleString('en-IN')} (+ GST)
                            </span>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </section>

      </main>

      {/* Sticky Floating Bottom Submit Bar with Opaque Background & Compact Mobile Layout */}
      <div 
        className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200 shadow-[0_-6px_25px_rgba(0,0,0,0.09)] px-3 sm:px-6 py-2.5 sm:py-3.5"
        style={{ paddingBottom: 'max(10px, env(safe-area-inset-bottom, 10px))' }}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3">
          {/* Line 1 on Mobile / Left on Desktop: Summary & Profile */}
          <div className="flex items-center justify-between w-full sm:w-auto gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
              <div className="text-xs truncate">
                <span className="text-slate-900 font-extrabold truncate">
                  {brandName || 'Stall Profile'}:
                </span>{' '}
                <span className="font-mono font-bold text-amber-800">
                  {selectedSqftOption === 'Other' ? (customSqft ? `${customSqft} sq ft` : 'Custom') : `${selectedSqftOption} sq ft`}
                </span>
                <span className="text-slate-500 ml-1.5 hidden xs:inline">
                  • {totalSelectedItemsCount} extra{totalSelectedItemsCount === 1 ? '' : 's'}
                </span>
              </div>
            </div>

            {/* Quick Tax Bill trigger on mobile line 1 if items present */}
            {totalSelectedItemsCount > 0 && (
              <button
                type="button"
                onClick={() => setShowBillModal(true)}
                className="sm:hidden text-[11px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2 py-1 rounded-lg flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <FileText className="w-3 h-3 text-amber-700" />
                <span>Tax Bill</span>
              </button>
            )}
          </div>

          {/* Line 2 on Mobile / Right on Desktop: Action Buttons */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {totalSelectedItemsCount > 0 && (
              <button
                type="button"
                onClick={() => setShowBillModal(true)}
                className="hidden sm:flex px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-900 font-bold text-xs uppercase tracking-wider transition-all items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <FileText className="w-4 h-4 text-amber-700" />
                <span>View Tax Bill</span>
              </button>
            )}

            <button
              onClick={handleSaveExtras}
              disabled={extrasSaving}
              className="w-full sm:w-auto flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider shadow-md shadow-amber-500/20 transition-all transform active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
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
        items={products
          .filter((p) => (quantities[p.id] || 0) > 0)
          .map((p) => ({
            id: p.id,
            name: p.name,
            rateInr: p.rate_inr || 0,
            quantity: quantities[p.id],
            days: itemDays[p.id] || 2,
          }))}
      />
    </div>
  );
}
