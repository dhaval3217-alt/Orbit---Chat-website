import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { useUiStore } from '../store/uiStore.js';
import { KeyRound, ArrowRight, ArrowLeft } from 'lucide-react';

export const OtpVerifyPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyOtp, isLoading, error } = useAuthStore();
  const { showToast } = useUiStore();

  const phone = (location.state as any)?.phone || '+15551234567';
  const devOtp = (location.state as any)?.devOtp || '123456';
  const [code, setCode] = useState(devOtp);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return;

    try {
      await verifyOtp(phone, code);
      showToast('success', 'Logged in successfully!');
      
      const { profile } = useAuthStore.getState();
      if (!profile) {
        navigate('/profile-setup');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Verification failed');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="relative w-full max-w-md p-8 rounded-3xl bg-[#121824]/90 border border-white/10 backdrop-blur-xl shadow-2xl">
        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Change Phone Number
        </button>

        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 mb-4">
            <KeyRound className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Enter Verification Code</h2>
          <p className="mt-1.5 text-xs text-slate-400">
            We sent a 6-digit verification code to <span className="text-slate-200 font-semibold">{phone}</span>
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {devOtp && (
          <div className="mb-5 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs flex items-center justify-between">
            <span>Dev Mock OTP: <strong className="text-white">{devOtp}</strong></span>
            <button
              type="button"
              onClick={() => setCode(devOtp)}
              className="text-[11px] underline hover:text-white"
            >
              Fill Code
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              6-Digit Code
            </label>
            <input
              type="text"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              required
              className="w-full text-center tracking-[0.6em] text-2xl font-bold py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || code.length !== 6}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            {isLoading ? 'Verifying...' : 'Verify & Continue'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
