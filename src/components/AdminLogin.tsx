import React, { useState } from 'react';
import { Lock, KeyRound, User, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { adminLogin } from '../services/api';

interface AdminLoginProps {
  lang: 'fa' | 'en';
  onLoginSuccess: (token: string) => void;
  onCancel: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ lang, onLoginSuccess, onCancel }) => {
  const [username, setUsername] = useState('');
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
      const data = await adminLogin(password.trim(), username.trim());
      if (data.success && data.token) {
        localStorage.setItem('ritm_admin_token', data.token);
        onLoginSuccess(data.token);
      } else {
        setError(data.error || (lang === 'fa' ? 'نام کاربری یا رمز عبور مدیریت نادرست است.' : 'Invalid credentials.'));
      }
    } catch (err: any) {
      setError(lang === 'fa' ? 'خطا در ارتباط با سرور.' : 'Connection error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-10 px-4">
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl text-center relative overflow-hidden">
        {/* Glow */}
        <div className="w-16 h-16 rounded-2xl bg-[#d0bcff]/15 border border-[#d0bcff]/30 flex items-center justify-center mx-auto mb-4 text-[#d0bcff]">
          <Lock className="w-7 h-7" />
        </div>

        <span className="font-mono text-xs text-[#d0bcff] uppercase tracking-wider block mb-1">
          {lang === 'fa' ? 'احراز هویت مدیریت' : 'Management Authentication'}
        </span>

        <h2 className="text-xl sm:text-2xl font-bold text-[#e5e2e1] mb-2">
          {lang === 'fa' ? 'ورود به پنل مدیریت ریتم' : 'RITM Admin Portal'}
        </h2>

        <p className="text-xs text-[#958ea0] mb-6 leading-relaxed">
          {lang === 'fa'
            ? 'لطفاً نام کاربری و رمز عبور امنیتی مدیریت را وارد فرمایید.'
            : 'Enter your administrator username and password to proceed.'}
        </p>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs text-right">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-right">
          <div>
            <label className="block text-xs font-semibold text-[#958ea0] mb-1.5">
              {lang === 'fa' ? 'نام کاربری مدیریت:' : 'Admin Username:'}
            </label>
            <div className="relative">
              <input
                type="text"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={lang === 'fa' ? 'نام کاربری' : 'Username'}
                className="w-full bg-black/50 border border-white/15 focus:border-[#d0bcff] rounded-xl px-4 py-2.5 text-xs text-[#e5e2e1] outline-none dir-ltr text-left font-mono"
              />
              <User className="w-4 h-4 text-[#958ea0] absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#958ea0] mb-1.5">
              {lang === 'fa' ? 'رمز عبور مدیریت:' : 'Admin Password:'}
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-black/50 border border-white/15 focus:border-[#d0bcff] rounded-xl px-4 py-2.5 text-xs text-[#e5e2e1] outline-none dir-ltr text-left font-mono"
              />
              <KeyRound className="w-4 h-4 text-[#958ea0] absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#d0bcff] hover:bg-[#d0bcff]/90 text-[#131313] font-bold text-xs transition-all shadow-lg shadow-[#d0bcff]/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-[#131313] border-t-transparent rounded-full animate-spin" />
                  <span>{lang === 'fa' ? 'در حال بررسی...' : 'Verifying...'}</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>{lang === 'fa' ? 'ورود به پنل مدیریت' : 'Enter Admin Hub'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onCancel}
              className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#958ea0] hover:text-white text-xs transition-colors cursor-pointer"
            >
              {lang === 'fa' ? 'بازگشت' : 'Cancel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
