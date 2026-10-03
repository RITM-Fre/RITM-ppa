import React from 'react';
import { Shield, Lock } from 'lucide-react';
import { SOCIAL_LINKS } from '../data/mockData';

interface FooterProps {
  lang: 'fa' | 'en';
  onOpenAdminLogin?: () => void;
  isAdminLoggedIn?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ lang, onOpenAdminLogin, isAdminLoggedIn = false }) => {
  return (
    <footer className="w-full border-t border-white/[0.08] mt-auto pt-8 pb-36 sm:pb-32 md:pb-10 bg-[#0e1017] text-[#958ea0]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-xs">
        {/* Brand Lockup */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full overflow-hidden bg-white/5 border border-white/10 p-0.5 flex items-center justify-center">
            <img src={`${import.meta.env.BASE_URL}assets/logo.png`} alt="RITM" className="w-full h-full object-contain" />
          </div>
          <span className="text-[#e5e2e1] font-bold">
            {lang === 'fa' ? 'ریتم — آژانس خلاقیت دیجیتال' : 'RITM — Digital Agency'}
          </span>
        </div>

        {/* Social Links */}
        <div className="flex flex-wrap items-center justify-center gap-4 dir-ltr font-mono text-xs">
          <a
            href={SOCIAL_LINKS.telegramChannel}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#d0bcff] transition-colors"
          >
            Telegram
          </a>
          <span className="text-white/20">·</span>
          <a
            href={SOCIAL_LINKS.youtube}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#d0bcff] transition-colors"
          >
            YouTube
          </a>
          <span className="text-white/20">·</span>
          <a
            href={SOCIAL_LINKS.x}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#d0bcff] transition-colors"
          >
            X (Twitter)
          </a>
          <span className="text-white/20">·</span>
          <a
            href={SOCIAL_LINKS.ble}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#d0bcff] transition-colors"
          >
            Bale
          </a>
        </div>

        {/* Admin Login Button & Copyright */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto justify-center sm:justify-end">
          {onOpenAdminLogin && (
            <button
              onClick={onOpenAdminLogin}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/15 hover:border-[#d0bcff]/50 text-xs text-[#b8b3c4] hover:text-[#d0bcff] transition-all cursor-pointer font-medium active:scale-95 shadow-sm"
              title="ورود به پنل مدیریت ریتم"
            >
              {isAdminLoggedIn ? (
                <>
                  <Shield className="w-3.5 h-3.5 text-[#a3e635]" />
                  <span>{lang === 'fa' ? 'پنل ادمین (فعال)' : 'Admin Hub'}</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-[#ffb869]" />
                  <span>{lang === 'fa' ? 'ورود به پنل ادمین' : 'Admin Login'}</span>
                </>
              )}
            </button>
          )}

          <div className="font-mono text-[11px] text-[#71717a]">
            © {new Date().getFullYear()} RITM.
          </div>
        </div>
      </div>
    </footer>
  );
};
