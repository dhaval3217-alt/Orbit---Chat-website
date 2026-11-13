import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { useUiStore } from '../store/uiStore.js';
import { Mail, ArrowRight, Radio, ArrowLeft, MailCheck } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { forgotPassword, isLoading } = useAuthStore();
  const { showToast } = useUiStore();

  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      await forgotPassword(email);
      setSent(true);
      showToast('success', 'If an account exists, a reset code has been sent to your email.');
    } catch (err: any) {
      showToast('error', err.message || 'Request failed');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 py-8">
      <div className="relative w-full max-w-md p-8 rounded-3xl bg-[#121824]/90 border border-white/10 backdrop-blur-xl shadow-2xl">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-500 to-orange-400 p-[1px] shadow-xl shadow-rose-500/20 mb-4">
            <div className="flex h-full w-full items-center justify-center rounded-[15px] bg-[#0a0d14]">
              <Mail className="h-7 w-7 text-rose-400" />
            </div>
          </div>
          <h2 className="text-2xl font-extrabold text-white">Forgot Password?</h2>
          <p className="mt-1.5 text-xs text-slate-400">
            {sent
              ? 'Check your email for the reset code.'
              : 'Enter your registered Gmail and we\'ll send you a reset code.'}
          </p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Registered Gmail Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  required
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-bold text-sm shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              {isLoading ? 'Sending...' : 'Send Reset Code'}
              <ArrowRight className="h-4 w-4" />
            </button>

            <div className="text-center pt-2">
              <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200">
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Login
              </Link>
            </div>
          </form>
        ) : (
          <div className="space-y-4 text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <MailCheck className="h-8 w-8 text-emerald-400" />
              </div>
            </div>
            <p className="text-sm text-slate-300">
              A 6-digit reset code has been sent to{' '}
              <span className="text-indigo-400 font-semibold">{email}</span>
            </p>
            <button
              type="button"
              onClick={() => navigate('/reset-password', { state: { email } })}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              Enter Reset Code
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-slate-400">
          <Radio className="h-3.5 w-3.5 text-indigo-400" />
          <span>Never share your reset code with anyone</span>
        </div>
      </div>
    </div>
  );
};
