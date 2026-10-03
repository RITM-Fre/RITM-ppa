import React, { useRef } from 'react';
import {
  FileText,
  Printer,
  CheckCircle2,
  X,
  Shield,
  Download,
  Calendar,
  User,
  Mail,
  Award,
  Clock,
  Sparkles,
  Lock,
} from 'lucide-react';
import { Order } from '../types';

interface ProjectContractModalProps {
  order: Order;
  lang: 'fa' | 'en';
  onClose: () => void;
}

export const ProjectContractModal: React.FC<ProjectContractModalProps> = ({
  order,
  lang,
  onClose,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const getCategoryTitle = (type: string) => {
    switch (type) {
      case 'video':
        return lang === 'fa'
          ? 'تدوین ویدیو و پست‌پروداکشن تخصصی با ادوبی پریمیر پرو (Adobe Premiere Pro)'
          : 'Professional Video Editing & Post-Production (Adobe Premiere Pro)';
      case 'web':
        return lang === 'fa'
          ? 'طراحی، توسعه و بهینه‌سازی وب‌سایت مدرن و واکنش‌گرا'
          : 'Modern Responsive Web Development & Engineering';
      case 'mobile':
        return lang === 'fa'
          ? 'توسعه اپلیکیشن موبایل کراس‌پلتفرم'
          : 'Cross-Platform Mobile Application Development';
      default:
        return lang === 'fa'
          ? 'تولید محتوای هوش مصنوعی و خدمات خلاق دیجیتال'
          : 'Generative AI & Bespoke Creative Solutions';
    }
  };

  const formattedDate = new Date(order.created_at || Date.now()).toLocaleDateString(
    lang === 'fa' ? 'fa-IR' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-4xl bg-[#0d0f17] border border-white/20 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[95vh] flex flex-col">
        {/* Top Action Bar (hidden in print) */}
        <div className="p-4 px-6 border-b border-white/10 bg-white/[0.02] flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#d0bcff]/15 border border-[#d0bcff]/30 text-[#d0bcff] flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-bold text-white block">
                {lang === 'fa' ? 'فاکتور رسمی و قرارداد پروژه' : 'Official Project Invoice & Contract'}
              </span>
              <span className="text-[11px] font-mono text-[#8c94a4]">{order.order_code}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-[#d0bcff] hover:bg-[#d0bcff]/90 text-[#0d0f17] font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{lang === 'fa' ? 'چاپ فاکتور و قرارداد (PDF)' : 'Print / Save PDF'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#8c94a4] hover:text-white transition-colors cursor-pointer"
              title="بستن"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Canvas */}
        <div ref={printRef} className="p-6 sm:p-10 overflow-y-auto space-y-8 text-right bg-[#0b0c12] text-[#f1f2f6]">
          {/* Header & Watermark */}
          <div className="border-b border-white/15 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-black border border-white/20 p-1 flex items-center justify-center">
                <img
                  src={`${import.meta.env.BASE_URL}assets/logo.png`}
                  alt="RITM"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  {lang === 'fa' ? 'ریتم — آژانس خلاقیت دیجیتال' : 'RITM Creative Digital Agency'}
                </h1>
                <p className="text-xs text-[#8c94a4]">
                  {lang === 'fa' ? 'تخصصی‌ترین مرجع تدوین ویدیو، پریمیر پرو و مهندسی نرم‌افزار' : 'High-End Video Editing, Premiere Pro & Digital Systems'}
                </p>
              </div>
            </div>

            <div className="text-left font-mono text-xs space-y-1 bg-white/[0.03] p-3 rounded-xl border border-white/10">
              <div>
                <span className="text-[#8c94a4]">شماره فاکتور: </span>
                <span className="text-[#d0bcff] font-bold">{order.order_code}</span>
              </div>
              <div>
                <span className="text-[#8c94a4]">تاریخ صدور: </span>
                <span className="text-white">{formattedDate}</span>
              </div>
              <div>
                <span className="text-[#8c94a4]">وضعیت اعتبار: </span>
                <span className="text-[#a3e635] font-bold">تایید شده الکترونیکی ✔</span>
              </div>
            </div>
          </div>

          {/* Section 1: Customer Specs Table */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-[#d0bcff] flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>مشخصات طرفین و سفارش‌دهنده</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs bg-white/[0.02] p-4 rounded-2xl border border-white/10">
              <div>
                <span className="text-[#8c94a4] block mb-1">مجری پروژه:</span>
                <span className="text-white font-semibold">ریتم (مدیریت فنی)</span>
              </div>
              <div>
                <span className="text-[#8c94a4] block mb-1">کارفرما (سفارش‌دهنده):</span>
                <span className="text-white font-semibold">{order.full_name || 'کاربر گرامی'}</span>
              </div>
              <div>
                <span className="text-[#8c94a4] block mb-1">اطلاعات تماس و ایمیل:</span>
                <span className="text-[#38bdf8] font-mono">{order.contact}</span>
              </div>
              <div>
                <span className="text-[#8c94a4] block mb-1">مهلت تحویل مورد انتظار:</span>
                <span className="text-[#ffb869] font-semibold">{order.deadline || 'طبق هماهنگی اولیه'}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Financial Itemized Breakdown */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-[#d0bcff] flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>ردیف‌های خدماتی و فاکتور مالی</span>
            </h2>

            <div className="overflow-x-auto rounded-2xl border border-white/10">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-white/[0.04] border-b border-white/10 text-[#8c94a4]">
                    <th className="py-3 px-4">ردیف</th>
                    <th className="py-3 px-4">شرح خدمات و بسته‌های فنی</th>
                    <th className="py-3 px-4">مرحله بازبینی</th>
                    <th className="py-3 px-4">مبلغ و بودجه مصوب</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  <tr>
                    <td className="py-3.5 px-4 font-mono text-[#d0bcff]">۰۱</td>
                    <td className="py-3.5 px-4 font-semibold text-white">
                      <div>{getCategoryTitle(order.project_type)}</div>
                      <div className="text-[11px] text-[#8c94a4] mt-1 line-clamp-2">
                        {order.description || 'توضیحات اختصاصی و راش‌های دریافتی از کارفرما'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#a3e635] font-medium">۲ مرحله بازبینی رایگان</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      {order.budget || 'توافقی / ارزیابی فنی'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Official Legal Contract Agreement */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-[#d0bcff] flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>متن و مفاد قرارداد رسمی ارائه خدمات دیجیتال ریتم</span>
            </h2>

            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 text-xs text-[#b8b3c4] space-y-3 leading-relaxed">
              <p>
                <strong className="text-white">ماده ۱ – موضوع قرارداد:</strong> ارائه خدمات حرفه‌ای تدوین، طراحی بصری یا مهندسی نرم‌افزار به شرح مشخصات مندرج در جدول فوق توسط ریتم برای کارفرما.
              </p>
              <p>
                <strong className="text-white">ماده ۲ – تعهدات مجری (ریتم):</strong> مجری متعهد می‌گردد پروژه را با استانداردهای سینمایی (خروجی تا 4K، تصحیح رنگ و نور Lumetri Color و بهینه‌سازی صدا) در مهلت مقرر تحویل نماید. همچنین پس از تحویل نسخه اولیه، ۲ مرحله اصلاحات و بازبینی رایگان بر اساس درخواست کارفرما اعمال خواهد شد.
              </p>
              <p>
                <strong className="text-white">ماده ۳ – محرمانگی و امنیت فایل‌ها (NDA):</strong> تمامی فایل‌های ارسالی، فیلم‌های خام، متون و ایده‌های کارفرما به عنوان اسرار تجاری تلقی شده و تحت هیچ شرایطی در اختیار اشخاص ثالث قرار نخواهد گرفت.
              </p>
              <p>
                <strong className="text-white">ماده ۴ – تعهدات کارفرما:</strong> کارفرما متعهد می‌گردد راش‌ها، لوگوها و فایل‌های تکمیلی لازم را در ابتدای پروژه در اختیار ریتم قرار داده و تاییدات نهایی را به موقع اعلام فرماید.
              </p>
              <p>
                <strong className="text-white">ماده ۵ – حق مالکیت مادی و معنوی:</strong> پس از تسویه‌حساب نهایی، مالکیت کامل مادی اثر متعلق به کارفرما بوده و ریتم حق انتشار آن را صرفاً به عنوان نمونه‌کار در پورتفولیوی رسمی خود خواهد داشت.
              </p>
            </div>
          </div>

          {/* Section 4: Dual Signatures & Digital Seal */}
          <div className="pt-4 border-t border-white/15 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Studio Signature & Seal */}
            <div className="bg-white/[0.02] border border-[#d0bcff]/30 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
              <div>
                <span className="text-xs text-[#8c94a4] block mb-1">تاییدیه و امضای مجری:</span>
                <span className="text-sm font-bold text-white block">ریتم — خلاقیت دیجیتال</span>
                <span className="text-xs text-[#d0bcff] font-mono block mt-1">مدیریت پروژه‌ها</span>
                <span className="text-xs text-[#8c94a4] font-mono block mt-0.5 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-[#d0bcff]" />
                  <span>muhammad1522mahdi@gmail.com</span>
                </span>
              </div>

              {/* Verified Badge / Seal */}
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#a3e635]/10 border border-[#a3e635]/30 text-[#a3e635] text-[11px] font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>مهر الکترونیکی معتبر RITM</span>
                </div>
                <div className="font-serif italic text-lg text-[#d0bcff] opacity-80 select-none">
                  RITM Studio
                </div>
              </div>
            </div>

            {/* Client Signature Box */}
            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <span className="text-xs text-[#8c94a4] block mb-1">امضای کارفرما / سفارش‌دهنده:</span>
                <span className="text-sm font-bold text-white block">{order.full_name || 'کارفرما'}</span>
                <span className="text-xs text-[#8c94a4] font-mono block mt-1">{order.contact}</span>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-[11px] text-[#8c94a4]">امضای الکترونیکی ثبت آنلاین</span>
                <span className="text-xs font-mono text-[#38bdf8] font-bold">Verified Submission</span>
              </div>
            </div>
          </div>

          {/* Footer Notice */}
          <div className="text-center text-[11px] text-[#8c94a4] pt-2">
            این سند بر اساس قوانین تجارت الکترونیک به صورت دیجیتال صادر شده و دارای اعتبار کامل قانونی است.
          </div>
        </div>
      </div>
    </div>
  );
};
