import React from 'react';
import { SOCIAL_LINKS } from '../data/mockData';

interface FooterProps {
  lang: 'fa' | 'en';
}

export const Footer: React.FC<FooterProps> = ({ lang }) => {
  return (
    <footer className="w-full border-t border-white/[0.08] mt-auto py-8 bg-[#101010] text-[#958ea0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs">
        {/* Brand Lockup */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full overflow-hidden bg-white/5 border border-white/10 p-0.5 flex items-center justify-center">
            <img src={`${import.meta.env.BASE_URL}assets/logo.png`} alt="RITM" className="w-full h-full object-contain" />
          </div>
          <span className="text-[#e5e2e1] font-semibold">
            {lang === 'fa' ? 'ریتم — استودیو خلاقیت دیجیتال' : 'RITM — Digital Creative Agency'}
          </span>
        </div>

        {/* Social Links */}
        <div className="flex items-center gap-5 dir-ltr font-mono text-xs">
          <a
            href={SOCIAL_LINKS.telegramBot}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#d0bcff] transition-colors"
          >
            @RITM_FreeLancbot
          </a>
          <span>·</span>
          <a
            href={SOCIAL_LINKS.telegramChannel}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#d0bcff] transition-colors"
          >
            Telegram
          </a>
          <span>·</span>
          <a
            href={SOCIAL_LINKS.youtube}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#d0bcff] transition-colors"
          >
            YouTube
          </a>
          <span>·</span>
          <a
            href={SOCIAL_LINKS.x}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#d0bcff] transition-colors"
          >
            X (Twitter)
          </a>
          <span>·</span>
          <a
            href={SOCIAL_LINKS.ble}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#d0bcff] transition-colors"
          >
            Bale
          </a>
        </div>

        {/* Copyright */}
        <div className="font-mono text-[11px] text-[#958ea0]">
          © {new Date().getFullYear()} RITM. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
