'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Phone, ArrowRight, ShieldCheck, Sparkles, Building2, Crown, Store, KeyRound, CheckCircle2, X } from 'lucide-react';

export default function ExhibitorLoginPage() {
  const router = useRouter();
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAdminChoiceModal, setShowAdminChoiceModal] = useState(false);

  // Reset Password Modal States
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetMobile, setResetMobile] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const handleOpenReset = () => {
    setResetMobile(mobile);
    setNewPassword('');
    setConfirmPassword('');
    setResetError('');
    setResetSuccess('');
    setShowResetModal(true);
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');

    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match. Please re-type.');
      return;
    }

    if (newPassword.length < 4) {
      setResetError('Password must be at least 4 characters.');
      return;
    }

    setResetLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: resetMobile, new_password: newPassword })
      });

      const data = await res.json();
      if (!res.ok) {
        setResetError(data.error || 'Failed to update password.');
        setResetLoading(false);
        return;
      }

      setResetSuccess('Password updated successfully! Redirecting...');
      setTimeout(() => {
        if (data.isAdmin) {
          setShowResetModal(false);
          setShowAdminChoiceModal(true);
        } else {
          router.push('/exhibitor/dashboard');
        }
      }, 1200);
    } catch (err) {
      console.error(err);
      setResetError('Connection error. Please try again.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, password })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed. Please check your credentials.');
        setLoading(false);
        return;
      }

      if (data.isAdmin) {
        setLoading(false);
        setShowAdminChoiceModal(true);
      } else {
        router.push('/exhibitor/dashboard');
      }
    } catch (err) {
      console.error(err);
      setError('Connection error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background Glow Accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-amber-400/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[300px] bg-emerald-400/15 blur-[100px] rounded-full pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center items-center gap-2 mb-2">
          <span className="px-3 py-1 bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold uppercase tracking-wider rounded-full flex items-center gap-1.5 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            STE 2026 Portal
          </span>
        </div>
        <h2 className="mt-2 text-center text-3xl font-extrabold tracking-tight text-slate-900 font-serif">
          Exhibitor Portal Login
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600 font-medium">
          Access your stall details & request additional exhibition extras
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-white border border-slate-200 py-8 px-6 shadow-xl rounded-2xl sm:px-10">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-2 font-medium">
              <span className="font-bold">Error:</span> {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="mobile" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Mobile Number / User ID
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="h-5 w-5" />
                </div>
                <input
                  id="mobile"
                  name="mobile"
                  type="text"
                  required
                  placeholder="Enter 10-digit mobile number or User ID (e.g. SSS)"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 focus:bg-white transition-all text-base md:text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Exhibitor Password
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 focus:bg-white transition-all text-base md:text-sm font-medium"
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-xs">
                <p className="text-slate-500 flex items-center gap-1 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  Default pass: <span className="font-mono text-amber-800 font-bold">ste@2026</span>
                </p>
                <button
                  type="button"
                  onClick={handleOpenReset}
                  className="text-amber-700 hover:text-amber-800 font-bold underline underline-offset-2 flex items-center gap-1 transition-colors"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Set / Forgot Password?</span>
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-amber-500/30 rounded-xl shadow-lg text-sm font-semibold text-neutral-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all transform active:scale-[0.99] disabled:opacity-50"
              >
                {loading ? (
                  <span>Logging in...</span>
                ) : (
                  <>
                    <span>Enter Exhibitor Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 border-t border-neutral-800/80 pt-6 text-center text-xs text-neutral-500 flex justify-center items-center gap-2">
            <Building2 className="w-4 h-4 text-neutral-400" />
            <span>Surat Textile Expo 2026 — Official Organizers</span>
          </div>
        </div>
      </div>

      {/* Reset / Create Custom Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-black/85 md:backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setShowResetModal(false)}
              className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-full bg-neutral-800/50 hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4 text-amber-400">
              <KeyRound className="w-6 h-6" />
            </div>

            <h3 className="text-2xl font-bold text-white mb-1 font-serif tracking-tight">
              Create / Reset Password
            </h3>
            <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
              Enter your registered mobile number and set your custom login password.
            </p>

            {resetError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
                <span className="font-bold">Error:</span> {resetError}
              </div>
            )}

            {resetSuccess && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{resetSuccess}</span>
              </div>
            )}

            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Registered Mobile Number / User ID
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                    <Phone className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Enter registered mobile number or User ID (e.g. SSS)"
                    value={resetMobile}
                    onChange={(e) => setResetMobile(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                  New Custom Password
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="Type new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="Re-type new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 text-xs"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-amber-500/30 rounded-xl shadow-lg text-xs font-bold text-neutral-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 transition-all disabled:opacity-50"
                >
                  {resetLoading ? 'Saving Password...' : 'Save New Password & Log In'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Access Choice Modal */}
      {showAdminChoiceModal && (
        <div className="fixed inset-0 z-50 bg-black/85 md:backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-2xl rounded-full pointer-events-none" />

            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/30 flex items-center justify-center mx-auto mb-4 text-amber-400 shadow-inner">
              <Crown className="w-7 h-7" />
            </div>

            <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest rounded-full inline-block mb-2">
              Admin Access Granted
            </span>

            <h3 className="text-2xl font-bold text-white mb-2 font-serif tracking-tight">
              Select Your Destination
            </h3>
            <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
              Logged in as Admin Mobile <span className="font-mono text-amber-300 font-bold">{mobile}</span>. Choose which console to open:
            </p>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => router.push('/admin/exhibitors')}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent hover:from-amber-500/30 hover:to-amber-500/10 border border-amber-500/40 rounded-2xl text-left transition-all group shadow-md"
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 group-hover:scale-110 transition-transform">
                    <Crown className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                      Organizer Admin Console
                    </div>
                    <div className="text-xs text-neutral-400">
                      View all exhibitors & item-wise total quantities
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => router.push('/exhibitor/dashboard')}
                className="w-full flex items-center justify-between p-4 bg-neutral-950/80 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 rounded-2xl text-left transition-all group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 rounded-xl bg-neutral-800 text-neutral-300 group-hover:scale-110 transition-transform">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white group-hover:text-amber-200 transition-colors">
                      Exhibitor Portal
                    </div>
                    <div className="text-xs text-neutral-400">
                      Manage your own stall & extra item requirements
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
