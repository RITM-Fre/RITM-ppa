import React, { useState, useEffect } from 'react';
import {
  Film,
  Code,
  Smartphone,
  Sparkles,
  CheckCircle2,
  Clock,
  Coins,
  Send,
  ArrowRight,
  ArrowLeft,
  Copy,
  ExternalLink,
  Upload,
  Image as ImageIcon,
  Video,
  Trash2,
  Paperclip,
  Lock,
  User,
  FileText,
} from 'lucide-react';
import { ProjectType, Order, AuthUser } from '../types';
import { createOrder, uploadOrderMedia } from '../services/api';
import { ProjectContractModal } from './ProjectContractModal';

interface OrderWizardProps {
  lang: 'fa' | 'en';
  onOrderCreated?: (order: Order) => void;
  preselectedCategory?: ProjectType;
  currentUser?: AuthUser | null;
  onNavigateToLogin?: () => void;
}

export const OrderWizard: React.FC<OrderWizardProps> = ({
  lang,
  onOrderCreated,
  preselectedCategory,
  currentUser,
  onNavigateToLogin,
}) => {
  const [step, setStep] = useState<number>(1);
  const [projectType, setProjectType] = useState<ProjectType>(preselectedCategory || 'video');
  const [fullName, setFullName] = useState('');
  const [contact, setContact] = useState('');
  const [contactType, setContactType] = useState('telegram');
  const [budget, setBudget] = useState('توافقی');
  const [deadline, setDeadline] = useState('توافقی');
  const [description, setDescription] = useState('');
  const [telegramId, setTelegramId] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState<Order | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);

  // Check if running inside Telegram Mini App
  useEffect(() => {
    try {
      const tg = (window as any).Telegram?.WebApp;
      if (tg) {
        tg.ready();
        tg.expand();
        const user = tg.initDataUnsafe?.user;
        if (user) {
          if (user.id) setTelegramId(String(user.id));
          if (user.username) {
            setUsername(user.username);
            if (!contact) setContact(`@${user.username}`);
          }
          if (user.first_name) {
            setFullName(`${user.first_name} ${user.last_name || ''}`.trim());
          }
        }
      }
    } catch (e) {
      // Ignore
    }
  }, []);

  useEffect(() => {
    if (preselectedCategory) {
      setProjectType(preselectedCategory);
    }
  }, [preselectedCategory]);

  useEffect(() => {
    if (currentUser) {
      if (currentUser.first_name && !fullName) setFullName(currentUser.first_name);
      const contactVal = currentUser.email || currentUser.username;
      if (contactVal) {
        setUsername(currentUser.username);
        if (!contact) setContact(contactVal);
      }
    }
  }, [currentUser]);

  const categories: Array<{
    id: ProjectType;
    icon: any;
    titleFa: string;
    titleEn: string;
    descFa: string;
    descEn: string;
    tagFa: string;
    tagEn: string;
  }> = [
    {
      id: 'video',
      icon: Film,
      titleFa: 'تدوین ویدیو و پست‌پروداکشن',
      titleEn: 'Video Editing & Post',
      descFa: 'تیزرهای تبلیغاتی، ریلز اینستاگرام، مستند و فیلم، اصلاح رنگ سینمایی',
      descEn: 'Commercial teasers, social reels, cinematic color grading & audio',
      tagFa: 'پریمیر پرو / داوینچی',
      tagEn: 'Premiere / DaVinci',
    },
    {
      id: 'web',
      icon: Code,
      titleFa: 'طراحی و توسعه وب‌سایت',
      titleEn: 'Web Design & Development',
      descFa: 'سایت‌های شرکتی، فروشگاهی، فرانت‌اند اختصاصی، سرعت بالا و بهینه‌سازی سئو',
      descEn: 'Corporate sites, high-converting landing pages, custom web apps',
      tagFa: 'React / Next.js / Tailwind',
      tagEn: 'React / Next.js / Tailwind',
    },
    {
      id: 'mobile',
      icon: Smartphone,
      titleFa: 'اپلیکیشن موبایل',
      titleEn: 'Mobile App Development',
      descFa: 'اپلیکیشن‌های کاربردی اندروید و iOS با طراحی چشم‌نواز و عملکرد سریع',
      descEn: 'Practical mobile apps with intuitive flow and offline local sync',
      tagFa: 'Cross-Platform',
      tagEn: 'Cross-Platform',
    },
    {
      id: 'other',
      icon: Sparkles,
      titleFa: 'هوش مصنوعی و خدمات سفارشی',
      titleEn: 'AI & Custom Creative',
      descFa: 'تولید ویدیو با هوش مصنوعی، ربات‌های تلگرام، اتوماسیون و لوگوموشن',
      descEn: 'AI video generation, Telegram bots, workflow automation & branding',
      tagFa: 'Next-Gen Media',
      tagEn: 'Next-Gen Media',
    },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) {
      setErrorMsg(lang === 'fa' ? 'حجم فایل نباید بیشتر از ۲۵ مگابایت باشد.' : 'File size must be under 25MB.');
      return;
    }
    setSelectedFile(file);
    setErrorMsg('');
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setFilePreview(url);
    } else {
      setFilePreview(null);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMsg(lang === 'fa' ? 'لطفاً نام یا عنوان برند خود را وارد کنید.' : 'Please enter your name or brand.');
      return;
    }
    if (!contact.trim() || contact.trim().length < 3) {
      setErrorMsg(lang === 'fa' ? 'لطفاً راه ارتباطی معتبر وارد کنید.' : 'Please provide a valid contact detail.');
      return;
    }
    if (!description.trim() || description.trim().length < 8) {
      setErrorMsg(lang === 'fa' ? 'لطفاً جزئیات پروژه را با دقت بیشتری بنویسید (حداقل ۸ کاراکتر).' : 'Please describe your project (minimum 8 chars).');
      return;
    }

    setIsSubmitting(true);
    setUploadStatus(lang === 'fa' ? 'در حال ثبت اطلاعات سفارش...' : 'Registering order...');
    const finalBudget = budget.trim() || 'توافقی';

    try {
      const data = await createOrder({
        full_name: fullName.trim(),
        contact: contact.trim(),
        contact_type: contactType,
        project_type: projectType,
        budget: finalBudget,
        deadline: deadline.trim() || 'توافقی',
        description: description.trim(),
        telegram_id: telegramId ? parseInt(telegramId, 10) : 0,
        username: username.replace(/^@/, '') || null,
        user_id: currentUser?.id || null,
      });

      if (!data.success || !data.order) {
        throw new Error(data.error || 'خطا در ثبت سفارش');
      }

      // If user attached a file (photo or video), forward it directly to Telegram Admin!
      if (selectedFile) {
        setUploadStatus(lang === 'fa' ? 'در حال ارسال مستقیم عکس/ویدیو به تلگرام مدیریت ریتم...' : 'Forwarding media to Telegram...');
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(selectedFile);
        });

        const fileBase64 = await base64Promise;
        await uploadOrderMedia({
          orderCode: data.order.order_code,
          clientName: fullName.trim(),
          contact: contact.trim(),
          fileName: selectedFile.name,
          fileType: selectedFile.type,
          fileBase64,
          caption: `سفارش ${data.order.order_code} - ${description.substring(0, 100)}`,
        });
      }

      setSubmittedOrder(data.order);
      if (onOrderCreated) onOrderCreated(data.order);
    } catch (err: any) {
      setErrorMsg(err.message || 'خطا در اتصال به سرور');
    } finally {
      setIsSubmitting(false);
      setUploadStatus('');
    }
  };

  const copyOrderCode = () => {
    if (submittedOrder) {
      navigator.clipboard.writeText(submittedOrder.order_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // SUCCESS RECEIPT VIEW
  if (submittedOrder) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="glass-panel rounded-2xl p-8 border border-[#d0bcff]/30 text-center relative overflow-hidden shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-[#d0bcff]/15 border border-[#d0bcff]/40 flex items-center justify-center mx-auto mb-6 text-[#d0bcff]">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <span className="font-mono text-xs uppercase tracking-wider text-[#d0bcff] font-semibold">
            {lang === 'fa' ? 'سفارش با موفقیت ثبت شد' : 'Order Registered Successfully'}
          </span>

          <h2 className="text-2xl font-bold mt-2 mb-4 text-[#e5e2e1]">
            {lang === 'fa' ? 'به خانواده مشتریان ریتم خوش آمدید' : 'Welcome to the RITM Family'}
          </h2>

          <p className="text-sm text-[#958ea0] max-w-lg mx-auto mb-8 leading-relaxed">
            {lang === 'fa'
              ? 'اطلاعات پروژه شما بلافاصله برای تیم فنی و مدیریت ریتم ارسال شد. ظرف چند ساعت آینده جهت بررسی دقیق با شما ارتباط برقرار خواهیم کرد.'
              : 'Your project details have been transmitted directly to our creative directors. We will contact you shortly.'}
          </p>

          {/* Tracking Card */}
          <div className="p-5 rounded-xl bg-black/40 border border-white/10 max-w-md mx-auto mb-8 text-right">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
              <span className="text-xs text-[#958ea0]">
                {lang === 'fa' ? 'کد رهگیری اختصاصی' : 'Order Tracking Code'}
              </span>
              <div className="flex items-center gap-2">
                <code className="text-base font-mono font-bold text-[#d0bcff]">
                  {submittedOrder.order_code}
                </code>
                <button
                  onClick={copyOrderCode}
                  className="p-1 rounded bg-white/5 hover:bg-white/15 text-xs text-[#e5e2e1] transition-colors"
                  title="کپی کد"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[#958ea0] block">{lang === 'fa' ? 'نام مشتری:' : 'Client:'}</span>
                <span className="text-[#e5e2e1] font-medium">{submittedOrder.full_name}</span>
              </div>
              <div>
                <span className="text-[#958ea0] block">{lang === 'fa' ? 'نوع پروژه:' : 'Category:'}</span>
                <span className="text-[#e5e2e1] font-medium">{submittedOrder.project_type}</span>
              </div>
              <div>
                <span className="text-[#958ea0] block">{lang === 'fa' ? 'بودجه:' : 'Budget:'}</span>
                <span className="text-[#e5e2e1] font-medium">{submittedOrder.budget}</span>
              </div>
              <div>
                <span className="text-[#958ea0] block">{lang === 'fa' ? 'مهلت تحویل:' : 'Deadline:'}</span>
                <span className="text-[#e5e2e1] font-medium">{submittedOrder.deadline}</span>
              </div>
            </div>

            {copied && (
              <p className="text-[11px] text-[#adc6ff] text-center mt-3 font-mono">
                {lang === 'fa' ? '✓ کد سفارش در کلیپ‌بورد کپی شد' : '✓ Copied to clipboard'}
              </p>
            )}
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setShowContractModal(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#d0bcff] text-[#131313] font-bold text-sm hover:bg-[#d0bcff]/90 transition-all shadow-lg hover:shadow-[#d0bcff]/20 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>{lang === 'fa' ? 'مشاهده و چاپ فاکتور و قرارداد رسمی' : 'View & Print Official Contract'}</span>
            </button>

            <a
              href="https://t.me/RITM_FreeLancer"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#229ed9] hover:bg-[#229ed9]/90 text-white font-semibold text-sm transition-all shadow-md cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{lang === 'fa' ? 'کانال رسمی تلگرام' : 'Telegram Channel'}</span>
            </a>

            <button
              onClick={() => {
                setSubmittedOrder(null);
                setStep(1);
                setDescription('');
              }}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-medium text-[#e5e2e1] transition-all border border-white/10 cursor-pointer"
            >
              {lang === 'fa' ? 'ثبت سفارش جدید' : 'Submit Another Order'}
            </button>
          </div>

          {showContractModal && submittedOrder && (
            <ProjectContractModal
              order={submittedOrder}
              lang={lang}
              onClose={() => setShowContractModal(false)}
            />
          )}
        </div>
      </div>
    );
  }

  // REQUIREMENT: Nobody can submit an order before logging in!
  if (!currentUser) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-white/10 shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#d0bcff]/15 border border-[#d0bcff]/30 text-[#d0bcff] flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white">
              {lang === 'fa' ? 'ورود به حساب کاربری جهت ثبت سفارش' : 'Sign In Required to Order'}
            </h2>
            <p className="text-xs sm:text-sm text-[#8c94a4] max-w-md mx-auto leading-relaxed">
              {lang === 'fa'
                ? 'ثبت سفارش تنها برای کاربران وارد شده امکان‌پذیر است. لطفاً ابتدا با ایمیل خود وارد شوید تا بتوانید وضعیت ادیت یا طراحی و پیام‌های تیم را آنلاین پیگیری کنید.'
                : 'Project submission is restricted to authenticated users. Please sign in with your email to proceed and track progress.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 max-w-md mx-auto text-right text-xs space-y-2.5 text-[#9da3af]">
            <div className="flex items-center gap-2 text-white font-medium">
              <CheckCircle2 className="w-4 h-4 text-[#a3e635]" />
              <span>{lang === 'fa' ? 'پیگیری آنلاین و لحظه‌ای روند پیشرفت پروژه' : 'Real-time project tracking'}</span>
            </div>
            <div className="flex items-center gap-2 text-white font-medium">
              <CheckCircle2 className="w-4 h-4 text-[#38bdf8]" />
              <span>{lang === 'fa' ? 'امکان آپلود مستقیم فیلم، عکس و فایل نمونه' : 'Direct file & footage attachment'}</span>
            </div>
            <div className="flex items-center gap-2 text-white font-medium">
              <CheckCircle2 className="w-4 h-4 text-[#d0bcff]" />
              <span>{lang === 'fa' ? 'دریافت مستقیم اطلاعیه و هماهنگی تلگرام' : 'Direct notifications on Telegram'}</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={onNavigateToLogin}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#d0bcff] to-[#adc6ff] text-[#0d0f17] font-extrabold text-xs sm:text-sm shadow-lg hover:scale-105 transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              <span>{lang === 'fa' ? 'ورود یا ساخت حساب با ایمیل' : 'Sign In / Register with Email'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* Title & Introduction */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#d0bcff] mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#d0bcff] animate-pulse" />
          <span>{lang === 'fa' ? 'پرتال رسمی ثبت سفارش ریتم' : 'Official Project Order Portal'}</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#e5e2e1] tracking-tight">
          {lang === 'fa' ? 'ایده خود را به اثری ماندگار تبدیل کنید' : 'Turn Your Vision Into Lasting Impact'}
        </h1>
        <p className="text-sm text-[#958ea0] max-w-xl mx-auto mt-2 leading-relaxed">
          {lang === 'fa'
            ? 'سفارش شما در لحظه در دیتابیس سوپابیس ذخیره شده و به تیم فنی ریتم و ربات تلگرام ارسال می‌گردد.'
            : 'Your order synchronizes instantly with our Supabase database and notifies directors via Telegram.'}
        </p>
      </div>

      {/* Progress Indicators */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <button
            key={s}
            onClick={() => setStep(s)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              step === s
                ? 'bg-[#d0bcff] text-[#131313] font-bold shadow-md shadow-[#d0bcff]/20'
                : step > s
                ? 'bg-white/10 text-[#d0bcff]'
                : 'bg-white/5 text-[#958ea0]'
            }`}
          >
            <span>{s}</span>
            <span className="hidden sm:inline">
              {s === 1
                ? (lang === 'fa' ? 'دسته‌بندی' : 'Category')
                : s === 2
                ? (lang === 'fa' ? 'بودجه و زمان' : 'Budget & Timeline')
                : (lang === 'fa' ? 'مشخصات و ارسال' : 'Details & Submit')}
            </span>
          </button>
        ))}
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
          <span>⚠️</span>
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-panel rounded-2xl p-6 md:p-8 border border-white/10 shadow-xl">
        {/* STEP 1: CATEGORY SELECTION */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-[#e5e2e1]">
                {lang === 'fa' ? '۱. دسته‌بندی پروژه خود را انتخاب کنید:' : '1. Select Your Project Category:'}
              </h3>
              <span className="text-xs text-[#958ea0]">
                {lang === 'fa' ? 'مرحله ۱ از ۳' : 'Step 1 of 3'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = projectType === cat.id;
                return (
                  <div
                    key={cat.id}
                    onClick={() => setProjectType(cat.id)}
                    className={`cursor-pointer p-5 rounded-xl border transition-all text-right ${
                      isSelected
                        ? 'bg-[#d0bcff]/10 border-[#d0bcff] shadow-lg shadow-[#d0bcff]/10'
                        : 'bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          isSelected ? 'bg-[#d0bcff] text-[#131313]' : 'bg-white/5 text-[#d0bcff]'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="font-mono text-[11px] text-[#958ea0]">
                        {lang === 'fa' ? cat.tagFa : cat.tagEn}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-[#e5e2e1] mb-1">
                      {lang === 'fa' ? cat.titleFa : cat.titleEn}
                    </h4>
                    <p className="text-xs text-[#958ea0] leading-relaxed">
                      {lang === 'fa' ? cat.descFa : cat.descEn}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#d0bcff] text-[#131313] font-semibold text-xs hover:bg-[#d0bcff]/90 transition-all"
              >
                <span>{lang === 'fa' ? 'مرحله بعد: بودجه و زمان' : 'Next: Budget & Timeline'}</span>
                {lang === 'fa' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: BUDGET & DEADLINE (COMPLETELY OPTIONAL) */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white">
                {lang === 'fa' ? '۲. بودجه و زمان‌بندی (کاملاً اختیاری):' : '2. Budget & Delivery (Optional):'}
              </h3>
              <span className="text-xs text-[#8c94a4]">
                {lang === 'fa' ? 'مرحله ۲ از ۳' : 'Step 2 of 3'}
              </span>
            </div>

            {/* Budget Input - Completely Optional */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-white flex items-center gap-2">
                  <Coins className="w-4 h-4 text-[#ffb869]" />
                  <span>{lang === 'fa' ? 'میزان بودجه پیشنهادی یا سقف مدنظر شما:' : 'Proposed Budget (Optional):'}</span>
                </label>
                <span className="text-[11px] text-[#8c94a4] bg-white/5 px-2 py-0.5 rounded">
                  {lang === 'fa' ? 'اختیاری' : 'Optional'}
                </span>
              </div>

              <input
                type="text"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder={lang === 'fa' ? 'مثال: توافقی، ۵ میلیون تومان، ۱۰۰ تتر، یا هر مبلغ دیگر...' : 'e.g. Negotiable, $500, or any budget...'}
                className="w-full bg-[#161823] border border-white/10 focus:border-[#d0bcff] rounded-xl px-4 py-3 text-xs text-white outline-none"
              />

              {/* Quick Suggestion Chips */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] text-[#8c94a4]">{lang === 'fa' ? 'انتخاب سریع:' : 'Quick Select:'}</span>
                {[
                  'توافقی (بررسی با تیم ریتم)',
                  'اقتصادی و بهینه',
                  'پروژه ویژه و فوری',
                ].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setBudget(chip)}
                    className={`px-2.5 py-1 rounded-lg border text-[11px] transition-colors cursor-pointer ${
                      budget === chip
                        ? 'bg-[#d0bcff]/20 text-[#d0bcff] border-[#d0bcff]/40 font-bold'
                        : 'bg-white/[0.03] text-[#8c94a4] hover:text-white border-white/10'
                    }`}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Delivery Deadline - Also Optional */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#adc6ff]" />
                  <span>{lang === 'fa' ? 'مهلت تحویل پروژه (اختیاری):' : 'Delivery Deadline (Optional):'}</span>
                </label>
                <span className="text-[11px] text-[#8c94a4] bg-white/5 px-2 py-0.5 rounded">
                  {lang === 'fa' ? 'اختیاری' : 'Optional'}
                </span>
              </div>

              <input
                type="text"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                placeholder={lang === 'fa' ? 'مثال: توافقی، تا آخر هفته، ۲ هفته دیگر...' : 'e.g. Flexible, by Friday, 2 weeks...'}
                className="w-full bg-[#161823] border border-white/10 focus:border-[#d0bcff] rounded-xl px-4 py-3 text-xs text-white outline-none"
              />

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] text-[#8c94a4]">{lang === 'fa' ? 'گزینه‌های معمول:' : 'Common:'}</span>
                {['توافقی / زمان معمول', 'فوری (کمتر از ۱ هفته)', '۱ تا ۲ هفته'].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDeadline(d)}
                    className={`px-2.5 py-1 rounded-lg border text-[11px] transition-colors cursor-pointer ${
                      deadline === d
                        ? 'bg-[#adc6ff]/20 text-[#adc6ff] border-[#adc6ff]/40 font-bold'
                        : 'bg-white/[0.03] text-[#8c94a4] hover:text-white border-white/10'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#e5e2e1] text-xs font-medium transition-all"
              >
                {lang === 'fa' ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
                <span>{lang === 'fa' ? 'بازگشت' : 'Back'}</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#d0bcff] text-[#131313] font-semibold text-xs hover:bg-[#d0bcff]/90 transition-all"
              >
                <span>{lang === 'fa' ? 'مرحله بعد: مشخصات و شرح پروژه' : 'Next: Contact & Specs'}</span>
                {lang === 'fa' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: CONTACT & DESCRIPTION */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-[#e5e2e1]">
                {lang === 'fa' ? '۳. اطلاعات تماس و شرح پروژه:' : '3. Contact & Specifications:'}
              </h3>
              <span className="text-xs text-[#958ea0]">
                {lang === 'fa' ? 'مرحله ۳ از ۳' : 'Step 3 of 3'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#958ea0] mb-1.5">
                  {lang === 'fa' ? 'نام و نام‌خانوادگی یا نام مجموعه *' : 'Full Name or Company Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={lang === 'fa' ? 'مثال: محمد مهدی' : 'e.g. John Doe'}
                  className="w-full bg-black/40 border border-white/15 focus:border-[#d0bcff] rounded-xl px-4 py-2.5 text-xs text-[#e5e2e1] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#958ea0] mb-1.5">
                  {lang === 'fa' ? 'شماره تماس یا آیدی تلگرام *' : 'Telegram @Username or Phone Number *'}
                </label>
                <input
                  type="text"
                  required
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder={lang === 'fa' ? 'مثال: @username یا 0912...' : 'e.g. @username or +98...'}
                  className="w-full bg-black/40 border border-white/15 focus:border-[#d0bcff] rounded-xl px-4 py-2.5 text-xs text-[#e5e2e1] outline-none dir-ltr text-left"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#958ea0] mb-1.5">
                {lang === 'fa' ? 'توضیحات و نیازمندی‌های پروژه *' : 'Project Description & Requirements *'}
              </label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={
                  lang === 'fa'
                    ? 'هدف از پروژه، سناریوی مدنظر، ویژگی‌های کلیدی، یا لینک نمونه‌های مشابه مورد علاقه شما...'
                    : 'Goal of project, key requirements, preferred design style, or reference links...'
                }
                className="w-full bg-black/40 border border-white/15 focus:border-[#d0bcff] rounded-xl p-4 text-xs text-[#e5e2e1] outline-none leading-relaxed resize-none"
              />
            </div>

            {/* Upload Video or Photo direct to Telegram */}
            <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#e5e2e1] flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-[#d0bcff]" />
                  <span>{lang === 'fa' ? 'ضمیمه فایل نمونه (عکس یا فیلم)' : 'Attach Reference File (Photo or Video)'}</span>
                </label>
                <span className="text-[11px] text-[#958ea0]">
                  {lang === 'fa' ? 'مستقیم به تلگرام مدیریت' : 'Direct to Telegram'}
                </span>
              </div>

              {!selectedFile ? (
                <label className="border border-dashed border-white/20 hover:border-[#d0bcff]/60 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition-colors bg-white/[0.01] hover:bg-white/[0.03]">
                  <Upload className="w-6 h-6 text-[#d0bcff] mb-2" />
                  <span className="text-xs text-[#e5e2e1] font-medium mb-1">
                    {lang === 'fa' ? 'کلیک کنید یا فایل را اینجا بکشید' : 'Click to browse or drag file here'}
                  </span>
                  <span className="text-[11px] text-[#958ea0]">
                    {lang === 'fa' ? 'پشتیبانی از انواع ویدیو (MP4, MOV) و تصویر (PNG, JPG) تا ۲۵ مگابایت' : 'Supported video & image files up to 25MB'}
                  </span>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {filePreview ? (
                      <img src={filePreview} alt="Preview" className="w-12 h-12 rounded object-cover border border-white/10" />
                    ) : (
                      <div className="w-12 h-12 rounded bg-[#d0bcff]/15 text-[#d0bcff] flex items-center justify-center">
                        {selectedFile.type.startsWith('video/') ? <Video className="w-6 h-6" /> : <ImageIcon className="w-6 h-6" />}
                      </div>
                    )}
                    <div className="text-right">
                      <div className="text-xs font-semibold text-[#e5e2e1] truncate max-w-[200px] sm:max-w-xs">{selectedFile.name}</div>
                      <div className="text-[11px] text-[#958ea0]">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · {selectedFile.type.startsWith('video/') ? 'ویدیو' : 'تصویر'}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="p-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title={lang === 'fa' ? 'حذف فایل' : 'Remove file'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Telegram Sync note */}
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between text-xs text-[#958ea0]">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-[#d0bcff]" />
                <span>
                  {lang === 'fa'
                    ? 'سفارش و فایل‌های ضمیمه بلافاصله به تلگرام مدیریت (@AdvRFL) و ربات ارسال می‌شود.'
                    : 'Order & media dispatches live to Telegram management & @RITM_FreeLancbot.'}
                </span>
              </div>
              <span className="font-mono text-[11px] text-[#adc6ff]">Live Sync</span>
            </div>

            {uploadStatus && (
              <div className="p-3 rounded-xl bg-[#d0bcff]/10 border border-[#d0bcff]/30 text-xs text-[#d0bcff] flex items-center gap-2 animate-pulse">
                <span className="w-3.5 h-3.5 border-2 border-[#d0bcff] border-t-transparent rounded-full animate-spin" />
                <span>{uploadStatus}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#e5e2e1] text-xs font-medium transition-all"
              >
                {lang === 'fa' ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
                <span>{lang === 'fa' ? 'بازگشت' : 'Back'}</span>
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-[#d0bcff] text-[#131313] font-bold text-xs hover:bg-[#d0bcff]/90 disabled:opacity-50 transition-all shadow-lg shadow-[#d0bcff]/20"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-[#131313] border-t-transparent rounded-full animate-spin" />
                    <span>{uploadStatus || (lang === 'fa' ? 'در حال ثبت و ارسال...' : 'Submitting...')}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{lang === 'fa' ? 'تایید و ثبت نهایی سفارش' : 'Confirm & Register Order'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
