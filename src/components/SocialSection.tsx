import React, { useState } from 'react';
import { Send, Youtube, Twitter, MessageSquare, ExternalLink, Copy, Check, Sparkles } from 'lucide-react';
import { SOCIAL_LINKS } from '../data/mockData';

interface SocialSectionProps {
  lang: 'fa' | 'en';
}

export const SocialSection: React.FC<SocialSectionProps> = ({ lang }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const channels = [
    {
      id: 'telegram',
      nameFa: 'کانال رسمی تلگرام ریتم',
      nameEn: 'Official Telegram Channel',
      handle: '@RITM_FreeLancer',
      descFa: 'انتشار جدیدترین نمونه‌کارهای تدوین ویدیو، پکیج‌های پریمیر، تخفیف‌ها و آموزش‌های ویدیویی',
      descEn: 'Latest video editing showreels, Premiere assets, discounts & updates',
      url: SOCIAL_LINKS.telegramChannel,
      badgeFa: 'کانال اصلی',
      badgeEn: 'Primary Channel',
      color: 'from-[#229ed9]/20 to-[#0088cc]/10',
      borderColor: 'border-[#229ed9]/30 hover:border-[#229ed9]',
      btnBg: 'bg-[#229ed9] hover:bg-[#229ed9]/90',
      icon: Send,
    },
    {
      id: 'youtube',
      nameFa: 'کانال یوتیوب استودیو ریتم',
      nameEn: 'YouTube Channel',
      handle: '@RITM_Editz',
      descFa: 'شویس‌های 4K تدوین، آموزش‌های تخصصی ادوبی پریمیر پرو و پشت صحنه پروژه‌ها',
      descEn: '4K video showreels, Adobe Premiere tutorials and behind the scenes',
      url: SOCIAL_LINKS.youtube,
      badgeFa: 'ویدیوهای 4K',
      badgeEn: '4K Content',
      color: 'from-[#ff0000]/20 to-[#cc0000]/10',
      borderColor: 'border-[#ff0000]/30 hover:border-[#ff0000]',
      btnBg: 'bg-[#ff0000] hover:bg-[#ff0000]/90',
      icon: Youtube,
    },
    {
      id: 'x',
      nameFa: 'صفحه ایکس (توییتر)',
      nameEn: 'X (Twitter) Profile',
      handle: '@RITM_Editz',
      descFa: 'ارتباط مستقیم، نکات ریز تدوین ویدیو، بحث‌های فنی تکنولوژی و هوش مصنوعی',
      descEn: 'Direct engagement, video editing tips, creative tech and AI updates',
      url: SOCIAL_LINKS.x,
      badgeFa: 'به‌روزرسانی سریع',
      badgeEn: 'Real-time',
      color: 'from-white/10 to-white/5',
      borderColor: 'border-white/20 hover:border-white/40',
      btnBg: 'bg-white hover:bg-white/90 text-black',
      icon: Twitter,
    },
    {
      id: 'ble',
      nameFa: 'کانال پیام‌رسان بله',
      nameEn: 'Bale Messenger Channel',
      handle: 'ble.ir/RITM_FreeLancer',
      descFa: 'دسترسی سریع و بدون نیاز به فیلترشکن برای پیگیری اخبار و هماهنگی سفارش‌ها',
      descEn: 'Direct local channel for quick domestic access and project updates',
      url: SOCIAL_LINKS.ble,
      badgeFa: 'داخلی بدون فیلتر',
      badgeEn: 'Local Access',
      color: 'from-[#14b8a6]/20 to-[#0f766e]/10',
      borderColor: 'border-[#14b8a6]/30 hover:border-[#14b8a6]',
      btnBg: 'bg-[#14b8a6] hover:bg-[#14b8a6]/90',
      icon: MessageSquare,
    },
  ];

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
            ? 'جدیدترین نمونه‌کارها، ویدیوهای آموزشی پریمیر و اطلاعیه‌های رسمی را در کانال‌های زیر مشاهده کنید.'
            : 'Explore our latest edits, Premiere tips, and direct communications on our channels.'}
        </p>
      </div>

      {/* Grid of channels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {channels.map((ch) => {
          const Icon = ch.icon;
          const isCopied = copiedId === ch.id;

          return (
            <div
              key={ch.id}
              className={`glass-panel rounded-2xl p-6 border ${ch.borderColor} transition-all duration-300 relative overflow-hidden flex flex-col justify-between group hover:shadow-2xl`}
            >
              {/* Background Ambient Glow */}
              <div
                className={`absolute -top-12 -left-12 w-40 h-40 bg-gradient-to-br ${ch.color} rounded-full blur-2xl opacity-40 group-hover:opacity-70 transition-opacity pointer-events-none`}
              />

              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="text-right">
                      <h3 className="text-base font-bold text-white group-hover:text-[#d0bcff] transition-colors">
                        {lang === 'fa' ? ch.nameFa : ch.nameEn}
                      </h3>
                      <span className="text-xs font-mono text-[#8c94a4] dir-ltr inline-block">
                        {ch.handle}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[#d0bcff]">
                    {lang === 'fa' ? ch.badgeFa : ch.badgeEn}
                  </span>
                </div>

                <p className="text-xs text-[#9da3af] leading-relaxed mb-6 text-right">
                  {lang === 'fa' ? ch.descFa : ch.descEn}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between gap-2 pt-4 border-t border-white/[0.08]">
                <button
                  onClick={() => handleCopy(ch.handle, ch.id)}
                  className="px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/10 text-xs text-[#8c94a4] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="کپی آیدی"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-[#a3e635]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? (lang === 'fa' ? 'کپی شد!' : 'Copied!') : (lang === 'fa' ? 'کپی آیدی' : 'Copy')}</span>
                </button>

                <a
                  href={ch.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`px-4 py-2 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
                    ch.id === 'x' ? 'bg-white hover:bg-white/90 text-black' : ch.btnBg
                  }`}
                >
                  <span>{lang === 'fa' ? 'عضویت و مشاهده' : 'Open Channel'}</span>
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
