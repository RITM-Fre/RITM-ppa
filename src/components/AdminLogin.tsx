import React, { useState } from 'react';
import { Shield, KeyRound, ArrowLeft, ArrowRight, Lock, CheckCircle2 } from 'lucide-react';
import { adminLogin } from '../services/api';

interface AdminLoginProps {
  lang: 'fa' | 'en';
  onLoginSuccess: (token: string) => void;
  onCancel: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ lang, onLoginSuccess, onCancel }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password.trim()) {
      setError(lang === 'fa' ? 'لطفاً رمز عبور را وارد کنید.' : 'Please enter password.');
      return;
    }

    setLoading(true);
    try {
      const data = await adminLogin(password.trim());
      if (data.success && data.token) {
        localStorage.setItem('ritm_admin_token', data.token);
        onLoginSuccess(data.token);
      } else {
        setError(data.error || (lang === 'fa' ? 'رمز عبور مدیریت نادرست است.' : 'Invalid admin password.'));
      }
    } catch (err: any) {
      setError(lang === 'fa' ? 'خطا در ارتباط.' : 'Connection error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="glass-panel rounded-3xl p-8 border border-white/10 shadow-2xl text-center relative overflow-hidden">
        {/* Glow */}
        <div className="w-20 h-20 rounded-full bg-[#d0bcff]/15 border border-[#d0bcff]/30 flex items-center justify-center mx-auto mb-6 text-[#d0bcff]">
          <Lock className="w-8 h-8" />
        </div>

        <span className="font-mono text-xs text-[#d0bcff] uppercase tracking-wider block mb-1">
          {lang === 'fa' ? 'دسترسی حفاظت‌شده' : 'Restricted Access'}
        </span>

        <h2 className="text-2xl font-bold text-[#e5e2e1] mb-2">
          {lang === 'fa' ? 'ورود به پنل مدیریت ریتم' : 'RITM Admin Portal'}
        </h2>

        <p className="text-xs text-[#958ea0] mb-8 leading-relaxed">
          {lang === 'fa'
            ? 'این پنل مختص مدیریت استودیو ریتم است. لطفاً رمز عبور ادمین را وارد نمایید.'
            : 'This section is strictly reserved for RITM management. Enter security password to proceed.'}
        </p>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-right">
          <div>
            <label className="block text-xs font-semibold text-[#958ea0] mb-1.5">
              {lang === 'fa' ? 'رمز عبور پنل مدیریت:' : 'Admin Password:'}
            </label>
            <div className="relative">
              <input
                type="password"
                required
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-black/50 border border-white/15 focus:border-[#d0bcff] rounded-xl px-4 py-3 text-sm text-[#e5e2e1] outline-none font-mono tracking-wider dir-ltr text-left"
              />
              <KeyRound className="w-4 h-4 text-[#958ea0] absolute left-3 top-3.5 pointer-events-none" />
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#d0bcff] hover:bg-[#d0bcff]/90 text-[#131313] font-bold text-xs transition-all shadow-lg shadow-[#d0bcff]/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-[#131313] border-t-transparent rounded-full animate-spin" />
                  <span>{lang === 'fa' ? 'در حال بررسی...' : 'Verifying...'}</span>
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  <span>{lang === 'fa' ? 'ورود به داشبورد مدیریت' : 'Authenticate & Enter'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onCancel}
              className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-[#958ea0] hover:text-[#e5e2e1] transition-all"
            >
              {lang === 'fa' ? 'انصراف و بازگشت به سایت' : 'Cancel & Return'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
