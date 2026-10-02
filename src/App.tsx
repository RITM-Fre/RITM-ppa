/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { OrderWizard } from './components/OrderWizard';
import { AdminPanel } from './components/AdminPanel';
import { AdminLogin } from './components/AdminLogin';
import { ClientPortal } from './components/ClientPortal';
import { PortfolioShowcase } from './components/PortfolioShowcase';
import { BotHealthTerminal } from './components/BotHealthTerminal';
import { ProjectChat } from './components/ProjectChat';
import { Footer } from './components/Footer';
import { ProjectType, Order, AuthUser } from './types';
import { Send, Shield, Lock, X } from 'lucide-react';

import { getOrders } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'order' | 'admin' | 'portfolio' | 'status' | 'client' | 'chat'>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab === 'home') return 'home';
      if (tab === 'order') return 'order';
      if (tab === 'admin') return 'admin';
      if (tab === 'client') return 'client';
      if (tab === 'status') return 'status';
      if (tab === 'portfolio') return 'portfolio';
      if (tab === 'chat') return 'chat';
    } catch (e) {}
    return 'home';
  });

  const [lang, setLang] = useState<'fa' | 'en'>('fa');
  const [preselectedCategory, setPreselectedCategory] = useState<ProjectType>('video');
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [showAdminLoginModal, setShowAdminLoginModal] = useState<boolean>(false);
  const [selectedChatOrderCode, setSelectedChatOrderCode] = useState<string | null>(null);

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem('ritm_client_user');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });

  const [adminToken, setAdminToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('ritm_admin_token') || null;
    } catch (e) {
      return null;
    }
  });

  const isAdminLoggedIn = Boolean(adminToken);

  const changeTab = (tab: 'home' | 'order' | 'admin' | 'portfolio' | 'status' | 'client' | 'chat') => {
    if ((tab === 'admin' || tab === 'status') && !isAdminLoggedIn) {
      setShowAdminLoginModal(true);
      return;
    }

    setActiveTab(tab);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tab);
      window.history.replaceState({}, '', url.toString());
    } catch (e) {}
  };

  useEffect(() => {
    const checkPending = async () => {
      try {
        const data = await getOrders('new');
        if (data.success && Array.isArray(data.orders)) {
          setPendingCount(data.orders.length);
        }
      } catch (e) {
        // Ignore
      }
    };
    checkPending();
    const interval = setInterval(checkPending, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectCategoryForOrder = (category?: ProjectType) => {
    if (category) {
      setPreselectedCategory(category);
    }
    changeTab('order');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderCreated = (order: Order) => {
    setPendingCount((prev) => prev + 1);
  };

  const handleClientLogin = (user: AuthUser) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('ritm_client_user', JSON.stringify(user));
    } catch (e) {}
    changeTab('client');
  };

  const handleClientLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('ritm_client_user');
    } catch (e) {}
  };

  const handleNavigateToChat = (orderCode?: string) => {
    setSelectedChatOrderCode(orderCode || null);
    changeTab('chat');
  };

  const handleAdminLoginSuccess = (token: string) => {
    setAdminToken(token);
    try {
      localStorage.setItem('ritm_admin_token', token);
    } catch (e) {}
    setShowAdminLoginModal(false);
  };

  const handleAdminLogout = () => {
    setAdminToken(null);
    try {
      localStorage.removeItem('ritm_admin_token');
    } catch (e) {}
    setActiveTab('home');
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', 'home');
      window.history.replaceState({}, '', url.toString());
    } catch (e) {}
  };

  const handleCornerAdminClick = () => {
    if (isAdminLoggedIn) {
      changeTab('admin');
    } else {
      setShowAdminLoginModal(true);
    }
  };

  return (
    <div
      dir={lang === 'fa' ? 'rtl' : 'ltr'}
      className="min-h-screen flex flex-col bg-[#0b0c10] text-[#f1f2f6] relative overflow-hidden font-sans"
    >
      <Navbar
        activeTab={activeTab}
        setActiveTab={changeTab}
        lang={lang}
        setLang={setLang}
        pendingCount={pendingCount}
        currentUser={currentUser}
        isAdminLoggedIn={isAdminLoggedIn}
        onAdminLogout={handleAdminLogout}
        onOpenAdminLogin={() => setShowAdminLoginModal(true)}
      />

      {typeof window !== 'undefined' && localStorage.getItem('ritm_announcement') && (
        <div className="bg-gradient-to-r from-[#d0bcff]/15 via-[#38bdf8]/15 to-[#d0bcff]/15 border-b border-white/10 px-4 py-2 text-center text-xs text-[#d0bcff] font-medium flex items-center justify-center gap-2">
          <span>📢</span>
          <span>{localStorage.getItem('ritm_announcement')}</span>
        </div>
      )}

      <main className="flex-1 relative z-10 w-full pt-20 sm:pt-24 pb-24 md:pb-8">
        {activeTab === 'home' && (
          <HomeView
            lang={lang}
            onStartOrder={handleSelectCategoryForOrder}
            onNavigateToPortfolio={() => changeTab('portfolio')}
            onNavigateToClient={() => changeTab('client')}
          />
        )}

        {activeTab === 'order' && (
          <OrderWizard
            lang={lang}
            preselectedCategory={preselectedCategory}
            onOrderCreated={handleOrderCreated}
            currentUser={currentUser}
            onNavigateToLogin={() => changeTab('client')}
          />
        )}

        {activeTab === 'client' && (
          <ClientPortal
            lang={lang}
            currentUser={currentUser}
            onLogin={handleClientLogin}
            onLogout={handleClientLogout}
            onNavigateToOrder={() => changeTab('order')}
            onNavigateToPortfolio={() => changeTab('portfolio')}
            onNavigateToChat={handleNavigateToChat}
          />
        )}

        {activeTab === 'portfolio' && (
          <PortfolioShowcase
            lang={lang}
            onSelectCategoryForOrder={handleSelectCategoryForOrder}
          />
        )}

        {activeTab === 'chat' && (
          <ProjectChat
            lang={lang}
            currentUser={currentUser}
            isAdmin={isAdminLoggedIn}
            initialOrderCode={selectedChatOrderCode}
            onNavigateToOrder={() => changeTab('order')}
            onNavigateToAuth={() => changeTab('client')}
            onLogin={handleClientLogin}
          />
        )}

        {activeTab === 'admin' && (
          isAdminLoggedIn ? (
            <AdminPanel
              lang={lang}
              onLogout={handleAdminLogout}
              onNavigateToChat={handleNavigateToChat}
            />
          ) : (
            <AdminLogin
              lang={lang}
              onLoginSuccess={handleAdminLoginSuccess}
              onCancel={() => changeTab('order')}
            />
          )
        )}

        {activeTab === 'status' && (
          isAdminLoggedIn ? (
            <BotHealthTerminal lang={lang} />
          ) : (
            <AdminLogin
              lang={lang}
              onLoginSuccess={handleAdminLoginSuccess}
              onCancel={() => changeTab('order')}
            />
          )
        )}
      </main>

      <div className="hidden md:flex fixed bottom-6 right-6 z-40 items-center gap-2">
        <button
          onClick={handleCornerAdminClick}
          className={`flex items-center gap-2 px-4 py-3 rounded-2xl shadow-2xl transition-all duration-300 border text-xs font-bold ${
            isAdminLoggedIn
              ? 'bg-[#1e1e1e]/90 hover:bg-[#252525] text-[#d0bcff] border-[#d0bcff]/40 shadow-[#d0bcff]/10'
              : 'bg-[#181818]/90 hover:bg-[#222222] text-[#e5e2e1] border-white/15 hover:border-[#d0bcff]/40'
          } backdrop-blur-xl hover:scale-105 active:scale-95`}
          title={isAdminLoggedIn ? 'پنل ادمین فعال است (کلیک برای مشاهده)' : 'ورود به پنل ادمین با رمز عبور'}
        >
          <Shield className="w-4 h-4 text-[#d0bcff]" />
          <span>{lang === 'fa' ? 'پنل ادمین' : 'Admin Panel'}</span>
          {isAdminLoggedIn ? (
            <span className="w-2 h-2 rounded-full bg-[#a3e635] animate-pulse" />
          ) : (
            <Lock className="w-3 h-3 text-[#ffb869]" />
          )}
        </button>
      </div>

      <a
        href="https://t.me/RITM_FreeLancer"
        target="_blank"
        rel="noopener noreferrer"
        className="hidden md:flex fixed bottom-6 left-6 z-40 p-3.5 rounded-full bg-[#d0bcff] text-[#131313] shadow-2xl hover:scale-110 active:scale-95 transition-all items-center gap-2 group hover:shadow-[#d0bcff]/30 cursor-pointer"
        title="کانال رسمی تلگرام ریتم"
      >
        <Send className="w-5 h-5 fill-current" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 font-bold text-xs px-0 group-hover:px-1">
          @RITM_FreeLancer
        </span>
      </a>

      {showAdminLoginModal && !isAdminLoggedIn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="relative w-full max-w-md">
            <button
              onClick={() => setShowAdminLoginModal(false)}
              className="absolute top-4 left-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-[#e5e2e1] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <AdminLogin
              lang={lang}
              onLoginSuccess={handleAdminLoginSuccess}
              onCancel={() => setShowAdminLoginModal(false)}
            />
          </div>
        </div>
      )}

      <Footer lang={lang} />
    </div>
  );
}
