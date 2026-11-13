import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { useUiStore } from '../store/uiStore.js';
import { Mail, ArrowRight, Radio, ArrowLeft, ShieldCheck } from 'lucide-react';

export const EmailVerifyPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyEmailOtp, isLoading } = useAuthStore();
  const { showToast } = useUiStore();

  const email = (location.state as any)?.email || '';
  const name = (location.state as any)?.name || '';
  const devOtp = (location.state as any)?.devOtp;

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasted)) {
      setCode(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      showToast('error', 'Please enter all 6 digits');
      return;
    }

    try {
      await verifyEmailOtp(email, fullCode);
      showToast('success', 'Email verified! Welcome to Orbit.');

      // Post-login navigation: profile-setup if no profile, else dashboard
      const { profile } = useAuthStore.getState();
      if (!profile) navigate('/profile-setup');
      else navigate('/dashboard');
    } catch (err: any) {
      showToast('error', err.message || 'Invalid or expired verification code');
    }
  };

  if (!email) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-sm text-slate-400 mb-4">No email to verify. Please register first.</p>
          <Link to="/register" className="text-indigo-400 font-semibold text-sm hover:text-indigo-300">
            Go to Registration
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 py-8">
      <div className="relative w-full max-w-md p-8 rounded-3xl bg-[#121824]/90 border border-white/10 backdrop-blur-xl shadow-2xl">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-400 p-[1px] shadow-xl shadow-indigo-500/20 mb-4">
            <div className="flex h-full w-full items-center justify-center rounded-[15px] bg-[#0a0d14]">
              <Mail className="h-7 w-7 text-cyan-400" />
            </div>
          </div>
          <h2 className="text-2xl font-extrabold text-white">Verify Your Email</h2>
          <p className="mt-1.5 text-xs text-slate-400">
            We sent a 6-digit code to{' '}
            <span className="text-indigo-400 font-semibold">{email}</span>
          </p>
          {devOtp && (
            <div className="mt-3 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
              <p className="text-[11px] text-cyan-300 font-mono">Dev OTP: {devOtp}</p>
            </div>
          )}
        </div>

        {/* OTP Inputs */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex gap-2 justify-center" onPaste={handlePaste}>
            {code.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="w-11 h-14 text-center text-xl font-bold rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={isLoading || code.join('').length !== 6}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            {isLoading ? 'Verifying...' : 'Verify & Activate Account'}
            <ShieldCheck className="h-4 w-4" />
          </button>

          {/* Back to register */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Use a different email
            </button>
          </div>
        </form>

        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-slate-400">
          <Radio className="h-3.5 w-3.5 text-indigo-400" />
          <span>The code expires in 5 minutes</span>
        </div>
      </div>
    </div>
  );
};
