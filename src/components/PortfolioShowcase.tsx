import React, { useState } from 'react';
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
} from 'lucide-react';
import { SERVICES, PORTFOLIO_ITEMS, FAQ_ITEMS, heroImage } from '../data/mockData';
import { ProjectType } from '../types';

interface PortfolioShowcaseProps {
  lang: 'fa' | 'en';
  onSelectCategoryForOrder: (category: ProjectType) => void;
}

export const PortfolioShowcase: React.FC<PortfolioShowcaseProps> = ({
  lang,
  onSelectCategoryForOrder,
}) => {
  const [filter, setFilter] = useState<'all' | ProjectType>('all');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const filteredItems = PORTFOLIO_ITEMS.filter((item) =>
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
        <div className="absolute inset-0 bg-gradient-to-r from-[#131313] via-[#131313]/90 to-transparent" />

        <div className="relative z-10 max-w-2xl text-right">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-mono text-[#d0bcff] mb-4">
            <span className="w-2 h-2 rounded-full bg-[#d0bcff] animate-pulse" />
            <span>{lang === 'fa' ? 'آژانس خلاقیت دیجیتال ریتم' : 'RITM Creative Agency'}</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-[#e5e2e1] leading-tight mb-4 tracking-tight">
            {lang === 'fa' ? (
              <>
                ریتم – <span className="text-[#d0bcff] text-glow">تدوین خلاقانه</span> و مهندسی دیجیتال
              </>
            ) : (
              <>
                RITM – <span className="text-[#d0bcff]">Creative Production</span> & Code
              </>
            )}
          </h1>

          <p className="text-sm md:text-base text-[#958ea0] leading-relaxed mb-8">
            {lang === 'fa'
              ? 'ما شکاف میان هنر دیجیتال و مهندسی نرم‌افزار را پر کرده‌ایم. با استودیو ریتم، برند شما با بالاترین استانداردهای بصری و فنی در تلگرام و وب خواهد درخشید.'
              : 'Bridging the gap between digital arts and software engineering. Elevating brands with cinematic visuals and bespoke software.'}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onSelectCategoryForOrder('video')}
              className="px-6 py-3 rounded-xl bg-[#d0bcff] text-[#131313] font-bold text-xs hover:bg-[#d0bcff]/90 transition-all shadow-lg hover:shadow-[#d0bcff]/20"
            >
              {lang === 'fa' ? 'شروع پروژه جدید' : 'Start a Project'}
            </button>
            <a
              href="https://t.me/RITM_FreeLancbot"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[#e5e2e1] text-xs font-semibold transition-all inline-flex items-center gap-2"
            >
              <span>{lang === 'fa' ? 'ربات تلگرام @RITM_FreeLancbot' : 'Telegram Bot'}</span>
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
              ? 'تلفیق ریتم، حرکت، تصویر و کد برای خلق تجربه‌ای متمایز'
              : 'Combining motion, cinematic audio, and modern code'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {SERVICES.map((srv) => (
            <div
              key={srv.id}
              className="glass-card rounded-2xl p-6 border border-white/10 flex flex-col justify-between group hover:border-[#d0bcff]/40 transition-all text-right"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#d0bcff] group-hover:scale-110 transition-transform">
                    {srv.id === 'video' ? (
                      <Film className="w-6 h-6" />
                    ) : srv.id === 'web' ? (
                      <Code className="w-6 h-6" />
                    ) : srv.id === 'mobile' ? (
                      <Smartphone className="w-6 h-6" />
                    ) : (
                      <Sparkles className="w-6 h-6" />
                    )}
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-[#958ea0]">
                    {srv.badge}
                  </span>
                </div>

                <h3 className="text-base font-bold text-[#e5e2e1] mb-2 group-hover:text-[#d0bcff] transition-colors">
                  {lang === 'fa' ? srv.titleFa : srv.titleEn}
                </h3>
                <p className="text-xs text-[#958ea0] mb-4 leading-relaxed">
                  {lang === 'fa' ? srv.descFa : srv.descEn}
                </p>

                <ul className="space-y-1.5 mb-6 text-xs text-[#e5e2e1]/80">
                  {(lang === 'fa' ? srv.featuresFa : srv.featuresEn).map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#d0bcff]" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#958ea0] block">
                    {lang === 'fa' ? 'شروع تعرفه:' : 'Starting at:'}
                  </span>
                  <span className="text-xs font-mono font-bold text-[#e5e2e1]">
                    {srv.startingPrice}
                  </span>
                </div>
                <button
                  onClick={() => onSelectCategoryForOrder(srv.id)}
                  className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-[#d0bcff] hover:text-[#131313] text-[#e5e2e1] text-xs font-medium transition-all"
                >
                  {lang === 'fa' ? 'ثبت سفارش' : 'Order'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Portfolio Showcase Grid */}
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-[#e5e2e1]">
              {lang === 'fa' ? 'نمونه‌کارهای برگزیده' : 'Featured Portfolio'}
            </h2>
            <p className="text-xs text-[#958ea0] mt-1">
              {lang === 'fa' ? 'منتخبی از پروژه‌های اجرا شده استودیو ریتم' : 'A selection of our latest client work'}
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10 text-xs">
            {[
              { id: 'all', labelFa: 'همه پروژه‌ها', labelEn: 'All' },
              { id: 'video', labelFa: 'تدوین ویدیو', labelEn: 'Video' },
              { id: 'web', labelFa: 'توسعه وب', labelEn: 'Web' },
              { id: 'mobile', labelFa: 'اپلیکیشن', labelEn: 'Mobile' },
              { id: 'other', labelFa: 'هوش مصنوعی', labelEn: 'AI' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  filter === tab.id
                    ? 'bg-[#d0bcff] text-[#131313] font-bold'
                    : 'text-[#958ea0] hover:text-[#e5e2e1]'
                }`}
              >
                {lang === 'fa' ? tab.labelFa : tab.labelEn}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="glass-card rounded-2xl overflow-hidden border border-white/10 group flex flex-col justify-between"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-black/50">
                <img
                  src={item.image}
                  alt={item.titleFa}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#131313] via-transparent to-transparent opacity-80" />
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  {item.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-black/60 text-[#e5e2e1] backdrop-blur-md border border-white/10"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

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
                    onClick={() => onSelectCategoryForOrder(item.category)}
                    className="inline-flex items-center gap-1.5 text-xs text-[#d0bcff] hover:underline font-semibold"
                  >
                    <span>{lang === 'fa' ? 'سفارش پروژه مشابه' : 'Request Similar'}</span>
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

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto pt-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[#e5e2e1]">
            {lang === 'fa' ? 'سوالات متداول (FAQ)' : 'Frequently Asked Questions'}
          </h2>
          <p className="text-xs text-[#958ea0] mt-1">
            {lang === 'fa' ? 'پاسخ به سوالات رایج پیرامون زمان‌بندی، قرارداد و هزینه‌ها' : 'Common queries regarding contracts and delivery'}
          </p>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((faq, index) => {
            const isExpanded = expandedFaq === index;
            return (
              <div
                key={index}
                className="glass-card rounded-xl border border-white/10 overflow-hidden text-right transition-all"
              >
                <button
                  onClick={() => setExpandedFaq(isExpanded ? null : index)}
                  className="w-full p-4 flex items-center justify-between text-xs font-bold text-[#e5e2e1] hover:text-[#d0bcff] transition-colors"
                >
                  <span className="flex-1 text-right">{lang === 'fa' ? faq.qFa : faq.qEn}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#958ea0] transition-transform duration-300 shrink-0 ${
                      isExpanded ? 'rotate-180 text-[#d0bcff]' : ''
                    }`}
                  />
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 text-xs text-[#958ea0] leading-relaxed border-t border-white/[0.05]">
                    {lang === 'fa' ? faq.aFa : faq.aEn}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
