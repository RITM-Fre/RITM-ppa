import React, { useState } from 'react';
import {
  Send,
  Youtube,
  Twitter,
  MessageSquare,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  Instagram,
  Github,
  Linkedin,
  Globe,
} from 'lucide-react';
import { SOCIAL_LINKS } from '../data/mockData';

export interface SocialChannelItem {
  id: string;
  nameFa: string;
  nameEn: string;
  handle: string;
  descFa: string;
  descEn: string;
  url: string;
  badgeFa?: string;
  badgeEn?: string;
  platform: 'telegram' | 'youtube' | 'x' | 'ble' | 'instagram' | 'github' | 'linkedin' | 'web';
  accentColor?: string;
  btnBg?: string;
}

interface SocialSectionProps {
  lang: 'fa' | 'en';
}

export const SocialSection: React.FC<SocialSectionProps> = ({ lang }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Dynamic social links from storage or defaults
  const [channels] = useState<SocialChannelItem[]>(() => {
    try {
      const stored = localStorage.getItem('ritm_social_channels');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      {
        id: 'telegram',
        nameFa: 'کانال رسمی تلگرام ریتم',
        nameEn: 'Official Telegram Channel',
        handle: '@RITM_FreeLancer',
        descFa: 'انتشار جدیدترین نمونه‌کارهای تدوین ویدیو، فایل‌های پریمیر، تخفیف‌ها و اطلاعیه‌ها',
        descEn: 'Latest video editing showreels, Premiere assets, discounts & updates',
        url: SOCIAL_LINKS.telegramChannel,
        badgeFa: 'کانال اصلی',
        badgeEn: 'Primary Channel',
        platform: 'telegram',
        accentColor: 'from-[#0088cc]/25 to-[#229ed9]/10',
        btnBg: 'bg-[#229ed9] hover:bg-[#229ed9]/90 text-white shadow-[#229ed9]/30',
      },
      {
        id: 'youtube',
        nameFa: 'کانال یوتیوب ریتم',
        nameEn: 'YouTube Channel',
        handle: '@RITM_Editz',
        descFa: 'شویس‌های 4K تدوین، آموزش‌های تخصصی ادوبی پریمیر پرو و پشت صحنه پروژه‌ها',
        descEn: '4K video showreels, Adobe Premiere tutorials and behind the scenes',
        url: SOCIAL_LINKS.youtube,
        badgeFa: 'ویدیوهای 4K',
        badgeEn: '4K Content',
        platform: 'youtube',
        accentColor: 'from-[#ff0000]/25 to-[#b30000]/10',
        btnBg: 'bg-[#ff0000] hover:bg-[#ff0000]/90 text-white shadow-[#ff0000]/30',
      },
      {
        id: 'x',
        nameFa: 'صفحه ایکس (توییتر) ریتم',
        nameEn: 'X (Twitter) Profile',
        handle: '@RITM_Editz',
        descFa: 'ارتباط مستقیم، نکات ریز تدوین ویدیو، بحث‌های فنی تکنولوژی و هوش مصنوعی',
        descEn: 'Direct engagement, video editing tips, creative tech and AI updates',
        url: SOCIAL_LINKS.x,
        badgeFa: 'به‌روزرسانی سریع',
        badgeEn: 'Real-time',
        platform: 'x',
        accentColor: 'from-white/15 to-white/5',
        btnBg: 'bg-[#18181b] hover:bg-[#27272a] text-white border border-white/20',
      },
      {
        id: 'ble',
        nameFa: 'کانال پیام‌رسان بله ریتم',
        nameEn: 'Bale Messenger Channel',
        handle: 'ble.ir/RITM_FreeLancer',
        descFa: 'دسترسی سریع و بدون فیلتر برای پیگیری اخبار و ارسال سریع فایل‌های سنگین',
        descEn: 'Direct local channel for quick domestic access and project updates',
        url: SOCIAL_LINKS.ble,
        badgeFa: 'داخلی بدون فیلتر',
        badgeEn: 'Local Access',
        platform: 'ble',
        accentColor: 'from-[#10b981]/25 to-[#059669]/10',
        btnBg: 'bg-[#10b981] hover:bg-[#10b981]/90 text-white shadow-[#10b981]/30',
      },
    ];
  });

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'telegram':
        return Send;
      case 'youtube':
        return Youtube;
      case 'x':
        return Twitter;
      case 'ble':
        return MessageSquare;
      case 'instagram':
        return Instagram;
      case 'github':
        return Github;
      case 'linkedin':
        return Linkedin;
      default:
        return Globe;
    }
  };

  const handleCopy = (handle: string, id: string) => {
    navigator.clipboard.writeText(handle);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <section className="w-full max-w-6xl mx-auto px-4 py-12 space-y-8">
      {/* Title */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#d0bcff]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{lang === 'fa' ? 'کانال‌ها و شبکه‌های اجتماعی ریتم' : 'Official Social Channels'}</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          {lang === 'fa' ? 'ما را در دنیای دیجیتال دنبال کنید' : 'Connect With Us Across Platforms'}
        </h2>
        <p className="text-xs sm:text-sm text-[#8c94a4] max-w-xl mx-auto leading-relaxed">
          {lang === 'fa'
            ? 'جدیدترین نمونه‌کارها، ویدیوهای آموزشی و اطلاعیه‌های رسمی را در پلتفرم‌های زیر مشاهده کنید.'
            : 'Explore our latest edits, tips, and direct communications on our channels.'}
        </p>
      </div>

      {/* Grid of channels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {channels.map((ch) => {
          const Icon = getPlatformIcon(ch.platform);
          return (
            <div
              key={ch.id}
              className={`relative rounded-2xl p-5 border border-white/10 bg-gradient-to-br ${ch.accentColor || 'from-white/10 to-white/5'} backdrop-blur-xl hover:border-white/20 transition-all flex flex-col justify-between group shadow-lg`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-black/40 border border-white/15 flex items-center justify-center text-white group-hover:scale-105 transition-transform shadow-inner">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-[#d0bcff] transition-colors">
                        {lang === 'fa' ? ch.nameFa : ch.nameEn}
                      </h3>
                      <button
                        onClick={() => handleCopy(ch.handle, ch.id)}
                        className="inline-flex items-center gap-1.5 text-xs text-[#958ea0] hover:text-[#d0bcff] font-mono transition-colors dir-ltr text-left cursor-pointer mt-0.5"
                        title="کلیک برای کپی آیدی"
                      >
                        <span>{ch.handle}</span>
                        {copiedId === ch.id ? (
                          <Check className="w-3 h-3 text-[#a3e635]" />
                        ) : (
                          <Copy className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                        )}
                      </button>
                    </div>
                  </div>

                  {ch.badgeFa && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-white/10 border border-white/15 text-white/90 shrink-0">
                      {lang === 'fa' ? ch.badgeFa : ch.badgeEn}
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#9da3af] leading-relaxed mb-5">
                  {lang === 'fa' ? ch.descFa : ch.descEn}
                </p>
              </div>

              {/* Action Link Button with Optimized Platform Colors */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-[11px] text-[#71717a] font-mono">
                  {copiedId === ch.id ? 'آیدی کپی شد ✓' : 'اتصال مستقیم'}
                </span>

                <a
                  href={ch.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer ${
                    ch.btnBg || 'bg-[#d0bcff] hover:bg-[#d0bcff]/90 text-[#131313]'
                  }`}
                >
                  <span>{lang === 'fa' ? 'عضویت و مشاهده' : 'Join & View'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
