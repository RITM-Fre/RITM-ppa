import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  User,
  Shield,
  Clock,
  Sparkles,
  Paperclip,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  Info,
  Film,
  Code,
  Smartphone,
  Check,
  Lock,
  Mail,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import { AuthUser, Order, ProjectChatMessage, ChatConversation } from '../types';
import {
  getChatMessages,
  sendChatMessage,
  getChatConversations,
  markChatRead,
  getClientOrders,
  sendOtpEmail,
  clientLoginWithOtp,
} from '../services/api';

interface ProjectChatProps {
  lang: 'fa' | 'en';
  currentUser: AuthUser | null;
  isAdmin: boolean;
  initialOrderCode?: string | null;
  onNavigateToOrder?: () => void;
  onNavigateToAuth?: () => void;
  onLogin?: (user: AuthUser) => void;
}

export const ProjectChat: React.FC<ProjectChatProps> = ({
  lang,
  currentUser,
  isAdmin,
  initialOrderCode = null,
  onNavigateToOrder,
  onNavigateToAuth,
  onLogin,
}) => {
  // Gate Auth Form State for Unauthenticated Visitors
  const [gateEmail, setGateEmail] = useState('');
  const [gateOtpCode, setGateOtpCode] = useState('');
  const [gateDebugCode, setGateDebugCode] = useState('');
  const [gateStep, setGateStep] = useState<1 | 2>(1);
  const [isSendingGateOtp, setIsSendingGateOtp] = useState(false);
  const [isVerifyingGateOtp, setIsVerifyingGateOtp] = useState(false);
  const [gateError, setGateError] = useState('');
  const [gateSuccessMsg, setGateSuccessMsg] = useState('');

  // Messages state
  const [messages, setMessages] = useState<ProjectChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [loading, setLoading] = useState(true);

  // Admin conversation list state
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  // Active conversation code: strictly an order code OR a private client thread `client-${userId}`
  const defaultClientRoom = currentUser ? `client-${currentUser.id}` : '';
  const [selectedOrderCode, setSelectedOrderCode] = useState<string>(initialOrderCode || defaultClientRoom);

  // Mobile view state (for admin or client project selection on phones)
  const [mobileShowSidebar, setMobileShowSidebar] = useState(false);

  // Client user's orders state
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [selectedClientOrder, setSelectedClientOrder] = useState<Order | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatScrollContainerRef = useRef<HTMLDivElement>(null);
  const pollingIntervalRef = useRef<any>(null);

  // Auto scroll to bottom without jumping whole window
  const scrollToBottom = () => {
    if (chatScrollContainerRef.current) {
      chatScrollContainerRef.current.scrollTop = chatScrollContainerRef.current.scrollHeight;
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  // 1. Fetch user orders if client
  useEffect(() => {
    if (!isAdmin && currentUser) {
      getClientOrders(currentUser).then((res) => {
        if (res.success && res.orders) {
          setUserOrders(res.orders);
          if (initialOrderCode) {
            const found = res.orders.find((o) => o.order_code === initialOrderCode);
            if (found) {
              setSelectedClientOrder(found);
              setSelectedOrderCode(found.order_code);
            } else {
              setSelectedOrderCode(initialOrderCode);
            }
          } else if (res.orders.length > 0) {
            // Default to most recent order if exists
            setSelectedClientOrder(res.orders[0]);
            setSelectedOrderCode(res.orders[0].order_code);
          } else {
            // Dedicated direct client thread
            setSelectedOrderCode(`client-${currentUser.id}`);
            setSelectedClientOrder(null);
          }
        }
      });
    }
  }, [isAdmin, currentUser, initialOrderCode]);

  // 2. Fetch conversations for admin / freelancer
  const fetchConversations = async () => {
    if (isAdmin) {
      const res = await getChatConversations();
      if (res.success && res.conversations) {
        setConversations(res.conversations);
        if (!selectedOrderCode && res.conversations.length > 0) {
          setSelectedOrderCode(res.conversations[0].orderCode);
        }
      }
    }
  };

  // 3. Fetch messages for active 1-to-1 conversation
  const fetchMessages = async (silent = false) => {
    if (!selectedOrderCode && !currentUser && !isAdmin) return;
    if (!silent) setLoading(true);
    try {
      const room = selectedOrderCode || (currentUser ? `client-${currentUser.id}` : '');
      const res = await getChatMessages(room, currentUser?.id);
      if (res.success && res.messages) {
        setMessages(res.messages);
      }
    } catch (err) {
      console.error('Failed to load chat messages:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Initial & conversation change load
  useEffect(() => {
    if (currentUser || isAdmin) {
      fetchMessages(false);
      if (isAdmin) {
        fetchConversations();
        if (selectedOrderCode) markChatRead(selectedOrderCode, 'admin');
      } else {
        if (selectedOrderCode) markChatRead(selectedOrderCode, 'client');
      }
    }
  }, [selectedOrderCode, isAdmin, currentUser]);

  // Scroll to bottom when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Polling every 4 seconds for real-time live synchronization
  useEffect(() => {
    if (currentUser || isAdmin) {
      pollingIntervalRef.current = setInterval(() => {
        fetchMessages(true);
        if (isAdmin) fetchConversations();
      }, 4000);
    }

    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    };
  }, [selectedOrderCode, isAdmin, currentUser]);

  // Handle Send Message (1-to-1 Strictly between Client and Freelancer)
  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputText).trim();
    if (!textToSend || isSending) return;

    const room = selectedOrderCode || (currentUser ? `client-${currentUser.id}` : 'direct');
    setIsSending(true);
    try {
      const senderRole = isAdmin ? 'admin' : 'client';
      const clientName = isAdmin
        ? (lang === 'fa' ? 'فریلنسر ریتم' : 'RITM Freelancer')
        : (currentUser?.first_name || currentUser?.username || 'کارفرما');

      const res = await sendChatMessage({
        orderCode: room,
        userId: currentUser?.id || null,
        clientName,
        senderRole,
        text: textToSend,
      });

      if (res.success && res.message) {
        setMessages((prev) => {
          // Avoid duplicates
          if (prev.some((m) => m.id === res.message.id)) return prev;
          return [...prev, res.message];
        });
        if (!customText) setInputText('');
        scrollToBottom();
        if (isAdmin) fetchConversations();
      }
    } catch (e) {
      console.error('Failed to send chat message:', e);
    } finally {
      setIsSending(false);
    }
  };

  // Gate OTP Flow: Send Code to Email
  const handleSendGateOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setGateError('');
    setGateSuccessMsg('');
    const cleanEmail = gateEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setGateError(lang === 'fa' ? 'لطفاً یک آدرس ایمیل معتبر وارد کنید.' : 'Valid email required.');
      return;
    }

    setIsSendingGateOtp(true);
    try {
      const res = await sendOtpEmail(cleanEmail, 'login');
      if (res.success) {
        setGateStep(2);
        setGateSuccessMsg(res.message || `کد تایید ۶ رقمی به ایمیل ${cleanEmail} ارسال شد.`);
        if (res.debugCode) {
          setGateDebugCode(res.debugCode);
        }
      } else {
        setGateError(res.error || 'خطا در ارسال کد تایید.');
      }
    } catch (e: any) {
      setGateError(e.message || 'خطا در ارتباط با سرور.');
    } finally {
      setIsSendingGateOtp(false);
    }
  };

  // Gate OTP Flow: Verify Code and Log In
  const handleVerifyGateOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setGateError('');
    const cleanEmail = gateEmail.trim().toLowerCase();
    const cleanCode = gateOtpCode.trim();
    if (!cleanCode || cleanCode.length < 4) {
      setGateError(lang === 'fa' ? 'لطفاً کد تایید را وارد کنید.' : 'Enter verification code.');
      return;
    }

    setIsVerifyingGateOtp(true);
    try {
      const res = await clientLoginWithOtp(cleanEmail, cleanCode);
      if (res.success && res.user) {
        if (onLogin) {
          onLogin(res.user);
        }
      } else {
        setGateError(res.error || 'کد تایید نادرست یا منقضی شده است.');
      }
    } catch (e: any) {
      setGateError(e.message || 'خطا در تایید کد.');
    } finally {
      setIsVerifyingGateOtp(false);
    }
  };

  // Quick Prompt Chips (Tailored strictly for private client-freelancer inquiries)
  const quickPrompts = [
    { label: 'استعلام پیشرفت پروژه', text: 'سلام، لطفاً آخرین وضعیت اجرایی و پیشرفت پروژه من را بررسی و اعلام فرمایید.' },
    { label: 'هماهنگی اصلاحات و ادیت', text: 'سلام، چند اصلاحیه در فایل یا سناریو دارم، چطور می‌توانم هماهنگ کنم؟' },
    { label: 'ارسال راش و فوتیج سنگین', text: 'سلام، راش‌ها و فوتیج‌های سنگین پروژه را به کدام آیدی تلگرام یا بله ارسال کنم؟' },
    { label: 'استعلام زمان تحویل نهایی', text: 'سلام، زمان تحویل نسخه نهایی پروژه حدوداً چه تاریخی خواهد بود؟' },
  ];

  // =========================================================================
  // VIEW 1: UNAUTHENTICATED GATE (Strict Requirement: Only registered users!)
  // =========================================================================
  if (!currentUser && !isAdmin) {
    return (
      <div className="max-w-2xl mx-auto py-8 sm:py-12 px-3 sm:px-6">
        <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-white/10 shadow-2xl text-center relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 bg-[#d0bcff]/15 rounded-full blur-3xl pointer-events-none" />

          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d0bcff]/10 border border-[#d0bcff]/20 text-[#d0bcff] text-xs font-medium mb-4">
            <Shield className="w-3.5 h-3.5" />
            <span>{lang === 'fa' ? 'گفتگوی کاملاً اختصاصی و محرمانه' : 'Private Direct Discussion'}</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
            {lang === 'fa' ? 'ورود به گفتگوی آنلاین با فریلنسر' : 'Private Client-Freelancer Discussion'}
          </h2>

          <p className="text-xs sm:text-sm text-[#958ea0] max-w-lg mx-auto mb-6 leading-relaxed">
            {lang === 'fa'
              ? 'در ریتم هیچ گفتگوی عمومی وجود ندارد. تمام مکالمات و فایل‌ها به صورت ۱ به ۱ و کاملاً محرمانه بین کارفرما و فریلنسر انجام می‌شود. لطفاً برای ورود، کد تایید خود را دریافت فرمایید.'
              : 'No public chat exists. All communications are private 1-to-1 between client and freelancer. Please verify your email to enter.'}
          </p>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 text-right text-xs">
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#a3e635] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block">کانال ۱ به ۱</span>
                <span className="text-[11px] text-[#958ea0]">فقط بین شما و فریلنسر ریتم</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#a3e635] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block">محرمانگی کامل</span>
                <span className="text-[11px] text-[#958ea0]">عدم مشاهده سایر کاربران</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#a3e635] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block">پیگیری فازبندی</span>
                <span className="text-[11px] text-[#958ea0]">ارسال ادیت و استعلام زمان</span>
              </div>
            </div>
          </div>

          {/* Quick OTP Login Form */}
          <div className="bg-black/40 rounded-2xl p-5 border border-white/10 text-right">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-[#d0bcff]" />
                <span>{lang === 'fa' ? 'ورود مستقیم با کد تایید ایمیلی' : 'Email OTP Verification'}</span>
              </span>
              <span className="text-[10px] text-[#a3e635] font-mono">امنیت دو مرحله‌ای</span>
            </div>

            {gateError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                {gateError}
              </div>
            )}

            {gateStep === 1 ? (
              <form onSubmit={handleSendGateOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#958ea0] mb-1.5">
                    {lang === 'fa' ? 'آدرس ایمیل شما:' : 'Email Address:'}
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={gateEmail}
                      onChange={(e) => setGateEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full bg-black/50 border border-white/15 focus:border-[#d0bcff] rounded-xl px-4 py-2.5 text-xs text-[#e5e2e1] outline-none dir-ltr text-left"
                    />
                    <Mail className="w-4 h-4 text-[#958ea0] absolute left-3 top-3 pointer-events-none" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSendingGateOtp || !gateEmail.trim()}
                  className="w-full py-3 rounded-xl bg-[#d0bcff] hover:bg-[#d0bcff]/90 text-[#131313] font-bold text-xs transition-all shadow-lg shadow-[#d0bcff]/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSendingGateOtp ? (
                    <>
                      <span className="w-4 h-4 border-2 border-[#131313] border-t-transparent rounded-full animate-spin" />
                      <span>{lang === 'fa' ? 'در حال ارسال کد تایید...' : 'Sending code...'}</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>{lang === 'fa' ? 'دریافت کد تایید و ورود به گفتگوی اختصاصی' : 'Get Verification Code & Enter'}</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyGateOtp} className="space-y-4">
                <div className="p-3 rounded-xl bg-[#d0bcff]/10 border border-[#d0bcff]/30 text-[#d0bcff] text-xs">
                  {gateSuccessMsg || `کد تایید ۶ رقمی به ایمیل ${gateEmail} ارسال شد.`}
                </div>

                {gateDebugCode && (
                  <div
                    onClick={() => setGateOtpCode(gateDebugCode)}
                    className="p-2.5 rounded-xl bg-[#ffb869]/10 border border-[#ffb869]/30 text-[#ffb869] text-xs flex items-center justify-between cursor-pointer hover:bg-[#ffb869]/20 transition-colors"
                    title="کلیک برای درج خودکار کد تستی"
                  >
                    <span className="font-mono font-bold">💡 کد تایید تستی: {gateDebugCode}</span>
                    <span className="text-[10px] underline">درج سریع</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-[#958ea0] mb-1.5">
                    {lang === 'fa' ? 'کد تایید ۶ رقمی دریافتی:' : '6-digit Verification Code:'}
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    autoFocus
                    value={gateOtpCode}
                    onChange={(e) => setGateOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="------"
                    className="w-full bg-black/50 border border-white/15 focus:border-[#d0bcff] rounded-xl px-4 py-3 text-lg font-mono text-center tracking-[0.5em] text-[#d0bcff] outline-none dir-ltr"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isVerifyingGateOtp || gateOtpCode.length < 4}
                  className="w-full py-3 rounded-xl bg-[#d0bcff] hover:bg-[#d0bcff]/90 text-[#131313] font-bold text-xs transition-all shadow-lg shadow-[#d0bcff]/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isVerifyingGateOtp ? (
                    <>
                      <span className="w-4 h-4 border-2 border-[#131313] border-t-transparent rounded-full animate-spin" />
                      <span>{lang === 'fa' ? 'در حال تایید...' : 'Verifying...'}</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{lang === 'fa' ? 'تایید کد و ورود به گفتگو' : 'Verify & Enter Chat'}</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setGateStep(1);
                      setGateOtpCode('');
                      setGateError('');
                    }}
                    className="text-[#958ea0] hover:text-white transition-colors cursor-pointer"
                  >
                    {lang === 'fa' ? '← تغییر آدرس ایمیل' : '← Change Email'}
                  </button>

                  <button
                    type="button"
                    onClick={handleSendGateOtp}
                    disabled={isSendingGateOtp}
                    className="text-[#d0bcff] hover:underline disabled:opacity-50 cursor-pointer"
                  >
                    {lang === 'fa' ? 'ارسال مجدد کد' : 'Resend Code'}
                  </button>
                </div>
              </form>
            )}

            {/* Direct Link to Client Portal */}
            {onNavigateToAuth && (
              <div className="mt-4 pt-3 border-t border-white/10 text-center">
                <button
                  onClick={onNavigateToAuth}
                  className="text-xs text-[#958ea0] hover:text-[#d0bcff] transition-colors cursor-pointer"
                >
                  {lang === 'fa' ? 'ورود یا ثبت‌نام از طریق پرتال مشتریان ←' : 'Go to Client Portal ←'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: AUTHENTICATED CHAT (1-TO-1 STRICTLY BETWEEN CLIENT & FREELANCER)
  // =========================================================================
  const activeConversationName = isAdmin
    ? `پروژه / کارفرما: ${selectedOrderCode || 'نامشخص'}`
    : selectedClientOrder
    ? `پروژه ${selectedClientOrder.order_code}`
    : `گفتگوی اختصاصی شما با فریلنسر ریتم`;

  return (
    <div className="max-w-6xl mx-auto py-3 sm:py-6 px-2.5 sm:px-6">
      {/* Top Header Card */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-white/10 mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#d0bcff]/20 text-[#d0bcff] flex items-center justify-center border border-[#d0bcff]/40 shadow-inner shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span>{lang === 'fa' ? 'گفتگوی آنلاین اختصاصی پیرامون پروژه‌ها' : 'Private Project Discussion'}</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#a3e635]/15 text-[#a3e635] border border-[#a3e635]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[#a3e635] animate-pulse" />
                ۱ به ۱ محرمانه
              </span>
            </h1>
            <p className="text-[11px] sm:text-xs text-[#958ea0] mt-0.5">
              {isAdmin
                ? (lang === 'fa' ? 'پاسخگویی مستقیم فریلنسر به استعلام‌ها و پروژه‌های کارفرمایان' : 'Freelancer inbox for client projects')
                : (lang === 'fa' ? `کانال اختصاصی بین شما (${currentUser?.first_name || currentUser?.username}) و فریلنسر ریتم` : 'Direct channel with RITM studio')}
            </p>
          </div>
        </div>

        {/* Telegram / Bale Direct Callouts for Heavy Media */}
        <div className="flex items-center gap-2 text-xs w-full sm:w-auto justify-end">
          <a
            href="https://t.me/AdvRFL"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#38bdf8]/10 hover:bg-[#38bdf8]/20 text-[#38bdf8] border border-[#38bdf8]/30 transition-all text-[11px] sm:text-xs font-mono"
            title="پی‌وی تلگرام جهت ارسال راش و فوتیج‌های سنگین"
          >
            <Send className="w-3.5 h-3.5" />
            <span>تلگرام: @AdvRFL</span>
          </a>

          <a
            href="https://ble.ir/AdvRFL"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#a3e635]/10 hover:bg-[#a3e635]/20 text-[#a3e635] border border-[#a3e635]/30 transition-all text-[11px] sm:text-xs font-mono"
            title="پی‌وی پیام‌رسان بله جهت ارسال راش"
          >
            <span>بله: @AdvRFL</span>
          </a>

          {/* Mobile toggle button for conversation list */}
          <button
            onClick={() => setMobileShowSidebar(!mobileShowSidebar)}
            className="lg:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-[#d0bcff] hover:bg-white/10"
            title="لیست پروژه‌ها / گفتگوها"
          >
            {mobileShowSidebar ? <ArrowRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Chat Layout: Responsive height with clean flex layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-210px)] min-h-[500px] max-h-[750px]">
        {/* SIDEBAR: Admin Inbox OR Client Project Selector */}
        <div
          className={`${
            mobileShowSidebar ? 'flex' : 'hidden lg:flex'
          } lg:col-span-4 glass-panel rounded-2xl border border-white/10 p-3 sm:p-4 flex-col h-full overflow-hidden`}
        >
          {isAdmin ? (
            <>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-[#d0bcff]" />
                  <span>گفتگوهای اختصاصی کارفرمایان</span>
                </span>
                <button
                  onClick={fetchConversations}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#958ea0] hover:text-white transition-colors cursor-pointer"
                  title="بروزرسانی"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {conversations.length === 0 ? (
                  <div className="py-12 text-center text-xs text-[#958ea0]">
                    هنوز گفتگویی از سوی کارفرمایان ثبت نشده است.
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <button
                      key={conv.orderCode}
                      onClick={() => {
                        setSelectedOrderCode(conv.orderCode);
                        setMobileShowSidebar(false);
                      }}
                      className={`w-full text-right p-3 rounded-xl transition-all border cursor-pointer ${
                        selectedOrderCode === conv.orderCode
                          ? 'bg-[#d0bcff]/15 border-[#d0bcff]/40 shadow-sm'
                          : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/5'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-xs font-bold text-white truncate">
                          {conv.clientName}
                        </span>
                        {conv.unreadCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#d0bcff] text-[#131313]">
                            {conv.unreadCount} جدید
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-[#958ea0] font-mono mb-1">
                        <span className="truncate">{conv.orderCode}</span>
                        <span>{new Date(conv.lastMessageTime).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-[11px] text-[#b8b3c4] truncate leading-tight">
                        {conv.lastMessage}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </>
          ) : (
            <>
              {/* Client Sidebar: Project Selection */}
              <div className="pb-3 mb-3 border-b border-white/10">
                <span className="text-xs font-bold text-white flex items-center gap-1.5 mb-1.5">
                  <Film className="w-4 h-4 text-[#d0bcff]" />
                  <span>موضوع گفتگو با فریلنسر</span>
                </span>
                <p className="text-[11px] text-[#958ea0] leading-relaxed">
                  می‌توانید گفتگوی خود را به یکی از پروژه‌های ثبت‌شده اختصاص دهید یا به صورت مستقیم با فریلنسر صحبت کنید.
                </p>
              </div>

              {/* Selector */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {/* Direct Private Channel */}
                <button
                  onClick={() => {
                    setSelectedOrderCode(currentUser ? `client-${currentUser.id}` : 'direct');
                    setSelectedClientOrder(null);
                    setMobileShowSidebar(false);
                  }}
                  className={`w-full text-right p-3 rounded-xl border transition-all cursor-pointer ${
                    !selectedClientOrder
                      ? 'bg-[#d0bcff]/15 border-[#d0bcff]/40 text-white'
                      : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/5 text-[#958ea0]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">کانال مستقیم با فریلنسر (عمومی پروژه)</span>
                    {!selectedClientOrder && <Check className="w-3.5 h-3.5 text-[#d0bcff]" />}
                  </div>
                  <span className="text-[10px] text-[#958ea0] block mt-0.5">مشاوره، سوالات سناریو و هماهنگی‌ها</span>
                </button>

                {userOrders.map((ord) => (
                  <button
                    key={ord.id}
                    onClick={() => {
                      setSelectedOrderCode(ord.order_code);
                      setSelectedClientOrder(ord);
                      setMobileShowSidebar(false);
                    }}
                    className={`w-full text-right p-3 rounded-xl border transition-all cursor-pointer ${
                      selectedClientOrder?.id === ord.id
                        ? 'bg-[#d0bcff]/15 border-[#d0bcff]/40 text-white'
                        : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/5 text-[#958ea0]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-mono text-[#d0bcff]">{ord.order_code}</span>
                      {selectedClientOrder?.id === ord.id && <Check className="w-3.5 h-3.5 text-[#d0bcff]" />}
                    </div>
                    <span className="text-[11px] text-white block mt-0.5 truncate">
                      {ord.project_type === 'video' ? 'تدوین تیزر ویدیویی 🎬' : ord.project_type === 'web' ? 'طراحی وب‌سایت 💻' : 'اپلیکیشن 📱'}
                    </span>
                    <div className="flex items-center justify-between text-[10px] text-[#958ea0] mt-1 font-mono">
                      <span>وضعیت: {ord.status}</span>
                      <span>{new Date(ord.created_at).toLocaleDateString('fa-IR')}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Bottom Notice Card */}
              <div className="mt-auto p-3 rounded-xl bg-gradient-to-br from-[#3c0091]/20 to-black/40 border border-[#d0bcff]/20 text-right space-y-1">
                <span className="text-xs font-bold text-[#d0bcff] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>راش‌ها و فوتیج‌های حجیم:</span>
                </span>
                <p className="text-[10.5px] text-[#b8b3c4] leading-relaxed">
                  برای سرعت دانلود و بالاترین کیفیت، راش‌ها را در تلگرام به آیدی @AdvRFL بفرستید.
                </p>
              </div>
            </>
          )}
        </div>

        {/* CHAT WINDOW: Header, Message Thread & Sticky Input Bar */}
        <div className="lg:col-span-8 glass-panel rounded-2xl border border-white/10 flex flex-col h-full overflow-hidden">
          {/* Active Conversation Header */}
          <div className="p-3.5 sm:p-4 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#d0bcff]/20 text-[#d0bcff] flex items-center justify-center font-bold text-xs border border-[#d0bcff]/30 shrink-0">
                {isAdmin ? <User className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                  <span className="truncate max-w-[200px] sm:max-w-md">{activeConversationName}</span>
                  <span className="w-2 h-2 rounded-full bg-[#a3e635] shrink-0" />
                </h3>
                <span className="text-[10px] sm:text-[11px] text-[#958ea0] block">
                  {isAdmin
                    ? 'پاسخ فریلنسر به صورت مستقیم و اختصاصی برای کارفرما ثبت می‌شود'
                    : 'ارتباط مستقیم ۱ به ۱ و کاملاً محرمانه با فریلنسر ریتم'}
                </span>
              </div>
            </div>

            <button
              onClick={() => fetchMessages(false)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#958ea0] hover:text-white transition-colors cursor-pointer"
              title="بارگذاری مجدد پیام‌ها"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Prompt Chips (For Clients) */}
          {!isAdmin && (
            <div className="p-2 bg-black/30 border-b border-white/5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <span className="text-[10px] text-[#958ea0] shrink-0 font-medium px-1">پرسش‌های آماده:</span>
              {quickPrompts.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q.text)}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-[#d0bcff]/15 hover:text-[#d0bcff] text-[10.5px] text-[#e5e2e1] border border-white/10 transition-colors shrink-0 cursor-pointer whitespace-nowrap active:scale-95"
                >
                  {q.label}
                </button>
              ))}
            </div>
          )}

          {/* Messages Scroll Area */}
          <div
            ref={chatScrollContainerRef}
            className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3.5 custom-scrollbar bg-black/25"
          >
            {loading ? (
              <div className="h-full flex items-center justify-center text-xs text-[#958ea0]">
                <span className="w-5 h-5 border-2 border-[#d0bcff] border-t-transparent rounded-full animate-spin inline-block ml-2" />
                <span>در حال بارگذاری گفتگو...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#958ea0]">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#d0bcff] mb-3">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">شروع گفتگوی اختصاصی</h4>
                <p className="text-xs max-w-sm leading-relaxed">
                  پیامی در این بخش ثبت نشده است. اولین پیام خود را برای فریلنسر ریتم ارسال فرمایید.
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = isAdmin ? msg.senderRole === 'admin' : msg.senderRole === 'client';
                const isStudio = msg.senderRole === 'admin';

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      <span className="text-[10px] sm:text-[10.5px] font-bold text-[#b8b3c4]">
                        {isStudio ? 'فریلنسر ریتم' : msg.clientName}
                      </span>
                      {isStudio && (
                        <span className="px-1.5 py-0.2 rounded text-[8.5px] font-mono bg-[#d0bcff]/20 text-[#d0bcff] border border-[#d0bcff]/30">
                          ریتم
                        </span>
                      )}
                      <span className="text-[9px] text-[#71717a] font-mono dir-ltr">
                        {new Date(msg.createdAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div
                      className={`max-w-[85%] sm:max-w-[75%] p-3 sm:p-3.5 rounded-2xl text-xs leading-relaxed text-right relative shadow-md break-words ${
                        isMe
                          ? 'bg-gradient-to-br from-[#d0bcff]/20 to-[#3c0091]/30 text-white border border-[#d0bcff]/30 rounded-tr-none'
                          : 'bg-white/[0.06] text-[#e5e2e1] border border-white/10 rounded-tl-none'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-2.5 sm:p-3 bg-white/[0.02] border-t border-white/10 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                lang === 'fa'
                  ? 'پیام اختصاصی خود برای فریلنسر را بنویسید...'
                  : 'Type your message for the freelancer...'
              }
              className="flex-1 bg-black/40 border border-white/10 focus:border-[#d0bcff] rounded-xl px-3.5 sm:px-4 py-2.5 text-xs text-white placeholder-[#71717a] focus:outline-none transition-colors"
            />

            <button
              type="submit"
              disabled={isSending || !inputText.trim()}
              className="px-3.5 sm:px-4 py-2.5 rounded-xl bg-[#d0bcff] hover:bg-[#d0bcff]/90 text-[#131313] font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md cursor-pointer shrink-0"
            >
              {isSending ? (
                <span className="w-3.5 h-3.5 border-2 border-[#131313] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span className="hidden sm:inline">{lang === 'fa' ? 'ارسال' : 'Send'}</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
