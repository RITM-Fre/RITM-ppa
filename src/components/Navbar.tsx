import React, { useState, useEffect } from 'react';
import {
  Home,
  ShoppingBag,
  FolderKanban,
  Clock,
  Send,
  Globe,
  Shield,
  Terminal,
  LogOut,
  User,
  Lock,
} from 'lucide-react';
import { AuthUser } from '../types';

interface NavbarProps {
  activeTab: 'home' | 'order' | 'admin' | 'portfolio' | 'status' | 'client';
  setActiveTab: (tab: 'home' | 'order' | 'admin' | 'portfolio' | 'status' | 'client') => void;
  lang: 'fa' | 'en';
  setLang: (lang: 'fa' | 'en') => void;
  pendingCount?: number;
  currentUser?: AuthUser | null;
  isAdminLoggedIn?: boolean;
  onAdminLogout?: () => void;
  onOpenAdminLogin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  lang,
  setLang,
  pendingCount = 0,
  currentUser = null,
  isAdminLoggedIn = false,
  onAdminLogout,
  onOpenAdminLogin,
}) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 24) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ease-out px-3 sm:px-6 ${
        scrolled ? 'pt-2.5 pb-1' : 'pt-3 pb-2'
      }`}
    >
      <div
        className={`mx-auto transition-all duration-300 ease-out flex items-center justify-between ${
          scrolled
            ? 'max-w-5xl h-13 px-4 sm:px-5 rounded-2xl bg-[#0c0e17]/80 backdrop-blur-xl border border-white/15 shadow-[0_12px_36px_rgba(0,0,0,0.65),inset_0_1px_1px_rgba(255,255,255,0.12)]'
            : 'max-w-7xl h-14 px-4 sm:px-6 rounded-2xl bg-[#0e1017]/60 backdrop-blur-lg border border-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.3)]'
        }`}
      >
        {/* Brand / Logo */}
        <div
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-xl overflow-hidden border border-white/20 bg-black/50 p-0.5 flex items-center justify-center transition-transform duration-200 group-hover:scale-105 group-hover:border-[#d0bcff]/80">
            <img
              src={`${import.meta.env.BASE_URL}assets/logo.png`}
              alt="RITM"
              className="w-full h-full object-contain"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-sm sm:text-base font-extrabold tracking-tight text-white group-hover:text-[#d0bcff] transition-colors">
              {lang === 'fa' ? 'استودیو ریتم' : 'RITM Studio'}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#a3e635] shadow-[0_0_8px_#a3e635]" />
          </div>
        </div>

        {/* Center Minimal Navigation (Desktop) */}
        <nav className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-md">
          {/* Home */}
          <button
            onClick={() => setActiveTab('home')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
              activeTab === 'home'
                ? 'bg-white/15 text-white font-semibold shadow-[0_2px_8px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)]'
                : 'text-[#9da3af] hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Home className="w-3.5 h-3.5" strokeWidth={1.75} />
            <span>{lang === 'fa' ? 'خانه' : 'Home'}</span>
          </button>

          {/* Order Project */}
          <button
            onClick={() => setActiveTab('order')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
              activeTab === 'order'
                ? 'bg-[#d0bcff] text-[#0d0f17] font-bold shadow-[0_0_16px_rgba(208,188,255,0.35)]'
                : 'text-[#9da3af] hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" strokeWidth={1.75} />
            <span>{lang === 'fa' ? 'ثبت سفارش' : 'Order'}</span>
          </button>

          {/* Portfolio */}
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
              activeTab === 'portfolio'
                ? 'bg-white/15 text-white font-semibold shadow-[0_2px_8px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)]'
                : 'text-[#9da3af] hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <FolderKanban className="w-3.5 h-3.5" strokeWidth={1.75} />
            <span>{lang === 'fa' ? 'نمونه‌کارها' : 'Portfolio'}</span>
          </button>

          {/* Tracking */}
          <button
            onClick={() => setActiveTab('client')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
              activeTab === 'client'
                ? 'bg-white/15 text-white font-semibold shadow-[0_2px_8px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)]'
                : 'text-[#9da3af] hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-[#adc6ff]" strokeWidth={1.75} />
            <span>{lang === 'fa' ? 'پیگیری سفارش' : 'Track'}</span>
          </button>

          {/* Admin Tabs (Only if logged in) */}
          {isAdminLoggedIn && (
            <>
              <div className="h-3.5 w-[1px] bg-white/15 mx-1" />
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-[#d0bcff]/20 text-[#d0bcff] font-bold border border-[#d0bcff]/40'
                    : 'text-[#d0bcff]/80 hover:text-[#d0bcff] hover:bg-white/5'
                }`}
              >
                <Shield className="w-3.5 h-3.5" strokeWidth={1.75} />
                <span>{lang === 'fa' ? 'ادمین' : 'Admin'}</span>
                {pendingCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-[#ffb869] animate-pulse" />}
              </button>

              <button
                onClick={() => setActiveTab('status')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  activeTab === 'status'
                    ? 'bg-white/15 text-white font-bold'
                    : 'text-[#9da3af] hover:text-white hover:bg-white/5'
                }`}
              >
                <Terminal className="w-3.5 h-3.5 text-[#adc6ff]" strokeWidth={1.75} />
                <span>{lang === 'fa' ? 'لاگ‌ها' : 'Logs'}</span>
              </button>
            </>
          )}
        </nav>

        {/* Right Minimal Actions */}
        <div className="flex items-center gap-2">
          {/* User state */}
          {currentUser ? (
            <button
              onClick={() => setActiveTab('client')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-[#d0bcff] font-medium hover:bg-white/[0.08] transition-colors"
            >
              <User className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span className="max-w-[80px] truncate">{currentUser.username}</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('client')}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs text-white/90 hover:text-white transition-colors cursor-pointer"
            >
              <User className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span>{lang === 'fa' ? 'ورود مشتری' : 'Client Login'}</span>
            </button>
          )}

          {isAdminLoggedIn && (
            <button
              onClick={onAdminLogout}
              className="p-1.5 px-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/25 text-xs flex items-center gap-1 transition-colors cursor-pointer"
              title="خروج ادمین"
            >
              <LogOut className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span className="hidden xl:inline text-[11px]">{lang === 'fa' ? 'خروج' : 'Logout'}</span>
            </button>
          )}

          {/* Language Switcher */}
          <button
            onClick={() => setLang(lang === 'fa' ? 'en' : 'fa')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-white/10 hover:border-white/20 text-xs font-mono text-[#9da3af] hover:text-white transition-colors bg-white/[0.02] cursor-pointer"
            title={lang === 'fa' ? 'تغییر زبان' : 'Switch Language'}
          >
            <Globe className="w-3.5 h-3.5" strokeWidth={1.75} />
            <span>{lang === 'fa' ? 'EN' : 'فا'}</span>
          </button>

          {/* Telegram Glass Button (Channel link) */}
          <a
            href="https://t.me/RITM_FreeLancer"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#229ed9]/90 to-[#0088cc]/90 hover:from-[#229ed9] hover:to-[#0088cc] border border-[#38bdf8]/30 text-white text-xs font-semibold shadow-[0_4px_16px_rgba(34,158,217,0.25)] hover:shadow-[0_4px_20px_rgba(34,158,217,0.4)] transition-all cursor-pointer whitespace-nowrap active:scale-95"
            title="کانال رسمی تلگرام استودیو ریتم"
          >
            <Send className="w-3.5 h-3.5" strokeWidth={1.75} />
            <span className="hidden sm:inline">{lang === 'fa' ? 'کانال تلگرام' : 'Channel'}</span>
          </a>
        </div>
      </div>

      {/* Mobile Floating Glass Dock */}
      <div className="md:hidden mt-2 mx-auto max-w-sm rounded-2xl bg-[#0c0e17]/85 backdrop-blur-xl border border-white/15 shadow-[0_8px_24px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] p-1 flex items-center justify-around text-xs">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'home'
              ? 'bg-white/15 text-white font-bold shadow-sm'
              : 'text-[#9da3af] hover:text-white'
          }`}
        >
          <Home className="w-3.5 h-3.5" strokeWidth={1.75} />
          <span>{lang === 'fa' ? 'خانه' : 'Home'}</span>
        </button>

        <button
          onClick={() => setActiveTab('order')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'order'
              ? 'bg-[#d0bcff] text-[#0d0f17] font-bold shadow-sm'
              : 'text-[#9da3af] hover:text-white'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" strokeWidth={1.75} />
          <span>{lang === 'fa' ? 'سفارش' : 'Order'}</span>
        </button>

        <button
          onClick={() => setActiveTab('portfolio')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'portfolio'
              ? 'bg-white/15 text-white font-bold shadow-sm'
              : 'text-[#9da3af] hover:text-white'
          }`}
        >
          <FolderKanban className="w-3.5 h-3.5" strokeWidth={1.75} />
          <span>{lang === 'fa' ? 'نمونه‌ها' : 'Work'}</span>
        </button>

        <button
          onClick={() => setActiveTab('client')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'client'
              ? 'bg-white/15 text-white font-bold shadow-sm'
              : 'text-[#9da3af] hover:text-white'
          }`}
        >
          <Clock className="w-3.5 h-3.5" strokeWidth={1.75} />
          <span>{lang === 'fa' ? 'پیگیری' : 'Track'}</span>
        </button>

        {isAdminLoggedIn ? (
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'admin' ? 'text-[#d0bcff] font-bold' : 'text-[#9da3af]'
            }`}
          >
            <Shield className="w-3.5 h-3.5" strokeWidth={1.75} />
            <span className="w-1.5 h-1.5 rounded-full bg-[#a3e635]" />
          </button>
        ) : (
          <button
            onClick={onOpenAdminLogin}
            className="p-1.5 rounded-xl text-[#9da3af] hover:text-white cursor-pointer"
            title="ورود مدیریت"
          >
            <Lock className="w-3.5 h-3.5 text-[#ffb869]" strokeWidth={1.75} />
          </button>
        )}
      </div>
    </header>
  );
};
