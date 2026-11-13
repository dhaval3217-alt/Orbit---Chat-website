import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { useUiStore } from '../store/uiStore.js';
import { Phone, ArrowRight, Shield, Radio, Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { sendOtp, loginWithEmail, isLoading } = useAuthStore();
  const { showToast } = useUiStore();

  // Tab state: 'email' (primary) or 'phone' (secondary)
  const [tab, setTab] = useState<'email' | 'phone'>('email');

  // Email login form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Phone OTP form
  const [phone, setPhone] = useState('+15551234567');

  // ─── Email + Password Login ─────────────────────────────────
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    try {
      await loginWithEmail(email, password, rememberMe);
      showToast('success', 'Welcome back to Orbit!');

      // Post-login navigation: profile-setup if no profile, else dashboard
      const { profile } = useAuthStore.getState();
      if (!profile) navigate('/profile-setup');
      else navigate('/dashboard');
    } catch (err: any) {
      showToast('error', err.message || 'Login failed. Check your credentials.');
    }
  };

  // ─── Phone OTP (existing flow — unchanged) ──────────────────
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;

    try {
      const res = await sendOtp(phone);
      if (res.devOtp) {
        showToast('info', `Mock Dev Verification Code: ${res.devOtp}`, 'OTP Dispatched');
      } else {
        showToast('success', 'Verification code sent to your phone.');
      }
      navigate('/verify-otp', { state: { phone, devOtp: res.devOtp } });
    } catch (err: any) {
      showToast('error', err.message || 'Failed to send OTP code');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 py-8">
      <div className="relative w-full max-w-md p-8 rounded-3xl bg-[#121824]/90 border border-white/10 backdrop-blur-xl shadow-2xl">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-400 p-[1px] shadow-xl shadow-indigo-500/20 mb-4">
            <div className="flex h-full w-full items-center justify-center rounded-[15px] bg-[#0a0d14]">
              <Radio className="h-7 w-7 text-indigo-400" />
            </div>
          </div>
          <h2 className="text-2xl font-extrabold text-white">Welcome to Orbit</h2>
          <p className="mt-1.5 text-xs text-slate-400">
            Sign in to continue your journey across the Orbit universe.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex mb-6 p-1 rounded-xl bg-white/5 border border-white/10">
          <button
            type="button"
            onClick={() => setTab('email')}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${
              tab === 'email'
                ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Email & Password
          </button>
          <button
            type="button"
            onClick={() => setTab('phone')}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${
              tab === 'phone'
                ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Phone OTP
          </button>
        </div>

        {tab === 'email' ? (
          /* ─── Email + Password Login Form ─── */
          <form onSubmit={handleEmailLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Gmail Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  required
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-11 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me + Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded accent-indigo-500 bg-white/5 border-white/20"
                />
                <span className="text-xs text-slate-400">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
              >
                Forgot password?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Login'}
              <ArrowRight className="h-4 w-4" />
            </button>

            {/* Create Account Link */}
            <div className="text-center pt-2">
              <p className="text-xs text-slate-400">
                Don't have an account?{' '}
                <Link to="/register" className="font-semibold text-indigo-400 hover:text-indigo-300">
                  Create Account
                </Link>
              </p>
            </div>
          </form>
        ) : (
          /* ─── Phone OTP Form (existing — unchanged) ─── */
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+15551234567"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <p className="mt-1.5 text-[11px] text-slate-400">
                Dev tip: test with <code className="text-indigo-400">+15550000000</code> for Admin, or any valid phone.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              {isLoading ? 'Sending code...' : 'Continue with Phone'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-slate-400">
          <Shield className="h-3.5 w-3.5 text-emerald-400" />
          <span>Secure authentication • Your data stays encrypted</span>
        </div>
      </div>
    </div>
  );
};
