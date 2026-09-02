'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getStallPackageBySqft, STALL_PACKAGES, StallPackage } from '@/data/stallPackages';
import { getProductImage, DISCLAIMER_TEXT } from '@/data/productImages';
import BillModal from '@/components/extras/BillModal';
import { checkGstin, isValidGstin, normalizeGstin } from '@/lib/gstin';
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
  Receipt,
  Store,
  Calendar,
  ArrowRight,
  MapPin,
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

/**
 * Brand files one exhibitor may keep. Mirrors MAX_ASSETS_PER_EXHIBITOR in
 * src/lib/exhibitorAssets.ts, which is what actually enforces the limit; this
 * copy only decides what the portal says before the upload is attempted, and
 * the server's own count replaces it as soon as the file list is loaded.
 */
const MAX_BRAND_FILES = 10;

interface UploadedAsset {
  id: number;
  category: 'logo' | 'cdr' | 'profile_pic';
  slot: number;
  originalFileName: string;
  assetFileName: string;
  fileSize: number | null;
  storageUrl: string | null;
  driveFileUrl: string | null;
  driveFolderUrl: string | null;
  driveSynced: boolean;
  uploadedAt: string | null;
}

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

interface ProfileSavePayload {
  exhibitor_name: string;
  company_description: string;
  gstin: string;
  brand_name: string;
  stall_sqft: string;
  fascia_names: string[];
}

interface ExtrasSavePayload {
  exhibitor_name: string;
  gstin: string;
  items: OrderItem[];
  special_notes: string;
  rental_days: number;
}

/** What is cached on the device between an edit and the server confirming it. */
interface PortalDraft {
  at: number;
  profile: Partial<ProfileSavePayload>;
  extras: Partial<ExtrasSavePayload> | null;
}

const SQFT_PRESETS = ['100', '200', '300', '400', '600', '800', '1000', '1200', '2000', '2600'];

/**
 * The presets are bare numbers while the master exhibitor list stores sizes as
 * "400 sq ft". Without stripping the unit, every exhibitor whose size came from
 * that list failed the preset match, was flipped to "Other", and had their
 * stall size written back as "Other: 400 sq ft" — and rendered as
 * "400 sq ft sq ft". Reduce any stored form to the bare number first.
 */
function normalizeSqft(stored: string): string {
  return stored
    .replace(/^Other:\s*/i, '')
    .replace(/\s*sq\.?\s*ft\.?$/i, '')
    .trim();
}

/**
 * Where an exhibitor is sent once their requirements are in. They fill this
 * form on a phone and expect to land back on the exhibition site afterwards.
 */
const POST_SUBMIT_DESTINATION = '/';
const POST_SUBMIT_REDIRECT_SECONDS = 6;

const draftStorageKey = (mobile: string) => `ste2026_portal_draft_${mobile}`;

/**
 * A save that fails on a phone is usually the network dropping for a moment in
 * a crowded hall, not a rejection. Retry the transient cases; return the
 * response as-is for anything the server has actually decided (4xx).
 */
async function postJsonWithRetry(url: string, body: unknown, attempts = 3): Promise<Response> {
  let lastError: unknown = null;

  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok || (res.status >= 400 && res.status < 500)) return res;
      lastError = new Error(`Server responded ${res.status}`);
    } catch (err) {
      lastError = err;
    }

    if (attempt < attempts - 1) {
      await new Promise((resolve) => setTimeout(resolve, 900 * (attempt + 1)));
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Network request failed');
}

export default function ExhibitorDashboardPage() {
  const router = useRouter();

  // Profile State
  const [mobile, setMobile] = useState('');
  const [exhibitorName, setExhibitorName] = useState('');
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);
  const [companyDescription, setCompanyDescription] = useState('');
  // The exhibitor's own GSTIN for their extras bill. Optional, so an empty box
  // is a valid answer; a filled one has to be a real GSTIN.
  const [gstin, setGstin] = useState('');
  const [gstinError, setGstinError] = useState('');
  const [brandName, setBrandName] = useState('');
  const [category, setCategory] = useState('');
  const [market, setMarket] = useState('');
  // The stall the draw seated them on, empty until they have drawn.
  const [stallNumber, setStallNumber] = useState('');
  const [stallHall, setStallHall] = useState('');
  const [stallZone, setStallZone] = useState('');
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

  const [nameError, setNameError] = useState('');
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  // Brand Logo & Vector Artwork (CDR) Upload State
  const [driveFileUrl, setDriveFileUrl] = useState<string | null>(null);
  const [driveFolderUrl, setDriveFolderUrl] = useState<string | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatusLabel, setUploadStatusLabel] = useState('');
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState('');
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Every brand file the exhibitor currently keeps, so several logos and
  // artwork files can sit side by side instead of each replacing the last.
  const [uploadedAssets, setUploadedAssets] = useState<UploadedAsset[]>([]);
  const [maxUploadFiles, setMaxUploadFiles] = useState(MAX_BRAND_FILES);
  const [deletingAssetId, setDeletingAssetId] = useState<number | null>(null);

  // General Loading & Auth check
  const [initialLoading, setInitialLoading] = useState(true);
  const [autosaveStatus, setAutosaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Submission confirmation shown over the page, so the result is impossible to
  // miss on a phone — the old inline message sat far above the sticky submit
  // bar and never came into view.
  const [submitConfirmed, setSubmitConfirmed] = useState(false);
  const [redirectSeconds, setRedirectSeconds] = useState(POST_SUBMIT_REDIRECT_SECONDS);
  const [restoredDraftNotice, setRestoredDraftNotice] = useState('');
  const autosaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = useRef(false);

  // The most recent payload the form would send, and whether it has reached the
  // server yet. A phone can be locked, backgrounded or killed while the 1.2s
  // autosave timer is still pending, and a pending timer never fires again —
  // these let the page push the edits out on the way down instead.
  const latestPayloadRef = useRef<{ profile: ProfileSavePayload; extras: ExtrasSavePayload | null } | null>(null);
  const hasUnsavedEditsRef = useRef(false);
  const mobileRef = useRef('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  /**
   * Puts a saved draft back into the form. Used only when the draft is newer
   * than what the server holds, so it can never undo an edit made elsewhere.
   */
  const applyDraftToForm = (draft: PortalDraft) => {
    const profile = draft.profile || {};
    const extras = draft.extras;

    if (typeof profile.exhibitor_name === 'string') setExhibitorName(profile.exhibitor_name);
    if (typeof profile.company_description === 'string') setCompanyDescription(profile.company_description);
    if (typeof profile.gstin === 'string') setGstin(profile.gstin);
    if (typeof profile.brand_name === 'string' && profile.brand_name) setBrandName(profile.brand_name);

    if (typeof profile.stall_sqft === 'string' && profile.stall_sqft) {
      const draftSqft = normalizeSqft(profile.stall_sqft);
      if (SQFT_PRESETS.includes(draftSqft)) {
        setSelectedSqftOption(draftSqft);
        setCustomSqft('');
      } else if (draftSqft) {
        setSelectedSqftOption('Other');
        setCustomSqft(draftSqft);
      }
    }

    if (Array.isArray(profile.fascia_names) && profile.fascia_names.length >= 2) {
      setFasciaNames(profile.fascia_names.map((n) => String(n || '')));
    }

    if (!extras) return;

    if (Array.isArray(extras.items)) {
      const qMap: Record<string, number> = {};
      const dMap: Record<string, number> = {};
      extras.items.forEach((item) => {
        if (!item?.id) return;
        if (item.quantity > 0) qMap[item.id] = item.quantity;
        dMap[item.id] = Number(item.days) || 2;
      });
      setQuantities(qMap);
      setItemDays(dMap);
    }

    if (typeof extras.special_notes === 'string') setSpecialNotes(extras.special_notes);
  };

  /**
   * Edits are cached locally before every save attempt and cleared once the
   * server confirms. A cache left behind means the last save never got out —
   * push it now rather than letting the exhibitor retype it.
   */
  const replayPendingDraft = async (mobileId: string, serverUpdatedAt: number) => {
    if (!mobileId) return;

    let draft: PortalDraft | null = null;
    try {
      const raw = window.localStorage.getItem(draftStorageKey(mobileId));
      if (!raw) return;
      draft = JSON.parse(raw) as PortalDraft;
    } catch {
      return;
    }

    const clear = () => {
      try {
        window.localStorage.removeItem(draftStorageKey(mobileId));
      } catch {}
    };

    if (!draft?.profile || typeof draft.at !== 'number') {
      clear();
      return;
    }

    // The server is at least as fresh — the draft is a leftover, not lost work.
    if (serverUpdatedAt && draft.at <= serverUpdatedAt) {
      clear();
      return;
    }

    try {
      applyDraftToForm(draft);
    } catch (err) {
      console.warn('Discarding an unreadable saved draft:', err);
      clear();
      return;
    }

    try {
      const profRes = await postJsonWithRetry('/api/exhibitor/profile', draft.profile, 2);
      const extrasRes = draft.extras
        ? await postJsonWithRetry('/api/exhibitor/extras', draft.extras, 2)
        : null;

      if (profRes.ok && (!extrasRes || extrasRes.ok)) {
        clear();
        setRestoredDraftNotice(
          'We restored the details you had filled in before and saved them for you.'
        );
        setTimeout(() => setRestoredDraftNotice(''), 8000);
      }
    } catch (err) {
      console.warn('Could not replay the saved draft yet:', err);
    }
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
      mobileRef.current = profData.mobile || '';
      setBrandName(profData.brand_name || '');
      setExhibitorName(profData.exhibitor_name || '');
      setProfilePicUrl(profData.profile_pic_url || null);
      setCompanyDescription(profData.company_description || '');
      setGstin(profData.gstin || '');
      setCategory(profData.category || '');
      setMarket(profData.market || '');
      setStallNumber(profData.stall_number || '');
      setStallHall(profData.stall_hall || '');
      setStallZone(profData.stall_zone || '');

      const existingSqft = normalizeSqft(profData.stall_sqft || '200 sq ft');
      if (SQFT_PRESETS.includes(existingSqft)) {
        setSelectedSqftOption(existingSqft);
        setCustomSqft('');
      } else if (existingSqft) {
        setSelectedSqftOption('Other');
        setCustomSqft(existingSqft);
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

      setDriveFileUrl(profData.drive_file_url || null);
      setDriveFolderUrl(profData.drive_folder_url || null);

      // The exhibitor's full set of brand files, not just the newest of each.
      await fetchUploadedAssets();

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
        setLastSubmittedAt(catData.existingOrder.updated_at || null);
      }

      // 3. Recover anything typed on a previous visit that never reached the
      //    server — a phone killed mid-form, or the hall's signal dropping.
      //    The recovered values land in the form synchronously; only the resend
      //    is left running, so a slow network cannot hold up the portal.
      void replayPendingDraft(
        profData.mobile || '',
        profData.updated_at ? new Date(profData.updated_at).getTime() : 0
      );
    } catch (err) {
      console.error('Failed to load exhibitor dashboard data:', err);
    } finally {
      setInitialLoading(false);
      setTimeout(() => {
        isInitializedRef.current = true;
      }, 600);
    }
  };

  const buildFinalSqft = () =>
    selectedSqftOption === 'Other'
      ? customSqft.trim()
        ? `Other: ${customSqft.trim()}`
        : 'Other'
      : selectedSqftOption;

  /**
   * Keeps the box to the shape of a GSTIN as it is typed: upper case,
   * alphanumeric, fifteen characters. The server checks the format again.
   */
  const totalSelectedItemsCount = Object.values(quantities).reduce((a, b) => a + b, 0);

  const handleGstinChange = (value: string) => {
    setGstin(normalizeGstin(value));
    if (gstinError) setGstinError('');
  };

  /**
   * Extras are chargeable, so ordering one turns the GST number from a nicety
   * into the thing the invoice is raised against. Someone ordering nothing is
   * still free to leave it blank.
   */
  const gstinRequired = totalSelectedItemsCount > 0;
  const gstinIsComplete = isValidGstin(gstin);

  /** Why the GSTIN as it stands would be refused, or '' if it would not be. */
  const gstinProblem = (): string => {
    if (!gstin) {
      return gstinRequired
        ? 'Your GST number is required for an order of extra items. Add it here, or remove the extras.'
        : '';
    }
    return checkGstin(gstin).reason || '';
  };

  const buildProfilePayload = (): ProfileSavePayload => ({
    exhibitor_name: exhibitorName.trim(),
    company_description: companyDescription.trim(),
    gstin,
    brand_name: brandName,
    stall_sqft: buildFinalSqft(),
    fascia_names: fasciaNames
  });

  const buildSelectedItems = (): OrderItem[] =>
    products
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

  const buildExtrasPayload = (): ExtrasSavePayload => ({
    exhibitor_name: exhibitorName.trim(),
    gstin,
    items: buildSelectedItems(),
    special_notes: specialNotes,
    rental_days: 2
  });

  const rememberDraft = (profile: ProfileSavePayload, extras: ExtrasSavePayload | null) => {
    if (!mobileRef.current) return;
    try {
      window.localStorage.setItem(
        draftStorageKey(mobileRef.current),
        JSON.stringify({ at: Date.now(), profile, extras })
      );
    } catch {
      // Private browsing or a full quota — the network save is still the
      // primary path, so carry on.
    }
  };

  const forgetDraft = () => {
    if (!mobileRef.current) return;
    try {
      window.localStorage.removeItem(draftStorageKey(mobileRef.current));
    } catch {}
  };

  // Debounced cloud autosave on change across all profile and order requirements
  useEffect(() => {
    if (!isInitializedRef.current || initialLoading) return;

    const profilePayload = buildProfilePayload();
    // The order write is rejected without a name, and again without a GSTIN
    // once there are extras on it, so hold it back rather than flashing a save
    // error at someone still filling the form in.
    const extrasPayload =
      exhibitorName.trim() && !(gstinRequired && !gstinIsComplete)
        ? buildExtrasPayload()
        : null;

    latestPayloadRef.current = { profile: profilePayload, extras: extrasPayload };
    hasUnsavedEditsRef.current = true;
    rememberDraft(profilePayload, extrasPayload);

    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
    }

    // A GSTIN is invalid for the first fourteen of its fifteen characters, and
    // the profile route refuses one that does not check out. Sending each
    // keystroke would paint a save error over somebody who is simply still
    // typing, so wait until the box is either right or empty. The draft
    // remembered just above keeps the edit safe in the meantime.
    if (gstin !== '' && !gstinIsComplete) {
      return () => {
        if (autosaveTimeoutRef.current) {
          clearTimeout(autosaveTimeoutRef.current);
        }
      };
    }

    autosaveTimeoutRef.current = setTimeout(async () => {
      setAutosaveStatus('saving');
      try {
        // Sequential, not parallel: both endpoints rewrite the exhibitor's
        // master-sheet row, and running them together let the slower one
        // publish a row it had read before the other's write landed.
        const profRes = await postJsonWithRetry('/api/exhibitor/profile', profilePayload);
        const extrasRes = extrasPayload
          ? await postJsonWithRetry('/api/exhibitor/extras', extrasPayload)
          : null;

        if (profRes.ok && (!extrasRes || extrasRes.ok)) {
          hasUnsavedEditsRef.current = false;
          forgetDraft();
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
    gstin,
    brandName,
    selectedSqftOption,
    customSqft,
    fasciaNames,
    products,
    quantities,
    itemDays,
    specialNotes,
    initialLoading
  ]);

  // Last-ditch flush. A phone that is locked, switched away from or killed
  // freezes the pending autosave timer, and it never runs again — which is
  // exactly how a filled-in form came back empty. `keepalive` lets these
  // requests finish after the page itself is gone.
  useEffect(() => {
    const flush = () => {
      if (!hasUnsavedEditsRef.current || !latestPayloadRef.current) return;

      const { profile, extras } = latestPayloadRef.current;
      const base: RequestInit = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        keepalive: true
      };

      try {
        // Nothing can be awaited here, so both go at once. The database write
        // in each route is authoritative; if their two sheet writes land out of
        // order the row is corrected by the next save or page load.
        void fetch('/api/exhibitor/profile', { ...base, body: JSON.stringify(profile) });
        if (extras) {
          void fetch('/api/exhibitor/extras', { ...base, body: JSON.stringify(extras) });
        }
      } catch {
        // The draft in localStorage is replayed on the next visit.
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') flush();
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('pagehide', flush);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('pagehide', flush);
    };
  }, []);


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

  /** Re-reads the exhibitor's brand files after an upload, a delete or a reload. */
  const fetchUploadedAssets = async () => {
    try {
      const res = await fetch('/api/exhibitor/upload');
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.assets)) setUploadedAssets(data.assets);
      if (typeof data.maxFiles === 'number') setMaxUploadFiles(data.maxFiles);
    } catch {
      // The list is a convenience; a failed read must not break the dashboard.
    }
  };

  const handleDeleteAsset = async (asset: UploadedAsset) => {
    if (!confirm('Remove "' + asset.originalFileName + '" from your uploaded files?')) return;

    setUploadError('');
    setUploadSuccessMsg('');
    setDeletingAssetId(asset.id);

    try {
      const res = await fetch('/api/exhibitor/upload?id=' + asset.id, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not remove that file.');

      if (Array.isArray(data.assets)) setUploadedAssets(data.assets);
      if (typeof data.maxFiles === 'number') setMaxUploadFiles(data.maxFiles);

      setUploadSuccessMsg(
        data.driveWarning
          ? 'Removed "' + asset.originalFileName + '". ' + data.driveWarning
          : 'Removed "' + asset.originalFileName + '".'
      );
      setTimeout(() => setUploadSuccessMsg(''), 5000);
    } catch (err: any) {
      setUploadError(err.message || 'Could not remove that file. Please try again.');
    } finally {
      setDeletingAssetId(null);
    }
  };

  /**
   * Uploads every file the exhibitor picked or dropped.
   *
   * One request per file rather than one big batch: a fascia artwork file runs
   * to tens of megabytes, and sending ten at once over an exhibition-hall
   * connection times out and loses all of them. Sending them in turn means a
   * failure costs only the file it happened on, and the ones already stored
   * stay stored.
   */
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>,
    directFile?: File
  ) => {
    let files: File[] = [];
    if (directFile) {
      files = [directFile];
    } else if ('dataTransfer' in e && e.dataTransfer.files?.length) {
      files = Array.from(e.dataTransfer.files);
    } else if ('target' in e && (e.target as HTMLInputElement).files?.length) {
      files = Array.from((e.target as HTMLInputElement).files!);
    }

    if (files.length === 0) return;

    setUploadError('');
    setUploadSuccessMsg('');

    const roomLeft = maxUploadFiles - uploadedAssets.length;
    const namesHeld = new Set(uploadedAssets.map((a) => a.originalFileName.trim().toLowerCase()));
    const newNames = files.filter((f) => !namesHeld.has(f.name.trim().toLowerCase())).length;

    if (newNames > roomLeft) {
      setUploadError(
        'You can keep up to ' + maxUploadFiles + ' files and already have ' +
          uploadedAssets.length + '. Please remove ' + (newNames - roomLeft) +
          ' file(s) first, or select fewer.'
      );
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setUploadingFile(true);
    setUploadProgress(0);

    const succeeded: string[] = [];
    let failure = '';

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadStatusLabel(
          files.length > 1
            ? 'Uploading ' + (i + 1) + ' of ' + files.length + ': ' + file.name
            : 'Uploading ' + file.name
        );
        // Progress marks completed files, plus a nudge so the bar moves while
        // the current file is in flight.
        setUploadProgress(Math.round((i / files.length) * 100) + Math.round(40 / files.length));

        const formData = new FormData();
        formData.append('file', file);
        const ext = file.name.split('.').pop()?.toLowerCase();
        formData.append('category', ext === 'cdr' ? 'cdr' : 'logo');

        const res = await fetch('/api/exhibitor/upload', { method: 'POST', body: formData });
        const data = await res.json();

        if (!res.ok) {
          failure = data.error || 'Failed to upload "' + file.name + '".';
          break;
        }

        if (data.driveFileUrl) setDriveFileUrl(data.driveFileUrl);
        if (data.driveFolderUrl) setDriveFolderUrl(data.driveFolderUrl);
        if (Array.isArray(data.assets)) setUploadedAssets(data.assets);
        if (typeof data.maxFiles === 'number') setMaxUploadFiles(data.maxFiles);

        succeeded.push(file.name);
        setUploadProgress(Math.round(((i + 1) / files.length) * 100));
      }

      // Say what actually happened: a part-finished batch must not read as a
      // clean success, and the files that did land must not read as lost.
      if (failure) {
        setUploadError(
          succeeded.length > 0
            ? succeeded.length + ' of ' + files.length + ' files uploaded. ' + failure
            : failure
        );
      } else if (succeeded.length === 1) {
        setUploadSuccessMsg('"' + succeeded[0] + '" uploaded and synced to Google Drive.');
      } else {
        setUploadSuccessMsg(succeeded.length + ' files uploaded and synced to Google Drive.');
      }
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload file. Please try again.');
    } finally {
      setUploadingFile(false);
      setUploadStatusLabel('');
      setTimeout(() => setUploadProgress(0), 1500);
      if (fileInputRef.current) fileInputRef.current.value = '';
      void fetchUploadedAssets();
    }
  };

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (companyDescription && companyDescription.length > 400) {
      setProfileError('Company description cannot exceed 400 characters.');
      return;
    }

    const profileGstinProblem = gstinProblem();
    if (profileGstinProblem) {
      setGstinError(profileGstinProblem);
      document.getElementById('section-summary')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      document.getElementById('exhibitor-gstin')?.focus({ preventScroll: true });
      return;
    }

    setProfileSaving(true);
    setProfileSuccessMsg('');
    setProfileError('');

    // A pending autosave carries the same edits; let this save be the one that
    // lands rather than having both in flight against the same row.
    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
      autosaveTimeoutRef.current = null;
    }

    const profilePayload = buildProfilePayload();

    try {
      const res = await postJsonWithRetry('/api/exhibitor/profile', profilePayload);
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setProfileError(data.error || 'Failed to save profile. Please try again.');
        setAutosaveStatus('error');
      } else {
        hasUnsavedEditsRef.current = false;
        forgetDraft();
        setProfileSuccessMsg('Exhibitor profile, stall, and fascia details saved successfully!');
        setAutosaveStatus('saved');
        setTimeout(() => setProfileSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error(err);
      setProfileError(
        'Could not reach the server. Your details are held on this device and will be saved as soon as you are back online.'
      );
      setAutosaveStatus('error');
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

    // An order of extras is an order for an invoice, and an invoice needs a
    // GSTIN that is real. A missing or mistyped one stops the submission here
    // rather than at the server, which would say the same thing more slowly.
    const submitGstinProblem = gstinProblem();
    if (submitGstinProblem) {
      setGstinError(submitGstinProblem);
      document.getElementById('section-summary')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      document.getElementById('exhibitor-gstin')?.focus({ preventScroll: true });
      return;
    }
    setGstinError('');

    // A pending autosave holds the same edits. Cancel it so it cannot fire
    // behind this submission and race it against the same row.
    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
      autosaveTimeoutRef.current = null;
    }

    setExtrasSaving(true);

    const profilePayload = buildProfilePayload();
    const extrasPayload = buildExtrasPayload();
    rememberDraft(profilePayload, extrasPayload);

    try {
      // Profile first, and its result is checked. It used to be fired and
      // ignored, so a failed profile write still reported a successful
      // submission and the name, stall size and fascia names were silently lost.
      const profRes = await postJsonWithRetry('/api/exhibitor/profile', profilePayload);
      if (!profRes.ok) {
        const profData = await profRes.json().catch(() => ({}));
        setAutosaveStatus('error');
        setNameError(
          profData.error || 'Your profile details could not be saved. Please try again.'
        );
        const profileSection = document.getElementById('section-profile');
        if (profileSection) {
          profileSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        return;
      }

      const res = await postJsonWithRetry('/api/exhibitor/extras', extrasPayload);
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        hasUnsavedEditsRef.current = false;
        forgetDraft();
        setAutosaveStatus('saved');
        setExtrasSuccessMsg('Your requirements have been submitted successfully!');
        setLastSubmittedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        // Confirm over the whole page. The inline message sits far above the
        // sticky submit bar, so on a phone it was submitted into thin air.
        setRedirectSeconds(POST_SUBMIT_REDIRECT_SECONDS);
        setSubmitConfirmed(true);
      } else {
        setAutosaveStatus('error');
        alert(data.error || 'Failed to submit requirements.');
      }
    } catch (err) {
      console.error(err);
      setAutosaveStatus('error');
      alert(
        'Could not reach the server. Your entries are saved on this device and will be submitted automatically once you are back online.'
      );
    } finally {
      setExtrasSaving(false);
    }
  };

  // Once submitted, take the exhibitor back to the exhibition site. The count
  // is visible and can be cancelled, so nobody is thrown off the page mid-task.
  useEffect(() => {
    if (!submitConfirmed) return;

    if (redirectSeconds <= 0) {
      router.push(POST_SUBMIT_DESTINATION);
      return;
    }

    const timer = setTimeout(() => setRedirectSeconds((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [submitConfirmed, redirectSeconds, router]);

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

        {/* Work recovered from a visit that could not reach the server */}
        {restoredDraftNotice && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-start gap-2.5 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{restoredDraftNotice}</span>
          </div>
        )}

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
                Exhibitor stall details and extra requirements <strong className="text-red-700 font-black">CANNOT be edited or modified after {STRICT_CUTOFF_DATE}</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-amber-300 shadow-2xs text-xs font-mono font-bold text-amber-950 self-stretch sm:self-auto justify-center whitespace-nowrap shrink-0">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Cutoff: {STRICT_CUTOFF_DATE}</span>
          </div>
        </div>

        {/* Extras ordered with no usable GSTIN — the one thing holding up the order */}
        {gstinRequired && !gstinIsComplete && (
          <div
            role="alert"
            className="bg-red-50 border-2 border-red-300 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-red-100 text-red-700 border border-red-300 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-red-900">
                  Your GST number is missing
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 font-medium mt-0.5 max-w-2xl leading-relaxed">
                  You have {totalSelectedItemsCount} extra item{totalSelectedItemsCount === 1 ? '' : 's'} on
                  order. Extras are billed to you, so your requirements{' '}
                  <strong className="text-red-800 font-black">cannot be submitted</strong> until a valid
                  GSTIN is on record — and it must be in before {STRICT_CUTOFF_DATE}.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                document.getElementById('section-summary')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                document.getElementById('exhibitor-gstin')?.focus({ preventScroll: true });
              }}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-600"
            >
              <span>Add GST number</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Stall banner: the draw before it is run, the stall itself after */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-amber-500/40 rounded-2xl p-5 sm:p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg relative overflow-hidden">
          {stallNumber ? (
            <>
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shrink-0">
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-black uppercase tracking-wider mb-1">
                    <span>Stall Allotted</span>
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-white leading-snug">
                    Your stall is
                    <span className="font-mono font-black text-amber-300 text-xl align-middle ml-2">
                      {stallNumber}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {[stallHall, stallZone].filter(Boolean).join(' • ') ||
                      'See exactly where it sits on the SIECC floor plan.'}
                  </p>
                </div>
              </div>

              <Link
                href="/stall-allocation"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>See it on the floor plan</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
              </Link>
            </>
          ) : (
            <>
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
            </>
          )}
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

            {/* Allotted Stall Number Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 block mb-1">
                  Allotted Stall Number
                </span>
                {stallNumber ? (
                  <>
                    <h3 className="text-2xl font-black text-slate-900 font-mono leading-snug">
                      {stallNumber}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {[stallHall, stallZone].filter(Boolean).join(' • ')}
                    </p>
                  </>
                ) : (
                  <h3 className="text-lg font-bold text-slate-400 font-mono leading-snug">
                    Not drawn yet
                  </h3>
                )}
              </div>
              <Link
                href="/stall-allocation"
                className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-800 hover:text-amber-900"
              >
                <span>{stallNumber ? 'View on the floor plan' : 'Go to the lucky draw'}</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
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
                  multiple
                  accept=".png,.jpg,.jpeg,.cdr"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="cdr-logo-file-input"
                  disabled={uploadingFile || uploadedAssets.length >= maxUploadFiles}
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
                    {uploadingFile
                      ? uploadStatusLabel || 'Uploading files...'
                      : 'Drag & drop your CDR / Logo files here'}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    Supported formats: <strong className="text-slate-800">.PNG, .JPG, .JPEG, .CDR</strong> (Up to 50MB each).
                    You can select several at once — up to{' '}
                    <strong className="text-slate-800">{maxUploadFiles} files</strong> in total.
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
                    <span className="text-[11px] font-mono text-amber-800 font-bold block truncate">
                      {uploadStatusLabel || 'Uploading'}: {uploadProgress}%
                    </span>
                  </div>
                ) : (
                  <label
                    htmlFor="cdr-logo-file-input"
                    className={`mt-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md transition-all flex items-center gap-2 ${
                      uploadedAssets.length >= maxUploadFiles
                        ? 'bg-slate-300 text-slate-600 cursor-not-allowed'
                        : 'bg-slate-950 hover:bg-slate-800 text-white cursor-pointer hover:scale-105 active:scale-95'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5 text-amber-400" />
                    <span>
                      {uploadedAssets.length >= maxUploadFiles
                        ? 'File limit reached — remove one to add more'
                        : 'Choose CDR or Logo Files'}
                    </span>
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
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
                    Uploaded Brand Artwork
                  </span>
                  <span className="text-[11px] font-bold font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {uploadedAssets.length} / {maxUploadFiles}
                  </span>
                </div>

                {uploadedAssets.length > 0 ? (
                  <div className="space-y-2.5 max-h-80 overflow-y-auto pr-0.5">
                    {uploadedAssets.map((asset) => (
                      <div
                        key={asset.id}
                        className="p-3 rounded-xl bg-white border border-slate-200 flex items-start justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 shrink-0 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 font-black text-[10px] flex items-center justify-center uppercase shadow-xs">
                            {asset.category === 'cdr' ? 'CDR' : 'IMG'}
                          </div>
                          <div className="min-w-0">
                            <h5 className="text-xs font-bold text-slate-900 leading-snug truncate">
                              {asset.originalFileName}
                            </h5>
                            <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                              <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                              {asset.driveSynced ? 'Saved & synced to Drive' : 'Saved — Drive sync pending'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <a
                            href={asset.storageUrl || asset.driveFileUrl || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold border border-slate-300 transition-all flex items-center gap-1"
                          >
                            <span>View</span>
                            <ExternalLink className="w-3 h-3 text-slate-500" />
                          </a>
                          <button
                            type="button"
                            onClick={() => handleDeleteAsset(asset)}
                            disabled={deletingAssetId === asset.id}
                            aria-label={'Remove ' + asset.originalFileName}
                            className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-all disabled:opacity-50"
                          >
                            {deletingAssetId === asset.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center text-slate-400">
                    <ImageIcon className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="text-xs font-semibold text-slate-600">No artwork file uploaded yet</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Upload your CorelDRAW (.cdr) or high-resolution brand logo files.
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
                  Please upload your vector CorelDRAW (.CDR) or high-resolution logo (.PNG / .JPG). You may
                  upload up to {maxUploadFiles} files — a logo per sub-brand and artwork per fascia. These
                  will be used by the organizing team for your stall fascia printing and promotional catalogue.
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
                  <span>3. Exhibitor &amp; Staff Badges Registration</span>
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
                Submit Your Exhibitor &amp; Staff Badges
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Badges are issued from the official STE 2026 registration portal, not from this
                dashboard. Complete your team&rsquo;s badge registration there to receive your digital
                and physical entry passes.
              </p>
            </div>

            <a
              href="https://eventmanagement.isavgo.com/ste2026-registration"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2.5 shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-400"
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

        {/* Section 5: Live Order Summary */}
        <section id="section-summary" className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-6 lg:p-8 space-y-6 scroll-mt-20 sm:scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">5. Overall Requisition Summary</h2>
              <p className="text-xs text-slate-500">Review your booth configuration, fascia details, and extra amenities</p>
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

          {/* Billing GSTIN — the exhibitor's own number, printed on their bill */}
          <div
            className={`p-4 sm:p-5 rounded-xl border shadow-xs transition-colors ${
              gstinRequired && !gstinIsComplete
                ? 'bg-amber-50 border-amber-300'
                : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-amber-700" />
                  Your GST Number
                  {gstinRequired ? (
                    <span className="text-[10px] font-black text-red-700 normal-case tracking-normal">
                      (required for extras)
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400 normal-case tracking-normal">
                      (optional)
                    </span>
                  )}
                </span>
                <p className="text-xs text-slate-500 mt-1 max-w-md leading-relaxed">
                  {gstinRequired
                    ? 'Extra items are billed to you, so your firm’s GSTIN is needed before this order can be submitted. It is printed on your tax bill, which is what lets you claim the GST back.'
                    : 'Add your firm’s GSTIN and it is printed on your extras tax bill, so the invoice can be claimed against your own GST. It becomes compulsory as soon as you order an extra item.'}
                </p>
              </div>

              <div className="w-full sm:w-72 shrink-0">
                <label htmlFor="exhibitor-gstin" className="sr-only">
                  Your firm&rsquo;s GSTIN
                </label>
                <input
                  id="exhibitor-gstin"
                  type="text"
                  inputMode="text"
                  autoComplete="off"
                  spellCheck={false}
                  maxLength={15}
                  value={gstin}
                  onChange={(e) => handleGstinChange(e.target.value)}
                  placeholder="e.g. 24AFOFS4061C1Z3"
                  required={gstinRequired}
                  aria-required={gstinRequired || undefined}
                  aria-invalid={gstinError ? true : undefined}
                  aria-describedby={gstinError ? 'exhibitor-gstin-error' : 'exhibitor-gstin-hint'}
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border font-mono text-sm tracking-wider text-slate-900 placeholder-slate-400 uppercase focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                    gstinError
                      ? 'border-red-400 focus:ring-red-500/40 focus:border-red-500'
                      : gstinIsComplete
                      ? 'border-emerald-400 focus:ring-emerald-500/40 focus:border-emerald-500'
                      : gstinRequired
                      ? 'border-amber-400 focus:ring-amber-500/50 focus:border-amber-500'
                      : 'border-slate-300 focus:ring-amber-500/50 focus:border-amber-500'
                  }`}
                />

                {gstinError ? (
                  <p id="exhibitor-gstin-error" className="mt-1.5 text-[11px] font-bold text-red-700 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{gstinError}</span>
                  </p>
                ) : gstinIsComplete ? (
                  <p id="exhibitor-gstin-hint" className="mt-1.5 text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Valid GSTIN — it will appear on your bill</span>
                  </p>
                ) : gstin.length === 15 ? (
                  <p id="exhibitor-gstin-hint" className="mt-1.5 text-[11px] font-bold text-red-700 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{checkGstin(gstin).reason}</span>
                  </p>
                ) : (
                  <p id="exhibitor-gstin-hint" className="mt-1.5 text-[11px] text-slate-500 font-medium">
                    {gstin ? `${gstin.length} / 15 characters` : '15 characters, saved with your requirements'}
                  </p>
                )}
              </div>
            </div>
          </div>

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
                {gstinRequired && !gstinIsComplete && (
                  <span className="ml-1.5 text-red-700 font-black whitespace-nowrap">
                    • GST number needed
                  </span>
                )}
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

      {/* Submission confirmation — full screen so it cannot be missed on a phone */}
      {submitConfirmed && (
        <div className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl border border-emerald-200 shadow-2xl p-6 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center">
              <CheckCircle2 className="w-9 h-9 text-emerald-600" />
            </div>

            <h2 className="mt-4 text-xl font-black text-slate-900">
              Requirements submitted
            </h2>
            <p className="mt-2 text-sm text-slate-600 font-medium">
              Everything you filled in — your details, stall and fascia names and
              extra items — has been saved to the STE 2026 organisers.
            </p>

            <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200 p-3 text-left space-y-1.5">
              <p className="text-xs text-slate-700 font-semibold flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Profile, stall size and fascia names saved</span>
              </p>
              <p className="text-xs text-slate-700 font-semibold flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>
                  {totalSelectedItemsCount} extra item
                  {totalSelectedItemsCount === 1 ? '' : 's'} recorded
                </span>
              </p>
            </div>

            <p className="mt-4 text-xs text-slate-500 font-medium">
              Taking you back to the STE 2026 website in {redirectSeconds}s…
            </p>

            <div className="mt-4 flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={() => router.push(POST_SUBMIT_DESTINATION)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
              >
                <span>Back to website</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setSubmitConfirmed(false)}
                className="flex-1 px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-bold text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
              >
                Stay and keep editing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Tax Invoice / Bill Modal */}
      <BillModal
        isOpen={showBillModal}
        onClose={() => setShowBillModal(false)}
        brandName={brandName || "Registered Exhibitor"}
        mobile={mobile}
        stallSqft={selectedSqftOption === 'Other' ? (customSqft ? `${customSqft} sq ft` : '200 sq ft') : `${selectedSqftOption} sq ft`}
        fasciaNames={fasciaNames}
        gstin={gstinIsComplete ? gstin : ''}
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
