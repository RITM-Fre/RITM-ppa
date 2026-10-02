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
  MessageSquare,
} from 'lucide-react';
import { AuthUser } from '../types';

interface NavbarProps {
  activeTab: 'home' | 'order' | 'admin' | 'portfolio' | 'status' | 'client' | 'chat';
  setActiveTab: (tab: 'home' | 'order' | 'admin' | 'portfolio' | 'status' | 'client' | 'chat') => void;
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
      if (window.scrollY > 15) {
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
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-500 ease-out px-2.5 sm:px-6 pointer-events-none ${
          scrolled ? 'pt-1.5 sm:pt-2 pb-1' : 'pt-2.5 sm:pt-4 pb-2'
        }`}
      >
        <div
          className={`mx-auto transition-all duration-500 ease-out flex items-center justify-between pointer-events-auto ${
            scrolled
              ? 'max-w-6xl h-12 sm:h-13 px-3 sm:px-5 rounded-2xl bg-[#08090f]/95 backdrop-blur-2xl border border-white/20 shadow-[0_12px_36px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.18)] scale-[0.99]'
              : 'max-w-7xl h-15 sm:h-16 px-3.5 sm:px-6 rounded-2xl bg-[#0e1017]/85 backdrop-blur-xl border border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.35)] scale-100'
          }`}
        >
        {/* Brand / Logo */}
        <div
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-2 cursor-pointer select-none group"
        >
          <div className={`relative rounded-xl overflow-hidden border border-white/20 bg-black/50 p-0.5 flex items-center justify-center transition-all duration-500 group-hover:scale-105 group-hover:border-[#d0bcff]/80 ${
            scrolled ? 'w-6.5 h-6.5 sm:w-7.5 sm:h-7.5' : 'w-7.5 h-7.5 sm:w-8.5 sm:h-8.5'
          }`}>
            <img
              src={`${import.meta.env.BASE_URL}assets/logo.png`}
              alt="RITM"
              className="w-full h-full object-contain"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          <div className="flex items-center gap-1.5">
            <span className={`font-extrabold tracking-tight text-white group-hover:text-[#d0bcff] transition-all duration-500 ${
              scrolled ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'
            }`}>
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

          {/* Online Project Discussion */}
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-[#a3e635]/20 text-[#a3e635] font-bold border border-[#a3e635]/40 shadow-[0_0_12px_rgba(163,230,53,0.2)]'
                : 'text-[#9da3af] hover:text-[#a3e635] hover:bg-white/[0.05]'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#a3e635]" strokeWidth={1.75} />
            <span>{lang === 'fa' ? 'گفتگوی آنلاین' : 'Live Chat'}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#a3e635] animate-pulse" />
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
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* User state */}
          {currentUser ? (
            <button
              onClick={() => setActiveTab('client')}
              className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl bg-white/[0.06] border border-[#d0bcff]/30 text-xs text-[#d0bcff] font-medium hover:bg-white/[0.1] transition-all cursor-pointer"
              title="مشاهده حساب کاربری"
            >
              <User className="w-3.5 h-3.5" strokeWidth={2} />
              <span className="max-w-[65px] sm:max-w-[90px] truncate text-[11px] sm:text-xs">{currentUser.first_name || currentUser.username}</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('client')}
              className="inline-flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs text-white/90 hover:text-white transition-all cursor-pointer"
              title="ورود به حساب کاربری با کد تایید"
            >
              <User className="w-3.5 h-3.5 text-[#d0bcff]" strokeWidth={1.75} />
              <span className="text-[11px] sm:text-xs font-medium">{lang === 'fa' ? 'ورود' : 'Login'}</span>
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
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl border border-white/10 hover:border-white/20 text-xs font-mono text-[#9da3af] hover:text-white transition-colors bg-white/[0.02] cursor-pointer"
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
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#229ed9]/90 to-[#0088cc]/90 hover:from-[#229ed9] hover:to-[#0088cc] border border-[#38bdf8]/30 text-white text-xs font-semibold shadow-[0_4px_16px_rgba(34,158,217,0.25)] hover:shadow-[0_4px_20px_rgba(34,158,217,0.4)] transition-all cursor-pointer whitespace-nowrap active:scale-95"
            title="کانال رسمی تلگرام استودیو ریتم"
          >
            <Send className="w-3.5 h-3.5" strokeWidth={1.75} />
            <span className="hidden sm:inline">{lang === 'fa' ? 'کانال تلگرام' : 'Channel'}</span>
          </a>
        </div>
      </div>
    </header>

    {/* Mobile Floating Glass Bottom Dock (Fixed at bottom on phones, clean & thumb-accessible) */}
    <div className="md:hidden fixed bottom-3 left-3 right-3 z-40 max-w-sm mx-auto rounded-2xl bg-[#0c0e17]/92 backdrop-blur-2xl border border-white/20 shadow-[0_12px_36px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.15)] p-1.5 flex items-center justify-around text-xs">
      <button
        onClick={() => setActiveTab('home')}
        className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
          activeTab === 'home' ? 'text-[#d0bcff] font-bold' : 'text-[#9da3af] hover:text-white'
        }`}
      >
        <Home className="w-4 h-4" strokeWidth={activeTab === 'home' ? 2.5 : 1.75} />
        <span className="text-[10px]">{lang === 'fa' ? 'خانه' : 'Home'}</span>
      </button>

      <button
        onClick={() => setActiveTab('order')}
        className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
          activeTab === 'order' ? 'text-[#d0bcff] font-bold' : 'text-[#9da3af] hover:text-white'
        }`}
      >
        <ShoppingBag className="w-4 h-4" strokeWidth={activeTab === 'order' ? 2.5 : 1.75} />
        <span className="text-[10px]">{lang === 'fa' ? 'سفارش' : 'Order'}</span>
      </button>

      <button
        onClick={() => setActiveTab('portfolio')}
        className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
          activeTab === 'portfolio' ? 'text-[#d0bcff] font-bold' : 'text-[#9da3af] hover:text-white'
        }`}
      >
        <FolderKanban className="w-4 h-4" strokeWidth={activeTab === 'portfolio' ? 2.5 : 1.75} />
        <span className="text-[10px]">{lang === 'fa' ? 'نمونه‌ها' : 'Work'}</span>
      </button>

      <button
        onClick={() => setActiveTab('client')}
        className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
          activeTab === 'client' ? 'text-[#adc6ff] font-bold' : 'text-[#9da3af] hover:text-white'
        }`}
      >
        <Clock className="w-4 h-4" strokeWidth={activeTab === 'client' ? 2.5 : 1.75} />
        <span className="text-[10px]">{lang === 'fa' ? 'پیگیری' : 'Track'}</span>
      </button>

      <button
        onClick={() => setActiveTab('chat')}
        className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
          activeTab === 'chat' ? 'text-[#a3e635] font-bold' : 'text-[#9da3af] hover:text-white'
        }`}
      >
        <div className="relative">
          <MessageSquare className="w-4 h-4" strokeWidth={activeTab === 'chat' ? 2.5 : 1.75} />
          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#a3e635] animate-pulse" />
        </div>
        <span className="text-[10px]">{lang === 'fa' ? 'گفتگو' : 'Chat'}</span>
      </button>

      {isAdminLoggedIn ? (
        <button
          onClick={() => setActiveTab('admin')}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'admin' ? 'text-[#d0bcff] font-bold' : 'text-[#9da3af]'
          }`}
        >
          <Shield className="w-4 h-4" strokeWidth={1.75} />
          <span className="text-[10px]">{lang === 'fa' ? 'ادمین' : 'Admin'}</span>
        </button>
      ) : (
        <button
          onClick={onOpenAdminLogin}
          className="flex flex-col items-center gap-0.5 p-1 rounded-xl text-[#9da3af] hover:text-white cursor-pointer"
          title="ورود مدیریت"
        >
          <Lock className="w-3.5 h-3.5 text-[#ffb869]" strokeWidth={1.75} />
          <span className="text-[9px]">ورود</span>
        </button>
      )}
    </div>
  </>
);
};
