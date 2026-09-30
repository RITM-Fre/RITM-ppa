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
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={[
        // 🎯 fixed → همیشه چسبیده به بالای صفحه و با کاربر پایین میاد
        'fixed top-0 left-0 right-0 z-50 w-full',
        'px-3 sm:px-6 pointer-events-none',
        'transition-all duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]',
        scrolled ? 'pt-2 pb-2' : 'pt-4 pb-3',
      ].join(' ')}
    >
      <div
        className={[
          'pointer-events-auto mx-auto flex items-center justify-between',
          'rounded-full border backdrop-blur-2xl',
          'transition-[max-width,height,padding,background-color,border-color,box-shadow]',
          'duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]',
          scrolled
            ? // ── کوچیک و شناور
              'max-w-4xl h-12 px-3 sm:px-4 ' +
              'bg-[#0a0c14]/85 border-white/[0.12] ' +
              'shadow-[0_10px_40px_-8px_rgba(0,0,0,0.75),0_0_0_1px_rgba(139,92,246,0.08),inset_0_1px_0_rgba(255,255,255,0.09)]'
            : // ── بزرگ و پرحال
              'max-w-7xl h-16 px-4 sm:px-6 ' +
              'bg-[#0e1017]/55 border-white/[0.07] ' +
              'shadow-[0_4px_24px_-6px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)]',
        ].join(' ')}
      >
        {/* ─────────── Brand / Logo ─────────── */}
        <div
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-2.5 cursor-pointer select-none group shrink-0"
        >
          <div
            className={[
              'relative rounded-full overflow-hidden border border-white/20 bg-black/60',
              'flex items-center justify-center transition-all duration-500',
              'group-hover:scale-105 group-hover:border-[#d0bcff]/80 group-hover:shadow-[0_0_18px_rgba(208,188,255,0.4)]',
              scrolled ? 'w-7 h-7 p-0.5' : 'w-9 h-9 p-1',
            ].join(' ')}
          >
            <img
              src={`${import.meta.env.BASE_URL}assets/logo.png`}
              alt="RITM"
              className="w-full h-full object-contain"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          <div className="flex items-center gap-1.5 overflow-hidden">
            <span
              className={[
                'font-extrabold tracking-tight text-white whitespace-nowrap',
                'group-hover:text-[#d0bcff] transition-all duration-500',
                scrolled ? 'text-sm' : 'text-base',
              ].join(' ')}
            >
              {lang === 'fa' ? 'استودیو ریتم' : 'RITM Studio'}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#a3e635] shadow-[0_0_8px_#a3e635] animate-pulse" />
          </div>
        </div>

        {/* ─────────── Center Nav (Desktop) ─────────── */}
        <nav
          className={[
            'hidden md:flex items-center gap-0.5 rounded-full',
            'bg-white/[0.03] border border-white/[0.06] backdrop-blur-md',
            'transition-all duration-500',
            scrolled ? 'p-0.5' : 'p-1',
          ].join(' ')}
        >
          {[
            { key: 'home' as const, icon: Home, fa: 'خانه', en: 'Home' },
            { key: 'order' as const, icon: ShoppingBag, fa: 'ثبت سفارش', en: 'Order', accent: true },
            { key: 'portfolio' as const, icon: FolderKanban, fa: 'نمونه‌کارها', en: 'Portfolio' },
            { key: 'client' as const, icon: Clock, fa: 'پیگیری سفارش', en: 'Track' },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={[
                  'flex items-center gap-1.5 rounded-full font-medium cursor-pointer',
                  'transition-all duration-300',
                  scrolled ? 'px-2.5 py-1 text-[11px]' : 'px-3.5 py-1.5 text-xs',
                  isActive
                    ? item.accent
                      ? 'bg-[#d0bcff] text-[#0d0f17] font-bold shadow-[0_0_18px_rgba(208,188,255,0.45)]'
                      : 'bg-white/15 text-white font-semibold shadow-[0_2px_10px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.18)]'
                    : 'text-[#9da3af] hover:text-white hover:bg-white/[0.06]',
                ].join(' ')}
              >
                <Icon className={scrolled ? 'w-3 h-3' : 'w-3.5 h-3.5'} strokeWidth={1.75} />
                <span className="whitespace-nowrap">{lang === 'fa' ? item.fa : item.en}</span>
              </button>
            );
          })}

          {isAdminLoggedIn && (
            <>
              <div className="h-3.5 w-px bg-white/15 mx-1" />
              <button
                onClick={() => setActiveTab('admin')}
                className={[
                  'flex items-center gap-1.5 rounded-full font-medium cursor-pointer transition-all',
                  scrolled ? 'px-2 py-1 text-[11px]' : 'px-2.5 py-1.5 text-xs',
                  activeTab === 'admin'
                    ? 'bg-[#d0bcff]/20 text-[#d0bcff] font-bold border border-[#d0bcff]/40'
                    : 'text-[#d0bcff]/80 hover:text-[#d0bcff] hover:bg-white/5',
                ].join(' ')}
              >
                <Shield className="w-3.5 h-3.5" strokeWidth={1.75} />
                <span>{lang === 'fa' ? 'ادمین' : 'Admin'}</span>
                {pendingCount > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ffb869] animate-pulse" />
                )}
              </button>

              <button
                onClick={() => setActiveTab('status')}
                className={[
                  'flex items-center gap-1.5 rounded-full font-medium cursor-pointer transition-all',
                  scrolled ? 'px-2 py-1 text-[11px]' : 'px-2.5 py-1.5 text-xs',
                  activeTab === 'status'
                    ? 'bg-white/15 text-white font-bold'
                    : 'text-[#9da3af] hover:text-white hover:bg-white/5',
                ].join(' ')}
              >
                <Terminal className="w-3.5 h-3.5 text-[#adc6ff]" strokeWidth={1.75} />
                <span>{lang === 'fa' ? 'لاگ‌ها' : 'Logs'}</span>
              </button>
            </>
          )}
        </nav>

        {/* ─────────── Right Actions ─────────── */}
        <div className="flex items-center gap-1.5 shrink-0">
          {currentUser ? (
            <button
              onClick={() => setActiveTab('client')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs text-[#d0bcff] font-medium hover:bg-white/[0.08] hover:border-[#d0bcff]/40 transition-all cursor-pointer"
            >
              <User className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span className="max-w-[80px] truncate">{currentUser.username}</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('client')}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs text-white/90 hover:text-white transition-all cursor-pointer"
            >
              <User className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span>{lang === 'fa' ? 'ورود مشتری' : 'Client Login'}</span>
            </button>
          )}

          {isAdminLoggedIn && (
            <button
              onClick={onAdminLogout}
              className="p-1.5 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/25 text-xs flex items-center gap-1 transition-all cursor-pointer hover:scale-105"
              title="خروج ادمین"
            >
              <LogOut className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span className="hidden xl:inline text-[11px]">
                {lang === 'fa' ? 'خروج' : 'Logout'}
              </span>
            </button>
          )}

          <button
            onClick={() => setLang(lang === 'fa' ? 'en' : 'fa')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-white/10 hover:border-white/25 text-xs font-mono text-[#9da3af] hover:text-white transition-all bg-white/[0.02] cursor-pointer"
            title={lang === 'fa' ? 'تغییر زبان' : 'Switch Language'}
          >
            <Globe className="w-3.5 h-3.5" strokeWidth={1.75} />
            <span>{lang === 'fa' ? 'EN' : 'فا'}</span>
          </button>

          <a
            href="https://t.me/RITM_FreeLancer"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#229ed9] to-[#0088cc] border border-[#38bdf8]/40 text-white text-xs font-semibold shadow-[0_4px_18px_rgba(34,158,217,0.35)] hover:shadow-[0_6px_26px_rgba(34,158,217,0.55)] hover:scale-[1.03] transition-all cursor-pointer whitespace-nowrap active:scale-95"
            title="کانال رسمی تلگرام استودیو ریتم"
          >
            <Send className="w-3.5 h-3.5" strokeWidth={1.75} />
            <span className="hidden sm:inline">
              {lang === 'fa' ? 'کانال تلگرام' : 'Channel'}
            </span>
          </a>
        </div>
      </div>

      {/* ─────────── Mobile Floating Dock ─────────── */}
      <div
        className={[
          'md:hidden pointer-events-auto mt-2 mx-auto',
          'rounded-full bg-[#0c0e17]/90 backdrop-blur-xl border border-white/15',
          'shadow-[0_10px_30px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)]',
          'flex items-center justify-around text-xs',
          'transition-all duration-500',
          scrolled ? 'max-w-[280px] p-0.5' : 'max-w-sm p-1',
        ].join(' ')}
      >
        {[
          { key: 'home' as const, icon: Home, fa: 'خانه', en: 'Home' },
          { key: 'order' as const, icon: ShoppingBag, fa: 'سفارش', en: 'Order', accent: true },
          { key: 'portfolio' as const, icon: FolderKanban, fa: 'نمونه‌ها', en: 'Work' },
          { key: 'client' as const, icon: Clock, fa: 'پیگیری', en: 'Track' },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={[
                'flex items-center gap-1 px-3 py-1.5 rounded-full transition-all cursor-pointer',
                isActive
                  ? item.accent
                    ? 'bg-[#d0bcff] text-[#0d0f17] font-bold shadow-[0_0_14px_rgba(208,188,255,0.4)]'
                    : 'bg-white/15 text-white font-bold shadow-sm'
                  : 'text-[#9da3af] hover:text-white',
              ].join(' ')}
            >
              <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span>{lang === 'fa' ? item.fa : item.en}</span>
            </button>
          );
        })}

        {isAdminLoggedIn ? (
          <button
            onClick={() => setActiveTab('admin')}
            className={[
              'flex items-center gap-1 px-2.5 py-1.5 rounded-full transition-all cursor-pointer',
              activeTab === 'admin' ? 'text-[#d0bcff] font-bold' : 'text-[#9da3af]',
            ].join(' ')}
          >
            <Shield className="w-3.5 h-3.5" strokeWidth={1.75} />
            <span className="w-1.5 h-1.5 rounded-full bg-[#a3e635]" />
          </button>
        ) : (
          <button
            onClick={onOpenAdminLogin}
            className="p-1.5 rounded-full text-[#9da3af] hover:text-white transition-colors cursor-pointer"
            title="ورود مدیریت"
          >
            <Lock className="w-3.5 h-3.5 text-[#ffb869]" strokeWidth={1.75} />
          </button>
        )}
      </div>
    </header>
  );
};
