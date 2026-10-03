import React, { useState, useEffect } from 'react';
import {
  Film,
  Code,
  Smartphone,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  CheckCircle2,
  ExternalLink,
  Play,
  X,
  Plus,
  Edit2,
  Trash2,
  Globe,
  Github,
  Download,
  Layers,
  Save,
} from 'lucide-react';
import { SERVICES, PORTFOLIO_ITEMS, FAQ_ITEMS, heroImage, videoImage, webImage, mobileImage } from '../data/mockData';
import { ProjectType } from '../types';

export interface ProducedWebsite {
  id: string;
  titleFa: string;
  titleEn: string;
  descFa: string;
  descEn: string;
  url: string;
  githubUrl?: string;
  badge?: string;
}

export interface ProducedApp {
  id: string;
  titleFa: string;
  titleEn: string;
  descFa: string;
  descEn: string;
  downloadUrl: string;
  version?: string;
  platform?: string;
}

interface PortfolioShowcaseProps {
  lang: 'fa' | 'en';
  onSelectCategoryForOrder: (category: ProjectType) => void;
  isAdmin?: boolean;
  isAdminLoggedIn?: boolean;
}

export const PortfolioShowcase: React.FC<PortfolioShowcaseProps> = ({
  lang,
  onSelectCategoryForOrder,
  isAdmin = false,
  isAdminLoggedIn: rawAdminLoggedIn = false,
}) => {
  const isAdminLoggedIn = isAdmin || rawAdminLoggedIn;
  const [filter, setFilter] = useState<'all' | ProjectType>('all');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [selectedMediaProject, setSelectedMediaProject] = useState<any | null>(null);

  // 1. Dynamic Portfolio Items State
  const [items, setItems] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem('ritm_portfolio_items');
      return stored ? JSON.parse(stored) : PORTFOLIO_ITEMS;
    } catch {
      return PORTFOLIO_ITEMS;
    }
  });

  // 2. Dynamic Produced Websites State
  const [websites, setWebsites] = useState<ProducedWebsite[]>(() => {
    try {
      const stored = localStorage.getItem('ritm_produced_websites');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      {
        id: 'web-1',
        titleFa: 'پرتال جامع برندینگ آریا',
        titleEn: 'Aria Corporate Brand Portal',
        descFa: 'طراحی وب‌سایت چندصفحه‌ای مدرن با انیمیشن‌های روان و استانداردهای نوین رابط کاربری.',
        descEn: 'Full-stack responsive corporate platform with fluid micro-interactions and SEO architecture.',
        url: 'https://github.com',
        githubUrl: 'https://github.com/RITM-Freelancer',
        badge: 'React & Tailwind',
      },
      {
        id: 'web-2',
        titleFa: 'سامانه ابری مدیریت خدمات و پروژه‌ها',
        titleEn: 'Cloud Service Dashboard',
        descFa: 'داشبورد تحت وب یکپارچه برای مدیریت مشتریان، سفارش‌ها و جریان‌های کاری بلادرنگ.',
        descEn: 'Real-time client management dashboard with analytics and automated status flows.',
        url: 'https://github.com',
        githubUrl: 'https://github.com/RITM-Freelancer',
        badge: 'Next.js & Supabase',
      },
    ];
  });

  // 3. Dynamic Produced Apps State
  const [apps, setApps] = useState<ProducedApp[]>(() => {
    try {
      const stored = localStorage.getItem('ritm_produced_apps');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      {
        id: 'app-1',
        titleFa: 'اپلیکیشن ریتم منیجر (RITM Manager)',
        titleEn: 'RITM Manager Mobile App',
        descFa: 'اپلیکیشن موبایل سبک و سریع برای مدیریت مستقیم سفارشات تدوین و دریافت نوتیفیکیشن‌ها.',
        descEn: 'Lightweight client mobile app for tracking video editing milestones on the go.',
        downloadUrl: 'https://t.me/RITM_FreeLancer',
        version: 'v2.1.0',
        platform: 'Android / PWA',
      },
      {
        id: 'app-2',
        titleFa: 'اپلیکیشن ابزار تدوین و زمان‌سنج ریتم',
        titleEn: 'Video Edit Timeline Companion',
        descFa: 'ابزار همراه جهت استخراج تایم‌کدها، محاسبه فریم‌ریت و هماهنگی راش‌های ویدیویی.',
        descEn: 'Productivity tool for video creators: timecode calculator and asset sync manager.',
        downloadUrl: 'https://t.me/RITM_FreeLancer',
        version: 'v1.0.4',
        platform: 'Cross-Platform',
      },
    ];
  });

  // Modals for Admin Editing
  const [editItemModal, setEditItemModal] = useState<{ item: any; isNew: boolean } | null>(null);
  const [editWebsiteModal, setEditWebsiteModal] = useState<{ site: ProducedWebsite; isNew: boolean } | null>(null);
  const [editAppModal, setEditAppModal] = useState<{ app: ProducedApp; isNew: boolean } | null>(null);

  // Sync state to LocalStorage
  const saveItems = (newItems: any[]) => {
    setItems(newItems);
    try {
      localStorage.setItem('ritm_portfolio_items', JSON.stringify(newItems));
    } catch {}
  };

  const saveWebsites = (newSites: ProducedWebsite[]) => {
    setWebsites(newSites);
    try {
      localStorage.setItem('ritm_produced_websites', JSON.stringify(newSites));
    } catch {}
  };

  const saveApps = (newApps: ProducedApp[]) => {
    setApps(newApps);
    try {
      localStorage.setItem('ritm_produced_apps', JSON.stringify(newApps));
    } catch {}
  };

  // Filtered Cards
  const filteredItems = items.filter((item) =>
    filter === 'all' ? true : item.category === filter
  );

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-16">
      {/* Hero Showcase Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-white/10 glass-panel p-8 md:p-14 shadow-2xl">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b0c10] via-[#0b0c10]/90 to-transparent" />

        <div className="relative z-10 max-w-2xl text-right">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-mono text-[#d0bcff] mb-4">
            <span className="w-2 h-2 rounded-full bg-[#a3e635] animate-pulse" />
            <span>{lang === 'fa' ? 'آژانس خلاقیت دیجیتال ریتم' : 'RITM Creative Agency'}</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-[#e5e2e1] leading-tight mb-4 tracking-tight">
            {lang === 'fa' ? (
              <>
                ریتم – <span className="text-[#d0bcff]">تدوین خلاقانه</span> و مهندسی دیجیتال
              </>
            ) : (
              <>
                RITM – <span className="text-[#d0bcff]">Creative Production</span> & Code
              </>
            )}
          </h1>

          <p className="text-sm md:text-base text-[#958ea0] leading-relaxed mb-8">
            {lang === 'fa'
              ? 'ما شکاف میان هنر دیجیتال و مهندسی نرم‌افزار را پر کرده‌ایم. با ریتم، برند شما با بالاترین استانداردهای بصری و فنی خواهد درخشید.'
              : 'Bridging the gap between digital arts and software engineering. Elevating brands with cinematic visuals and bespoke software.'}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onSelectCategoryForOrder('video')}
              className="px-6 py-3 rounded-xl bg-[#d0bcff] text-[#131313] font-bold text-xs hover:bg-[#d0bcff]/90 transition-all shadow-lg hover:shadow-[#d0bcff]/20 cursor-pointer"
            >
              {lang === 'fa' ? 'شروع پروژه جدید' : 'Start a Project'}
            </button>
            <a
              href="https://t.me/RITM_FreeLancer"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[#e5e2e1] text-xs font-semibold transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <span>{lang === 'fa' ? 'کانال تلگرام @RITM_FreeLancer' : 'Telegram Channel'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div>
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="font-mono text-xs uppercase tracking-wider text-[#d0bcff] font-semibold">
            {lang === 'fa' ? 'خدمات تخصصی' : 'Specialized Capabilities'}
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-[#e5e2e1] mt-2 mb-3">
            {lang === 'fa' ? 'راهکارهای جامع ریتم برای کسب‌و‌کار شما' : 'Creative & Engineering Solutions'}
          </h2>
          <p className="text-xs text-[#958ea0]">
            {lang === 'fa'
              ? 'ترکیبی از استانداردهای برتر سینمایی در پریمیر پرو و فناوری‌های پیشرفته وب و اپلیکیشن.'
              : 'Combining cinematic standards in Premiere Pro with cutting-edge web & mobile technologies.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SERVICES.map((s) => {
            const Icon = s.icon === 'Film' ? Film : s.icon === 'Code' ? Code : Smartphone;
            return (
              <div
                key={s.id}
                className="glass-card rounded-2xl p-6 border border-white/10 flex flex-col justify-between group hover:border-[#d0bcff]/40 transition-all"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#d0bcff] mb-6 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[#e5e2e1] mb-3 group-hover:text-[#d0bcff] transition-colors">
                    {lang === 'fa' ? s.titleFa : s.titleEn}
                  </h3>
                  <p className="text-xs text-[#958ea0] leading-relaxed mb-6">
                    {lang === 'fa' ? s.descFa : s.descEn}
                  </p>
                  <ul className="space-y-2 mb-6">
                    {(lang === 'fa' ? s.featuresFa : s.featuresEn).map((f: string, i: number) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-[#e5e2e1]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#a3e635]" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  onClick={() => onSelectCategoryForOrder(s.id as ProjectType)}
                  className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-[#d0bcff] hover:text-[#131313] text-[#e5e2e1] text-xs font-semibold border border-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{lang === 'fa' ? 'سفارش در این زمینه' : 'Order in this Category'}</span>
                  {lang === 'fa' ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. PORTFOLIO SHOWCASE (PRICE-FREE & WITH ADMIN EDIT/ADD CAPABILITIES)      */}
      {/* ========================================================================= */}
      <div id="portfolio-grid">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-[#d0bcff] font-semibold">
              {lang === 'fa' ? 'نمونه‌کارها' : 'Selected Works'}
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-[#e5e2e1] mt-1">
              {lang === 'fa' ? 'منتخبی از پروژه‌های اجرا شده ریتم' : 'A selection of our latest client work'}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filter === 'all' ? 'bg-[#d0bcff] text-[#131313]' : 'text-[#958ea0] hover:text-white'
                }`}
              >
                {lang === 'fa' ? 'همه' : 'All'}
              </button>
              <button
                onClick={() => setFilter('video')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filter === 'video' ? 'bg-[#d0bcff] text-[#131313]' : 'text-[#958ea0] hover:text-white'
                }`}
              >
                {lang === 'fa' ? 'تدوین ویدیو' : 'Video Editing'}
              </button>
              <button
                onClick={() => setFilter('web')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filter === 'web' ? 'bg-[#d0bcff] text-[#131313]' : 'text-[#958ea0] hover:text-white'
                }`}
              >
                {lang === 'fa' ? 'وب‌سایت' : 'Websites'}
              </button>
              <button
                onClick={() => setFilter('mobile')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filter === 'mobile' ? 'bg-[#d0bcff] text-[#131313]' : 'text-[#958ea0] hover:text-white'
                }`}
              >
                {lang === 'fa' ? 'اپلیکیشن' : 'Applications'}
              </button>
            </div>

            {/* Admin Add Card Button (Only visible to Admin) */}
            {isAdminLoggedIn && (
              <button
                onClick={() =>
                  setEditItemModal({
                    isNew: true,
                    item: {
                      id: `card-${Date.now()}`,
                      cardNumber: items.length + 1,
                      fileName: 'custom.mp4',
                      category: 'video',
                      type: 'video',
                      titleFa: 'نمونه کار جدید',
                      titleEn: 'New Portfolio Item',
                      descFa: 'توضیحات مربوط به نمونه کار جدید تدوین یا طراحی.',
                      descEn: 'Description of the new creative project.',
                      tags: ['جدید', 'RITM'],
                      image: videoImage,
                      mediaUrl: '',
                    },
                  })
                }
                className="px-3.5 py-1.5 rounded-xl bg-[#a3e635] hover:bg-[#a3e635]/90 text-[#131313] font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                title="افزودن نمونه‌کار جدید به سایت"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>افزودن نمونه‌کار</span>
              </button>
            )}
          </div>
        </div>

        {/* Portfolio Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="glass-card rounded-2xl overflow-hidden border border-white/10 group flex flex-col justify-between hover:border-[#d0bcff]/40 transition-all cursor-pointer relative"
              onClick={() => setSelectedMediaProject(item)}
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-black/50">
                <img
                  src={item.image || videoImage}
                  alt={item.titleFa}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#131313] via-transparent to-transparent opacity-80" />

                {item.type === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-[#d0bcff]/30 backdrop-blur-md border border-[#d0bcff]/60 flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>
                )}

                {/* Top Right Card & File Identifier Badge */}
                <div className="absolute top-3 right-3 z-10">
                  <span className="px-2.5 py-1 rounded-lg text-[10.5px] font-mono font-bold bg-black/85 text-[#a3e635] backdrop-blur-md border border-[#a3e635]/40 shadow-md flex items-center gap-1.5">
                    <span>{lang === 'fa' ? `کارت ${item.cardNumber || ''}` : `Card ${item.cardNumber || ''}`}</span>
                    {item.fileName && (
                      <>
                        <span className="text-white/40">|</span>
                        <span className="text-white dir-ltr text-[10px]">{item.fileName}</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Admin Actions Bar on Hover (Strictly visible only when admin is logged in) */}
                {isAdminLoggedIn && (
                  <div
                    className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-black/80 backdrop-blur-md p-1 rounded-xl border border-white/20"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => setEditItemModal({ isNew: false, item: { ...item } })}
                      className="p-1.5 rounded-lg bg-[#d0bcff]/20 hover:bg-[#d0bcff] text-[#d0bcff] hover:text-[#131313] transition-colors"
                      title="ویرایش کارت"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('آیا از حذف این نمونه‌کار مطمئن هستید؟')) {
                          saveItems(items.filter((i) => i.id !== item.id));
                        }
                      }}
                      className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white transition-colors"
                      title="حذف کارت"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Tags */}
                {!isAdminLoggedIn && (
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                    {(item.tags || []).slice(0, 2).map((t: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-black/60 text-[#e5e2e1] backdrop-blur-md border border-white/10"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Body — NO PRICES AS REQUESTED */}
              <div className="p-5 text-right flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#e5e2e1] mb-2 group-hover:text-[#d0bcff] transition-colors">
                    {lang === 'fa' ? item.titleFa : item.titleEn}
                  </h3>
                  <p className="text-xs text-[#958ea0] leading-relaxed mb-4">
                    {lang === 'fa' ? item.descFa : item.descEn}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCategoryForOrder(item.category);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-[#d0bcff] hover:underline font-semibold cursor-pointer"
                  >
                    <span>{lang === 'fa' ? 'سفارش این سبک' : 'Order This Style'}</span>
                    {lang === 'fa' ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                  </button>
                  <span className="text-[10px] font-mono text-[#958ea0] uppercase">
                    {item.category}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. PRODUCED WEBSITES SECTION (آدرس سایت‌های تولید شده با دکمه شیشه‌ای)       */}
      {/* ========================================================================= */}
      <div className="pt-6 border-t border-white/10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#38bdf8]/10 border border-[#38bdf8]/20 text-xs font-mono text-[#38bdf8] mb-1.5">
              <Globe className="w-3.5 h-3.5" />
              <span>{lang === 'fa' ? 'وب‌سایت‌های آنلاین' : 'Live Platforms'}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              {lang === 'fa' ? 'آدرس سایت‌های تولید شده توسط ریتم' : 'Websites Built by RITM'}
            </h3>
            <p className="text-xs text-[#958ea0] mt-1">
              {lang === 'fa'
                ? 'نمونه سایت‌های کدنویسی شده همراه با سورس‌کد در گیت‌هاب و پیش‌نمایش آنلاین.'
                : 'Interactive web platforms with direct live previews and GitHub repositories.'}
            </p>
          </div>

          {isAdminLoggedIn && (
            <button
              onClick={() =>
                setEditWebsiteModal({
                  isNew: true,
                  site: {
                    id: `site-${Date.now()}`,
                    titleFa: 'وب‌سایت جدید',
                    titleEn: 'New Website',
                    descFa: 'توضیحات کوتاه درباره معماری و ویژگی‌های فنی سایت.',
                    descEn: 'Modern responsive platform built with modern stacks.',
                    url: 'https://',
                    githubUrl: 'https://github.com/',
                    badge: 'React & Tailwind',
                  },
                })
              }
              className="px-3.5 py-2 rounded-xl bg-[#38bdf8] hover:bg-[#38bdf8]/90 text-[#131313] font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>افزودن سایت جدید</span>
            </button>
          )}
        </div>

        {/* Glass Cards of Produced Websites */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {websites.map((site) => (
            <div
              key={site.id}
              className="island-glass rounded-2xl p-5 border border-white/10 hover:border-[#38bdf8]/40 transition-all flex flex-col justify-between group relative shadow-md"
            >
              {/* Admin Actions for Website */}
              {isAdminLoggedIn && (
                <div className="absolute top-4 left-4 z-10 flex items-center gap-1">
                  <button
                    onClick={() => setEditWebsiteModal({ isNew: false, site: { ...site } })}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-[#38bdf8] hover:text-[#131313] text-[#38bdf8] transition-colors"
                    title="ویرایش سایت"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('آیا از حذف این سایت مطمئن هستید؟')) {
                        saveWebsites(websites.filter((s) => s.id !== site.id));
                      }
                    }}
                    className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500 hover:text-white text-red-400 transition-colors"
                    title="حذف سایت"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-8 h-8 rounded-xl bg-[#38bdf8]/15 text-[#38bdf8] flex items-center justify-center border border-[#38bdf8]/30">
                    <Globe className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-[#38bdf8] transition-colors">
                      {lang === 'fa' ? site.titleFa : site.titleEn}
                    </h4>
                    {site.badge && (
                      <span className="text-[10px] font-mono text-[#38bdf8]">{site.badge}</span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-[#958ea0] leading-relaxed mb-4">
                  {lang === 'fa' ? site.descFa : site.descEn}
                </p>
              </div>

              {/* Glass Buttons for Live Link & GitHub */}
              <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-white/10">
                <a
                  href={site.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 px-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-xs text-white font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#38bdf8]" />
                  <span>{lang === 'fa' ? 'مشاهده زنده وب‌سایت' : 'Live Preview'}</span>
                </a>

                {site.githubUrl && (
                  <a
                    href={site.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 text-xs text-[#e5e2e1] flex items-center justify-center gap-1.5 transition-all cursor-pointer font-mono"
                    title="مشاهده سورس در گیت‌هاب"
                  >
                    <Github className="w-3.5 h-3.5 text-white" />
                    <span>GitHub</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. PRODUCED APPS SECTION (دانلود نمونه اپلیکیشن‌های ساخته شده با دکمه شیشه‌ای) */}
      {/* ========================================================================= */}
      <div className="pt-6 border-t border-white/10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#a3e635]/10 border border-[#a3e635]/20 text-xs font-mono text-[#a3e635] mb-1.5">
              <Smartphone className="w-3.5 h-3.5" />
              <span>{lang === 'fa' ? 'اپلیکیشن‌های موبایل' : 'Mobile Applications'}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              {lang === 'fa' ? 'دانلود نمونه اپلیکیشن‌های ساخته شده' : 'Download Apps Built by RITM'}
            </h3>
            <p className="text-xs text-[#958ea0] mt-1">
              {lang === 'fa'
                ? 'اپلیکیشن‌های نیتیو و کراس‌پلتفرم تولید شده با توضیحات فنی و لینک مستقیم دریافت.'
                : 'Native and cross-platform apps engineered with clean UI and responsive features.'}
            </p>
          </div>

          {isAdminLoggedIn && (
            <button
              onClick={() =>
                setEditAppModal({
                  isNew: true,
                  app: {
                    id: `app-${Date.now()}`,
                    titleFa: 'اپلیکیشن جدید',
                    titleEn: 'New Mobile App',
                    descFa: 'توضیحات کوتاه درباره امکانات اپلیکیشن و فریم‌ورک مورد استفاده.',
                    descEn: 'Feature-rich modern mobile application.',
                    downloadUrl: 'https://',
                    version: 'v1.0.0',
                    platform: 'Android / iOS',
                  },
                })
              }
              className="px-3.5 py-2 rounded-xl bg-[#a3e635] hover:bg-[#a3e635]/90 text-[#131313] font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>افزودن اپلیکیشن جدید</span>
            </button>
          )}
        </div>

        {/* Glass Cards of Produced Apps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {apps.map((app) => (
            <div
              key={app.id}
              className="island-glass rounded-2xl p-5 border border-white/10 hover:border-[#a3e635]/40 transition-all flex flex-col justify-between group relative shadow-md"
            >
              {/* Admin Actions for App */}
              {isAdminLoggedIn && (
                <div className="absolute top-4 left-4 z-10 flex items-center gap-1">
                  <button
                    onClick={() => setEditAppModal({ isNew: false, app: { ...app } })}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-[#a3e635] hover:text-[#131313] text-[#a3e635] transition-colors"
                    title="ویرایش اپلیکیشن"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('آیا از حذف این اپلیکیشن مطمئن هستید؟')) {
                        saveApps(apps.filter((a) => a.id !== app.id));
                      }
                    }}
                    className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500 hover:text-white text-red-400 transition-colors"
                    title="حذف اپلیکیشن"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-8 h-8 rounded-xl bg-[#a3e635]/15 text-[#a3e635] flex items-center justify-center border border-[#a3e635]/30">
                    <Smartphone className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-[#a3e635] transition-colors">
                      {lang === 'fa' ? app.titleFa : app.titleEn}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-[#958ea0]">
                      {app.platform && <span>{app.platform}</span>}
                      {app.version && <span>· {app.version}</span>}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[#958ea0] leading-relaxed mb-4">
                  {lang === 'fa' ? app.descFa : app.descEn}
                </p>
              </div>

              {/* Glass Button for Direct App Download */}
              <div className="pt-3 border-t border-white/10">
                <a
                  href={app.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-white/[0.06] hover:bg-[#a3e635]/20 hover:border-[#a3e635]/40 border border-white/15 text-xs text-white hover:text-[#a3e635] font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>{lang === 'fa' ? 'دانلود و دریافت اپلیکیشن' : 'Download Application'}</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. FAQ SECTION                                                            */}
      {/* ========================================================================= */}
      <div className="pt-6 border-t border-white/10">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="font-mono text-xs uppercase tracking-wider text-[#d0bcff] font-semibold">
            {lang === 'fa' ? 'پرسش‌های متداول' : 'Frequently Asked Questions'}
          </span>
          <h2 className="text-2xl font-bold text-[#e5e2e1] mt-1 mb-2">
            {lang === 'fa' ? 'سوالی دارید؟ پاسخ‌ها اینجاست' : 'Everything You Need to Know'}
          </h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {FAQ_ITEMS.map((faq, idx) => (
            <div
              key={idx}
              className="glass-card rounded-2xl border border-white/10 overflow-hidden transition-all"
            >
              <button
                onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                className="w-full p-5 text-right flex items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.02]"
              >
                <span className="text-xs sm:text-sm font-semibold text-[#e5e2e1]">
                  {lang === 'fa' ? faq.qFa : faq.qEn}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-[#d0bcff] transition-transform duration-200 shrink-0 ${
                    expandedFaq === idx ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {expandedFaq === idx && (
                <div className="p-5 pt-0 text-xs text-[#958ea0] leading-relaxed border-t border-white/[0.04]">
                  {lang === 'fa' ? faq.aFa : faq.aEn}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: EDIT / ADD PORTFOLIO CARD (Admin Only)                           */}
      {/* ========================================================================= */}
      {editItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="glass-panel w-full max-w-lg rounded-3xl border border-white/20 p-6 shadow-2xl relative text-right space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold text-white">
                {editItemModal.isNew ? 'افزودن نمونه‌کار جدید' : 'ویرایش کارت نمونه‌کار'}
              </h3>
              <button
                onClick={() => setEditItemModal(null)}
                className="p-1 rounded-full bg-white/10 text-white/70 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#958ea0] mb-1">عنوان کارت (فارسی):</label>
                <input
                  type="text"
                  value={editItemModal.item.titleFa}
                  onChange={(e) =>
                    setEditItemModal({
                      ...editItemModal,
                      item: { ...editItemModal.item, titleFa: e.target.value },
                    })
                  }
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-[#958ea0] mb-1">توضیحات (فارسی):</label>
                <textarea
                  rows={3}
                  value={editItemModal.item.descFa}
                  onChange={(e) =>
                    setEditItemModal({
                      ...editItemModal,
                      item: { ...editItemModal.item, descFa: e.target.value },
                    })
                  }
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-white outline-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#958ea0] mb-1">دسته‌بندی:</label>
                  <select
                    value={editItemModal.item.category}
                    onChange={(e) =>
                      setEditItemModal({
                        ...editItemModal,
                        item: {
                          ...editItemModal.item,
                          category: e.target.value,
                          type: e.target.value === 'video' ? 'video' : 'image',
                        },
                      })
                    }
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-white outline-none"
                  >
                    <option value="video">تدوین ویدیو (video)</option>
                    <option value="web">طراحی وب (web)</option>
                    <option value="mobile">اپلیکیشن (mobile)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#958ea0] mb-1">نام فایل (مثال: pr1.mp4):</label>
                  <input
                    type="text"
                    value={editItemModal.item.fileName || ''}
                    onChange={(e) =>
                      setEditItemModal({
                        ...editItemModal,
                        item: { ...editItemModal.item, fileName: e.target.value },
                      })
                    }
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-white outline-none dir-ltr font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#958ea0] mb-1">آدرس مدیا یا ویدیو (URL):</label>
                <input
                  type="text"
                  value={editItemModal.item.mediaUrl || ''}
                  onChange={(e) =>
                    setEditItemModal({
                      ...editItemModal,
                      item: { ...editItemModal.item, mediaUrl: e.target.value },
                    })
                  }
                  placeholder="/nem/pr1.mp4 یا لینک اینترنتی"
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-white outline-none dir-ltr font-mono"
                />
              </div>

              <div>
                <label className="block text-[#958ea0] mb-1">تگ‌ها (با کاما جدا کنید):</label>
                <input
                  type="text"
                  value={(editItemModal.item.tags || []).join(', ')}
                  onChange={(e) =>
                    setEditItemModal({
                      ...editItemModal,
                      item: {
                        ...editItemModal.item,
                        tags: e.target.value.split(',').map((t) => t.trim()),
                      },
                    })
                  }
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-white outline-none"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  onClick={() => {
                    if (editItemModal.isNew) {
                      saveItems([...items, editItemModal.item]);
                    } else {
                      saveItems(
                        items.map((i) =>
                          i.id === editItemModal.item.id ? editItemModal.item : i
                        )
                      );
                    }
                    setEditItemModal(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-[#d0bcff] hover:bg-[#d0bcff]/90 text-[#131313] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>ذخیره تغییرات</span>
                </button>
                <button
                  onClick={() => setEditItemModal(null)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs cursor-pointer"
                >
                  انصراف
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EDIT / ADD PRODUCED WEBSITE (Admin Only)                         */}
      {/* ========================================================================= */}
      {editWebsiteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="glass-panel w-full max-w-md rounded-3xl border border-white/20 p-6 shadow-2xl relative text-right space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold text-white">
                {editWebsiteModal.isNew ? 'افزودن سایت تولید شده' : 'ویرایش وب‌سایت'}
              </h3>
              <button
                onClick={() => setEditWebsiteModal(null)}
                className="p-1 rounded-full bg-white/10 text-white/70 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#958ea0] mb-1">نام و عنوان سایت:</label>
                <input
                  type="text"
                  value={editWebsiteModal.site.titleFa}
                  onChange={(e) =>
                    setEditWebsiteModal({
                      ...editWebsiteModal,
                      site: { ...editWebsiteModal.site, titleFa: e.target.value },
                    })
                  }
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-[#958ea0] mb-1">توضیحات کوتاه سایت:</label>
                <textarea
                  rows={2}
                  value={editWebsiteModal.site.descFa}
                  onChange={(e) =>
                    setEditWebsiteModal({
                      ...editWebsiteModal,
                      site: { ...editWebsiteModal.site, descFa: e.target.value },
                    })
                  }
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-white outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[#958ea0] mb-1">لینک مستقیم سایت (Live URL):</label>
                <input
                  type="text"
                  value={editWebsiteModal.site.url}
                  onChange={(e) =>
                    setEditWebsiteModal({
                      ...editWebsiteModal,
                      site: { ...editWebsiteModal.site, url: e.target.value },
                    })
                  }
                  placeholder="https://example.com"
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-white outline-none dir-ltr font-mono"
                />
              </div>

              <div>
                <label className="block text-[#958ea0] mb-1">لینک ریپازیتوری گیت‌هاب (GitHub):</label>
                <input
                  type="text"
                  value={editWebsiteModal.site.githubUrl || ''}
                  onChange={(e) =>
                    setEditWebsiteModal({
                      ...editWebsiteModal,
                      site: { ...editWebsiteModal.site, githubUrl: e.target.value },
                    })
                  }
                  placeholder="https://github.com/..."
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-white outline-none dir-ltr font-mono"
                />
              </div>

              <div>
                <label className="block text-[#958ea0] mb-1">تگ تکنولوژی (اختیاری):</label>
                <input
                  type="text"
                  value={editWebsiteModal.site.badge || ''}
                  onChange={(e) =>
                    setEditWebsiteModal({
                      ...editWebsiteModal,
                      site: { ...editWebsiteModal.site, badge: e.target.value },
                    })
                  }
                  placeholder="Next.js & Tailwind"
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-white outline-none dir-ltr font-mono"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => {
                    if (editWebsiteModal.isNew) {
                      saveWebsites([...websites, editWebsiteModal.site]);
                    } else {
                      saveWebsites(
                        websites.map((s) =>
                          s.id === editWebsiteModal.site.id ? editWebsiteModal.site : s
                        )
                      );
                    }
                    setEditWebsiteModal(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-[#38bdf8] hover:bg-[#38bdf8]/90 text-[#131313] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>ذخیره سایت</span>
                </button>
                <button
                  onClick={() => setEditWebsiteModal(null)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs cursor-pointer"
                >
                  انصراف
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: EDIT / ADD PRODUCED APP (Admin Only)                             */}
      {/* ========================================================================= */}
      {editAppModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="glass-panel w-full max-w-md rounded-3xl border border-white/20 p-6 shadow-2xl relative text-right space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold text-white">
                {editAppModal.isNew ? 'افزودن اپلیکیشن جدید' : 'ویرایش اطلاعات اپلیکیشن'}
              </h3>
              <button
                onClick={() => setEditAppModal(null)}
                className="p-1 rounded-full bg-white/10 text-white/70 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#958ea0] mb-1">نام اپلیکیشن:</label>
                <input
                  type="text"
                  value={editAppModal.app.titleFa}
                  onChange={(e) =>
                    setEditAppModal({
                      ...editAppModal,
                      app: { ...editAppModal.app, titleFa: e.target.value },
                    })
                  }
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-[#958ea0] mb-1">توضیحات کوتاه اپلیکیشن:</label>
                <textarea
                  rows={2}
                  value={editAppModal.app.descFa}
                  onChange={(e) =>
                    setEditAppModal({
                      ...editAppModal,
                      app: { ...editAppModal.app, descFa: e.target.value },
                    })
                  }
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-white outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[#958ea0] mb-1">لینک دانلود مستقیم / پیش‌نمایش:</label>
                <input
                  type="text"
                  value={editAppModal.app.downloadUrl}
                  onChange={(e) =>
                    setEditAppModal({
                      ...editAppModal,
                      app: { ...editAppModal.app, downloadUrl: e.target.value },
                    })
                  }
                  placeholder="https://... یا لینک کانال تلگرام"
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-white outline-none dir-ltr font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#958ea0] mb-1">نسخه (Version):</label>
                  <input
                    type="text"
                    value={editAppModal.app.version || ''}
                    onChange={(e) =>
                      setEditAppModal({
                        ...editAppModal,
                        app: { ...editAppModal.app, version: e.target.value },
                      })
                    }
                    placeholder="v1.2.0"
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-white outline-none dir-ltr font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[#958ea0] mb-1">پلتفرم:</label>
                  <input
                    type="text"
                    value={editAppModal.app.platform || ''}
                    onChange={(e) =>
                      setEditAppModal({
                        ...editAppModal,
                        app: { ...editAppModal.app, platform: e.target.value },
                      })
                    }
                    placeholder="Android / PWA"
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-white outline-none dir-ltr font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => {
                    if (editAppModal.isNew) {
                      saveApps([...apps, editAppModal.app]);
                    } else {
                      saveApps(
                        apps.map((a) =>
                          a.id === editAppModal.app.id ? editAppModal.app : a
                        )
                      );
                    }
                    setEditAppModal(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-[#a3e635] hover:bg-[#a3e635]/90 text-[#131313] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>ذخیره اپلیکیشن</span>
                </button>
                <button
                  onClick={() => setEditAppModal(null)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs cursor-pointer"
                >
                  انصراف
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MEDIA PREVIEW MODAL                                                       */}
      {/* ========================================================================= */}
      {selectedMediaProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="glass-panel w-full max-w-3xl rounded-3xl border border-white/20 p-6 shadow-2xl relative space-y-4 text-right overflow-hidden my-auto max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#d0bcff]/15 text-[#d0bcff] uppercase">
                  {selectedMediaProject.category}
                </span>
                {selectedMediaProject.fileName && (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#a3e635]/15 text-[#a3e635] border border-[#a3e635]/30 dir-ltr">
                    nem/{selectedMediaProject.fileName}
                  </span>
                )}
                <h3 className="text-base font-bold text-white">
                  {lang === 'fa' ? selectedMediaProject.titleFa : selectedMediaProject.titleEn}
                </h3>
              </div>
              <button
                onClick={() => setSelectedMediaProject(null)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-[#8c94a4] hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Video or Image Viewport */}
            <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-black/90 flex items-center justify-center border border-white/10">
              {selectedMediaProject.type === 'video' ? (
                <video
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                  src={selectedMediaProject.mediaUrl}
                  poster={selectedMediaProject.posterUrl || selectedMediaProject.image}
                >
                  مرورگر شما از پخش ویدیو پشتیبانی نمی‌کند.
                </video>
              ) : (
                <img
                  src={selectedMediaProject.mediaUrl || selectedMediaProject.image}
                  alt={selectedMediaProject.titleFa}
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            <p className="text-xs text-[#9da3af] leading-relaxed">
              {lang === 'fa' ? selectedMediaProject.descFa : selectedMediaProject.descEn}
            </p>

            <div className="pt-2 flex justify-between items-center border-t border-white/10">
              <button
                onClick={() => {
                  setSelectedMediaProject(null);
                  onSelectCategoryForOrder(selectedMediaProject.category);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#d0bcff] hover:bg-[#d0bcff]/90 text-[#131313] font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <span>{lang === 'fa' ? 'سفارش پروژه‌ای مشابه' : 'Order Similar Project'}</span>
                {lang === 'fa' ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => setSelectedMediaProject(null)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs cursor-pointer"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
