import React, { useState, useEffect } from 'react';
import {
  Home,
  ShoppingBag,
  FolderKanban,
  Clock,
  Globe,
  Shield,
  Terminal,
  LogOut,
  User,
  KeyRound,
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
      if (window.scrollY > 20) {
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
      {/* 3-PIECE FLOATING ISLAND HEADER */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ease-out px-3 sm:px-6 pointer-events-none ${
          scrolled ? 'pt-2 pb-1' : 'pt-3.5 sm:pt-4 pb-2'
        }`}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2.5 sm:gap-3">
          {/* ======================================================== */}
          {/* ISLAND 1: BRAND CAPSULE (Right in RTL) */}
          {/* ======================================================== */}
          <div
            onClick={() => setActiveTab('home')}
            className={`island-glass rounded-full flex items-center gap-2 cursor-pointer select-none group pointer-events-auto transition-all duration-300 shadow-lg ${
              scrolled
                ? 'h-11 px-3 sm:px-4 scale-95'
                : 'h-13 px-3.5 sm:px-4.5 scale-100'
            }`}
          >
            <div className="relative w-6 h-6 sm:w-7 sm:h-7 rounded-full overflow-hidden bg-black/40 border border-white/20 p-0.5 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
              <img
                src={`${import.meta.env.BASE_URL}assets/logo.png`}
                alt="RITM"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-sm sm:text-base font-extrabold tracking-tight text-white group-hover:text-[#d0bcff] transition-colors">
                {lang === 'fa' ? 'ریتم' : 'RITM'}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#a3e635] shadow-[0_0_8px_#a3e635]" />
            </div>
          </div>

          {/* ======================================================== */}
          {/* ISLAND 2: NAVIGATION CAPSULE (Center - Desktop only) */}
          {/* ======================================================== */}
          <nav
            className={`hidden md:flex items-center gap-1 island-glass rounded-full p-1 pointer-events-auto transition-all duration-300 shadow-lg ${
              scrolled ? 'h-11 px-1.5 scale-95' : 'h-13 px-2 scale-100'
            }`}
          >
            {/* Home */}
            <button
              onClick={() => setActiveTab('home')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-white/15 text-white font-bold shadow-sm'
                  : 'text-[#9da3af] hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <Home className="w-3.5 h-3.5" strokeWidth={activeTab === 'home' ? 2.2 : 1.75} />
              <span>{lang === 'fa' ? 'خانه' : 'Home'}</span>
            </button>

            {/* Order */}
            <button
              onClick={() => setActiveTab('order')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                activeTab === 'order'
                  ? 'bg-[#d0bcff] text-[#0d0f17] shadow-[0_0_16px_rgba(208,188,255,0.4)]'
                  : 'text-[#9da3af] hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" strokeWidth={activeTab === 'order' ? 2.2 : 1.75} />
              <span>{lang === 'fa' ? 'ثبت سفارش' : 'Order'}</span>
            </button>

            {/* Portfolio */}
            <button
              onClick={() => setActiveTab('portfolio')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
                activeTab === 'portfolio'
                  ? 'bg-white/15 text-white font-bold shadow-sm'
                  : 'text-[#9da3af] hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <FolderKanban className="w-3.5 h-3.5" strokeWidth={activeTab === 'portfolio' ? 2.2 : 1.75} />
              <span>{lang === 'fa' ? 'نمونه‌کارها' : 'Work'}</span>
            </button>

            {/* Tracking */}
            <button
              onClick={() => setActiveTab('client')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
                activeTab === 'client'
                  ? 'bg-[#adc6ff]/20 text-[#adc6ff] border border-[#adc6ff]/40 font-bold shadow-sm'
                  : 'text-[#9da3af] hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-[#adc6ff]" strokeWidth={activeTab === 'client' ? 2.2 : 1.75} />
              <span>{lang === 'fa' ? 'پیگیری سفارش' : 'Track'}</span>
            </button>

            {/* Admin Tabs (Only if logged in) */}
            {isAdminLoggedIn && (
              <>
                <div className="h-4 w-[1px] bg-white/15 mx-1" />
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'admin'
                      ? 'bg-[#d0bcff]/20 text-[#d0bcff] border border-[#d0bcff]/40'
                      : 'text-[#d0bcff]/80 hover:text-[#d0bcff] hover:bg-white/5'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" strokeWidth={2} />
                  <span>{lang === 'fa' ? 'ادمین' : 'Admin'}</span>
                  {pendingCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-[#ffb869] animate-pulse" />}
                </button>

                <button
                  onClick={() => setActiveTab('status')}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
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

          {/* ======================================================== */}
          {/* ISLAND 3: ACTION CAPSULE (Left in RTL - User & Lang) */}
          {/* ======================================================== */}
          <div
            className={`island-glass rounded-full flex items-center gap-1.5 sm:gap-2 pointer-events-auto transition-all duration-300 shadow-lg ${
              scrolled ? 'h-11 px-2 sm:px-3 scale-95' : 'h-13 px-2.5 sm:px-3.5 scale-100'
            }`}
          >
            {/* User State */}
            {currentUser ? (
              <button
                onClick={() => setActiveTab('client')}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-[#d0bcff]/40 text-xs text-[#d0bcff] font-medium transition-all cursor-pointer"
                title="پرتال مشتریان"
              >
                <User className="w-3.5 h-3.5" strokeWidth={2} />
                <span className="max-w-[70px] sm:max-w-[90px] truncate text-[11px] sm:text-xs">
                  {currentUser.first_name || currentUser.username}
                </span>
              </button>
            ) : (
              <button
                onClick={() => setActiveTab('client')}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d0bcff]/15 hover:bg-[#d0bcff]/25 border border-[#d0bcff]/30 text-xs text-[#d0bcff] font-bold transition-all cursor-pointer"
                title="ورود به حساب کاربری مشتریان"
              >
                <KeyRound className="w-3.5 h-3.5" strokeWidth={2} />
                <span className="text-[11px] sm:text-xs">{lang === 'fa' ? 'ورود' : 'Login'}</span>
              </button>
            )}

            {/* Admin Logout Button */}
            {isAdminLoggedIn && (
              <button
                onClick={onAdminLogout}
                className="p-1.5 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs flex items-center transition-colors cursor-pointer"
                title="خروج از حساب ادمین"
              >
                <LogOut className="w-3.5 h-3.5" strokeWidth={1.75} />
              </button>
            )}

            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === 'fa' ? 'en' : 'fa')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-white/10 hover:border-white/20 text-xs font-mono text-[#9da3af] hover:text-white transition-colors bg-white/[0.03] cursor-pointer"
              title={lang === 'fa' ? 'تغییر زبان به انگلیسی' : 'Switch Language to Persian'}
            >
              <Globe className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span>{lang === 'fa' ? 'EN' : 'فا'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* MOBILE FLOATING BOTTOM DOCK (Thumb-accessible, clean) */}
      {/* ======================================================== */}
      <div className="md:hidden fixed bottom-3 left-3 right-3 z-40 max-w-sm mx-auto rounded-full island-glass-active p-1.5 flex items-center justify-around text-xs shadow-2xl">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-full transition-all cursor-pointer ${
            activeTab === 'home' ? 'text-[#d0bcff] font-bold' : 'text-[#9da3af] hover:text-white'
          }`}
        >
          <Home className="w-4 h-4" strokeWidth={activeTab === 'home' ? 2.5 : 1.75} />
          <span className="text-[10px]">{lang === 'fa' ? 'خانه' : 'Home'}</span>
        </button>

        <button
          onClick={() => setActiveTab('order')}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-full transition-all cursor-pointer ${
            activeTab === 'order' ? 'text-[#d0bcff] font-bold' : 'text-[#9da3af] hover:text-white'
          }`}
        >
          <ShoppingBag className="w-4 h-4" strokeWidth={activeTab === 'order' ? 2.5 : 1.75} />
          <span className="text-[10px]">{lang === 'fa' ? 'سفارش' : 'Order'}</span>
        </button>

        <button
          onClick={() => setActiveTab('portfolio')}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-full transition-all cursor-pointer ${
            activeTab === 'portfolio' ? 'text-[#d0bcff] font-bold' : 'text-[#9da3af] hover:text-white'
          }`}
        >
          <FolderKanban className="w-4 h-4" strokeWidth={activeTab === 'portfolio' ? 2.5 : 1.75} />
          <span className="text-[10px]">{lang === 'fa' ? 'نمونه‌ها' : 'Work'}</span>
        </button>

        <button
          onClick={() => setActiveTab('client')}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-full transition-all cursor-pointer ${
            activeTab === 'client' ? 'text-[#adc6ff] font-bold' : 'text-[#9da3af] hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4" strokeWidth={activeTab === 'client' ? 2.5 : 1.75} />
          <span className="text-[10px]">{lang === 'fa' ? 'پیگیری' : 'Track'}</span>
        </button>

        {isAdminLoggedIn && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-full transition-all cursor-pointer ${
              activeTab === 'admin' ? 'text-[#d0bcff] font-bold' : 'text-[#9da3af]'
            }`}
          >
            <Shield className="w-4 h-4" strokeWidth={2} />
            <span className="text-[10px]">{lang === 'fa' ? 'ادمین' : 'Admin'}</span>
          </button>
        )}
      </div>
    </>
  );
};
