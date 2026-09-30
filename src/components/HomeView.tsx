import React from 'react';
import {
  Film,
  Code,
  Smartphone,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Send,
  ExternalLink,
  MessageCircle,
  Clock,
  Layers,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { ProjectType } from '../types';
import { SERVICES, heroImage, videoImage, webImage, mobileImage } from '../data/mockData';
import { SocialSection } from './SocialSection';

interface HomeViewProps {
  lang: 'fa' | 'en';
  onStartOrder: (category?: ProjectType) => void;
  onNavigateToPortfolio: () => void;
  onNavigateToClient: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  lang,
  onStartOrder,
  onNavigateToPortfolio,
  onNavigateToClient,
}) => {
  return (
    <div className="w-full space-y-16 pb-16">
      {/* 1. CLEAN HIGH-CONTRAST HERO */}
      <section className="relative pt-12 pb-16 px-4 max-w-5xl mx-auto text-center space-y-6">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-[#d0bcff]">
          <span className="w-2 h-2 rounded-full bg-[#a3e635]" />
          <span>{lang === 'fa' ? 'استودیو تدوین ویدیو و مهندسی دیجیتال ریتم' : 'RITM Production & Creative Code'}</span>
        </div>

        {/* Big Bold Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.2]">
          {lang === 'fa' ? (
            <>
              خلق ویدیوهای <span className="text-[#d0bcff]">سینمایی و پربازدید</span>
              <br />
              همراه با وب‌سایت‌های <span className="text-[#38bdf8]">فوق‌العاده مدرن</span>
            </>
          ) : (
            <>
              High-Impact <span className="text-[#d0bcff]">Cinematic Video</span>
              <br />
              & Modern <span className="text-[#38bdf8]">Digital Platforms</span>
            </>
          )}
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-[#9da3af] max-w-2xl mx-auto leading-relaxed">
          {lang === 'fa'
            ? 'تدوین حرفه‌ای تیزر تبلیغاتی، ریلز اینستاگرام، اصلاح رنگ سینمایی و ساخت وب‌سایت با تعیین بودجه و شرایط دلخواه توسط خود شما.'
            : 'Professional editing for commercial teasers, Instagram reels, DaVinci color grading, and modern web development.'}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onStartOrder('video')}
            className="px-7 py-3.5 rounded-xl bg-[#d0bcff] hover:bg-[#d0bcff]/90 text-[#0d0f17] font-extrabold text-xs sm:text-sm transition-colors cursor-pointer flex items-center gap-2 shadow-sm"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>{lang === 'fa' ? 'ثبت سفارش با بودجه دلخواه شما' : 'Start Project (Flexible Budget)'}</span>
            {lang === 'fa' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </button>

          <button
            onClick={onNavigateToPortfolio}
            className="px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer flex items-center gap-2"
          >
            <Film className="w-4 h-4 text-[#adc6ff]" />
            <span>{lang === 'fa' ? 'مشاهده نمونه‌کارها' : 'View Portfolio'}</span>
          </button>

          <a
            href="https://t.me/RITM_FreeLancer"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3.5 rounded-xl bg-[#229ed9] hover:bg-[#229ed9]/90 text-white font-semibold text-xs sm:text-sm transition-colors flex items-center gap-2 shadow-sm"
          >
            <Send className="w-4 h-4" />
            <span>{lang === 'fa' ? 'کانال رسمی تلگرام' : 'Telegram Channel'}</span>
          </a>
        </div>

        {/* Live Metrics */}
        <div className="pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
          <div className="p-2 text-center">
            <div className="text-2xl font-black text-white font-mono">+۳۸۰</div>
            <div className="text-[11px] text-[#8c94a4]">{lang === 'fa' ? 'پروژه موفق' : 'Projects Done'}</div>
          </div>
          <div className="p-2 text-center">
            <div className="text-2xl font-black text-[#a3e635] font-mono">۱۰۰٪</div>
            <div className="text-[11px] text-[#8c94a4]">{lang === 'fa' ? 'رضایت کارفرما' : 'Satisfaction'}</div>
          </div>
          <div className="p-2 text-center">
            <div className="text-2xl font-black text-[#38bdf8] font-mono">اختیاری</div>
            <div className="text-[11px] text-[#8c94a4]">{lang === 'fa' ? 'بودجه کاملاً توافقی' : 'Flexible Budget'}</div>
          </div>
          <div className="p-2 text-center">
            <div className="text-2xl font-black text-[#ffb869] font-mono">مستقیم</div>
            <div className="text-[11px] text-[#8c94a4]">{lang === 'fa' ? 'ارتباط آنی در تلگرام' : 'Telegram Sync'}</div>
          </div>
        </div>
      </section>

      {/* 2. SERVICES OVERVIEW */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
          <h2 className="text-xl sm:text-3xl font-extrabold text-white">
            {lang === 'fa' ? 'زمینه‌های کاری استودیو ریتم' : 'Our Creative Disciplines'}
          </h2>
          <p className="text-xs sm:text-sm text-[#8c94a4]">
            {lang === 'fa'
              ? 'هر پروژه متناسب با هویت برند شما و بودجه مدنظرتان شخصی‌سازی می‌شود.'
              : 'Every project is tailored to your brand identity and vision.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              id: 'video' as ProjectType,
              title: lang === 'fa' ? 'تدوین ویدیو و تیزر' : 'Video Editing & Teasers',
              desc: lang === 'fa' ? 'تیزرهای تبلیغاتی، ریلزهای پربازدید اینستاگرام، اصلاح رنگ سینمایی DaVinci و طراحی صدا' : 'Commercial teasers, social reels, cinematic color grading and audio design',
              icon: Film,
              color: 'text-[#d0bcff]',
              img: videoImage,
            },
            {
              id: 'web' as ProjectType,
              title: lang === 'fa' ? 'طراحی و توسعه وب' : 'Web & Platform Design',
              desc: lang === 'fa' ? 'وب‌سایت‌های شرکتی، فروشگاهی و لندینگ پیج‌های سریع با اتصال به ربات و دیتابیس' : 'Corporate websites, landing pages and fast modern web apps',
              icon: Code,
              color: 'text-[#38bdf8]',
              img: webImage,
            },
            {
              id: 'mobile' as ProjectType,
              title: lang === 'fa' ? 'مینی‌اپ و ربات تلگرام' : 'Telegram Mini-Apps & Bots',
              desc: lang === 'fa' ? 'طراحی بات‌های هوشمند فروشگاهی، ارائه‌دهنده خدمات و مینی‌اپ‌های تعاملی تلگرام' : 'Custom Telegram mini-apps, automated bots and business workflows',
              icon: Smartphone,
              color: 'text-[#ffb869]',
              img: mobileImage,
            },
            {
              id: 'other' as ProjectType,
              title: lang === 'fa' ? 'هوش مصنوعی و خلاقیت' : 'AI & Motion Graphics',
              desc: lang === 'fa' ? 'ویدیوهای هوش مصنوعی، ترنزیشن‌های اختصاصی، لوگوموشن و اتوماسیون برندها' : 'AI video generation, logo animation and custom creative solutions',
              icon: Sparkles,
              color: 'text-[#a3e635]',
              img: heroImage,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => onStartOrder(item.id)}
                className="glass-card rounded-2xl p-5 space-y-3 cursor-pointer group"
              >
                <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 mb-2">
                  <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                  <div className="absolute top-2.5 right-2.5 w-8 h-8 rounded-lg bg-black/70 backdrop-blur-md flex items-center justify-center text-white">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-[#d0bcff] transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-[#8c94a4] leading-relaxed">
                  {item.desc}
                </p>

                <div className="pt-2 flex items-center justify-between text-xs font-semibold text-[#d0bcff]">
                  <span>{lang === 'fa' ? 'ثبت سفارش این بخش' : 'Order This'}</span>
                  {lang === 'fa' ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. WHY RITM (ADVANTAGES) */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-white/10 space-y-6">
          <div className="text-center space-y-1">
            <h3 className="text-lg sm:text-2xl font-bold text-white">
              {lang === 'fa' ? 'چرا همکاری با استودیو ریتم؟' : 'Why Choose RITM?'}
            </h3>
            <p className="text-xs text-[#8c94a4]">
              {lang === 'fa' ? 'اصول حرفه‌ای ما برای تضمین رضایت کامل شما' : 'Our standard for guaranteed client satisfaction'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-right">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#d0bcff]/15 text-[#d0bcff] flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-white">
                {lang === 'fa' ? 'بودجه و زمان کاملاً توافقی' : 'Flexible Budget & Delivery'}
              </h4>
              <p className="text-xs text-[#8c94a4] leading-relaxed">
                {lang === 'fa'
                  ? 'شما سقف بودجه و مهلت تحویل مدنظرتان را تعیین می‌کنید؛ ما بهترین سناریوی اجرایی را بر همان اساس تنظیم می‌کنیم.'
                  : 'You set your budget and deadlines; we adapt the best production pipeline.'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#38bdf8]/15 text-[#38bdf8] flex items-center justify-center">
                <Send className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-white">
                {lang === 'fa' ? 'ارتباط مستقیم و ارسال فایل در تلگرام' : 'Direct Telegram Integration'}
              </h4>
              <p className="text-xs text-[#8c94a4] leading-relaxed">
                {lang === 'fa'
                  ? 'سفارشات و فایل‌های نمونه عکس و فیلم مستقیماً به تلگرام مدیریت ارسال شده و بدون واسطه با شما گفتگو می‌شود.'
                  : 'Orders and uploaded media forward directly to management on Telegram.'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#a3e635]/15 text-[#a3e635] flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-white">
                {lang === 'fa' ? 'بازبینی رایگان تا رضایت کامل' : 'Free Unlimited Revisions'}
              </h4>
              <p className="text-xs text-[#8c94a4] leading-relaxed">
                {lang === 'fa'
                  ? 'نسخه اولیه به شما تحویل داده شده و ادیت‌های مدنظر تا رسیدن به نتیجه ایده‌آل روی پروژه اعمال خواهد شد.'
                  : 'We revise the project until you are completely satisfied with the final result.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SOCIAL MEDIA CHANNELS */}
      <SocialSection lang={lang} />

      {/* 5. TRACKING & DIRECT CHAT CTA */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="rounded-2xl p-6 sm:p-8 border border-white/10 bg-[#12141c] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-right">
            <h4 className="text-base sm:text-lg font-bold text-white">
              {lang === 'fa' ? 'قبلاً سفارش ثبت کرده‌اید؟' : 'Already have an order?'}
            </h4>
            <p className="text-xs text-[#8c94a4]">
              {lang === 'fa'
                ? 'با کد رهگیری اختصاصی وضعیت روند کار و مراحل تدوین را بررسی کنید.'
                : 'Track the status of your project using your tracking code.'}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onNavigateToClient}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              {lang === 'fa' ? 'پیگیری سفارش' : 'Track Order'}
            </button>
            <a
              href="https://t.me/AdvRFL"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-[#d0bcff] hover:bg-[#d0bcff]/90 text-[#0d0f17] font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>{lang === 'fa' ? 'چت با مدیریت (@AdvRFL)' : 'Chat on Telegram'}</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
