import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { useUiStore } from '../store/uiStore.js';
import { Lock, Eye, EyeOff, ArrowRight, ArrowLeft, Radio, ShieldCheck } from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { resetPassword, isLoading } = useAuthStore();
  const { showToast } = useUiStore();

  const email = (location.state as any)?.email || '';
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
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
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
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
    const errs: Record<string, string> = {};
    if (fullCode.length !== 6) errs.code = 'Please enter all 6 digits';
    if (!newPassword) errs.password = 'New password is required';
    else if (newPassword.length < 8) errs.password = 'Password must be at least 8 characters';
    if (newPassword !== confirmPassword) errs.confirm = 'Passwords do not match';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      await resetPassword(email, fullCode, newPassword);
      showToast('success', 'Password updated successfully! Please log in with your new password.');
      navigate('/login');
    } catch (err: any) {
      showToast('error', err.message || 'Password reset failed');
    }
  };

  if (!email) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-sm text-slate-400 mb-4">No email associated with this reset request.</p>
          <Link to="/forgot-password" className="text-indigo-400 font-semibold text-sm hover:text-indigo-300">
            Request a reset code
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
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-500 to-orange-400 p-[1px] shadow-xl shadow-rose-500/20 mb-4">
            <div className="flex h-full w-full items-center justify-center rounded-[15px] bg-[#0a0d14]">
              <Lock className="h-7 w-7 text-rose-400" />
            </div>
          </div>
          <h2 className="text-2xl font-extrabold text-white">Reset Your Password</h2>
          <p className="mt-1.5 text-xs text-slate-400">
            Enter the 6-digit code sent to{' '}
            <span className="text-indigo-400 font-semibold">{email}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* OTP Code */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Reset Code</label>
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
                  className="w-11 h-14 text-center text-xl font-bold rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/30"
                />
              ))}
            </div>
            {errors.code && <p className="mt-1.5 text-[11px] text-rose-400 text-center">{errors.code}</p>}
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
                autoComplete="new-password"
                className="w-full pl-10 pr-11 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="mt-1.5 text-[11px] text-rose-400">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Confirm New Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your new password"
                required
                autoComplete="new-password"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
              />
            </div>
            {errors.confirm && <p className="mt-1.5 text-[11px] text-rose-400">{errors.confirm}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-bold text-sm shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            {isLoading ? 'Updating...' : 'Update Password'}
            <ShieldCheck className="h-4 w-4" />
          </button>

          <div className="text-center pt-2">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Login
            </Link>
          </div>
        </form>

        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-slate-400">
          <Radio className="h-3.5 w-3.5 text-indigo-400" />
          <span>Never share your reset code with anyone</span>
        </div>
      </div>
    </div>
  );
};
