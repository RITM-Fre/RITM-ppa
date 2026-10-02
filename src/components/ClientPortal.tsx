import React, { useState, useEffect } from 'react';
import {
  User,
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertCircle,
  LogIn,
  UserPlus,
  Send,
  FolderKanban,
  LogOut,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Search,
  FileText,
  KeyRound,
  Mail,
  ExternalLink,
  Trash2,
  X,
  MessageSquare,
} from 'lucide-react';
import { Order, AuthUser, OrderStatus, ProjectType } from '../types';
import {
  clientLogin,
  clientRegister,
  getClientOrders,
  cancelOrderByClient,
  sendOtpEmail,
  verifyOtpCode,
  resetPasswordWithOtp,
} from '../services/api';
import { ProjectContractModal } from './ProjectContractModal';

interface ClientPortalProps {
  lang: 'fa' | 'en';
  currentUser: AuthUser | null;
  onLogin: (user: AuthUser) => void;
  onLogout: () => void;
  onNavigateToOrder: () => void;
  onNavigateToPortfolio: () => void;
  onNavigateToChat?: (orderCode?: string) => void;
}

export const ClientPortal: React.FC<ClientPortalProps> = ({
  lang,
  currentUser,
  onLogin,
  onLogout,
  onNavigateToOrder,
  onNavigateToPortfolio,
  onNavigateToChat,
}) => {
  // Auth Form State
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'lookup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [lookupQuery, setLookupQuery] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forgot Password / OTP State
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1);
  const [otpSuccessMsg, setOtpSuccessMsg] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  // Cancel Order State
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [isCancellingOrder, setIsCancellingOrder] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // Client Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedContractOrder, setSelectedContractOrder] = useState<Order | null>(null);

  // Fetch client orders
  const fetchClientOrders = async (userObj?: AuthUser | null, queryCode?: string) => {
    setLoadingOrders(true);
    try {
      const data = await getClientOrders(userObj, queryCode);
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (e) {
      console.error('Failed to fetch client orders:', e);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchClientOrders(currentUser);
    }
  }, [currentUser]);

  const handleCancelOrderConfirm = async () => {
    if (!orderToCancel) return;
    setIsCancellingOrder(true);
    try {
      const res = await cancelOrderByClient(orderToCancel.id, cancelReason.trim());
      if (res.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderToCancel.id
              ? {
                  ...o,
                  status: 'cancelled' as OrderStatus,
                  admin_notes: cancelReason
                    ? `لغو شده توسط کارفرما: ${cancelReason}`
                    : 'لغو شده توسط کارفرما',
                }
              : o
          )
        );
        setOrderToCancel(null);
        setCancelReason('');
      } else {
        alert(res.error || (lang === 'fa' ? 'خطا در لغو سفارش' : 'Failed to cancel order'));
      }
    } catch (err: any) {
      alert(err.message || (lang === 'fa' ? 'خطا در اتصال به سرور' : 'Connection error'));
    } finally {
      setIsCancellingOrder(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password.trim()) {
      setErrorMsg(lang === 'fa' ? 'لطفاً ایمیل و رمز عبور را وارد کنید.' : 'Please enter email and password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const data = await clientLogin(cleanEmail, password.trim());
      if (data.success && data.user) {
        onLogin(data.user);
      } else {
        setErrorMsg(data.error || (lang === 'fa' ? 'ایمیل یا رمز عبور اشتباه است.' : 'Login failed.'));
      }
    } catch (e) {
      setErrorMsg(lang === 'fa' ? 'خطا در ارتباط با سرور.' : 'Server connection error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setErrorMsg(lang === 'fa' ? 'لطفاً یک آدرس ایمیل معتبر وارد کنید (مانند user@example.com).' : 'Invalid email format.');
      return;
    }

    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMsg(lang === 'fa' ? 'لطفاً نام خود را وارد کنید.' : 'Please enter your name.');
      return;
    }

    if (password.trim().length < 4) {
      setErrorMsg(lang === 'fa' ? 'رمز عبور باید حداقل ۴ کاراکتر باشد.' : 'Password must be at least 4 characters.');
      return;
    }

    setIsSubmitting(true);

    try {
      const data = await clientRegister(cleanEmail, password.trim(), fullName.trim());
      if (data.success && data.user) {
        onLogin(data.user);
      } else {
        setErrorMsg(data.error || (lang === 'fa' ? 'خطا در ثبت نام.' : 'Registration failed.'));
      }
    } catch (e) {
      setErrorMsg(lang === 'fa' ? 'خطا در اتصال به سرور.' : 'Server connection error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLookupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupQuery.trim()) return;
    setErrorMsg('');
    await fetchClientOrders(null, lookupQuery.trim());
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setOtpSuccessMsg('');
    const clean = forgotEmail.trim().toLowerCase();
    if (!clean || !clean.includes('@')) {
      setErrorMsg(lang === 'fa' ? 'لطفاً آدرس ایمیل معتبر وارد کنید.' : 'Valid email required.');
      return;
    }

    setIsSendingOtp(true);
    try {
      const res = await sendOtpEmail(clean, 'reset');
      if (res.success) {
        setForgotStep(2);
        setOtpSuccessMsg(res.message || 'کد تایید ۶ رقمی به ایمیل شما ارسال شد.');
        if (res.debugCode) {
          console.log('[Dev Preview] OTP Code:', res.debugCode);
        }
      } else {
        setErrorMsg(res.error || (lang === 'fa' ? 'خطا در ارسال کد تایید.' : 'Failed to send OTP code.'));
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'خطا در ارتباط با سرور.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!otpCode.trim() || otpCode.trim().length < 4) {
      setErrorMsg(lang === 'fa' ? 'لطفاً کد تایید دریافتی را کامل وارد کنید.' : 'Please enter the verification code.');
      return;
    }

    setIsSendingOtp(true);
    try {
      const res = await verifyOtpCode(forgotEmail.trim().toLowerCase(), otpCode.trim());
      if (res.success) {
        setForgotStep(3);
        setErrorMsg('');
        setOtpSuccessMsg(lang === 'fa' ? 'کد تایید شد. اکنون رمز عبور جدید را تعیین فرمایید:' : 'Code verified. Set your new password:');
      } else {
        setErrorMsg(res.error || (lang === 'fa' ? 'کد وارد شده نامعتبر یا منقضی است.' : 'Invalid code.'));
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'خطا در تایید کد.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!newPassword.trim() || newPassword.trim().length < 4) {
      setErrorMsg(lang === 'fa' ? 'رمز عبور باید حداقل ۴ کاراکتر باشد.' : 'Password must be at least 4 characters.');
      return;
    }

    setIsSendingOtp(true);
    try {
      const res = await resetPasswordWithOtp(forgotEmail.trim().toLowerCase(), otpCode.trim(), newPassword.trim());
      if (res.success) {
        setOtpSuccessMsg(lang === 'fa' ? '✓ رمز عبور با موفقیت تغییر کرد! اکنون وارد شوید.' : 'Password changed successfully!');
        setTimeout(() => {
          setEmail(forgotEmail);
          setPassword(newPassword);
          setAuthMode('login');
          setForgotStep(1);
          setOtpCode('');
          setNewPassword('');
        }, 1500);
      } else {
        setErrorMsg(res.error || 'خطا در تغییر رمز عبور.');
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'خطا در تغییر رمز عبور.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleConfirmCancelOrder = async () => {
    if (!orderToCancel) return;
    setIsCancellingOrder(true);
    try {
      const res = await cancelOrderByClient(orderToCancel.id, cancelReason);
      if (res.success) {
        setOrders((prev) => prev.map((o) => (o.id === orderToCancel.id ? { ...o, status: 'cancelled' } : o)));
        setOrderToCancel(null);
        setCancelReason('');
      } else {
        alert(res.error || 'خطا در لغو سفارش');
      }
    } catch (e) {
      console.error('Cancel order error:', e);
    } finally {
      setIsCancellingOrder(false);
    }
  };

  // Helper for workflow milestones
  const getWorkflowProgress = (status: OrderStatus) => {
    switch (status) {
      case 'new':
        return { step: 1, percent: 25, label: 'ثبت شده (در صف ارزیابی)', color: 'text-[#ffb869]' };
      case 'approved':
        return { step: 2, percent: 50, label: 'تایید شده (در نوبت اجرا)', color: 'text-[#adc6ff]' };
      case 'in_progress':
        return { step: 3, percent: 75, label: 'در حال طراحی و پیاده‌سازی', color: 'text-[#d0bcff]' };
      case 'completed':
        return { step: 4, percent: 100, label: 'تکمیل و تحویل نهایی', color: 'text-[#a3e635]' };
      case 'rejected':
      case 'cancelled':
        return { step: 0, percent: 0, label: 'لغو یا رد شده', color: 'text-red-400' };
      default:
        return { step: 1, percent: 25, label: status, color: 'text-gray-400' };
    }
  };

  // 1. IF NOT LOGGED IN
  if (!currentUser) {
    return (
      <div className="max-w-xl mx-auto py-10 px-4">
        <div className="glass-panel rounded-3xl p-6 md:p-8 border border-white/10 shadow-2xl text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 text-[#d0bcff]">
            <User className="w-7 h-7" />
          </div>

          <h2 className="text-2xl font-bold text-[#e5e2e1] mb-2">
            {lang === 'fa' ? 'ورود به پنل کاربری مشتریان' : 'Client Progress Portal'}
          </h2>
          <p className="text-xs text-[#958ea0] mb-6 leading-relaxed">
            {lang === 'fa'
              ? 'جهت مشاهده روند انجام پروژه، پیام‌های استودیو ریتم و سفارشات خود وارد شوید.'
              : 'Sign in with your username and password to track project milestones.'}
          </p>

          {/* Toggle Tabs */}
          <div className="flex p-1 rounded-xl bg-white/5 border border-white/10 mb-6 text-xs font-medium">
            <button
              onClick={() => {
                setAuthMode('login');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 rounded-lg transition-all ${
                authMode === 'login' ? 'bg-[#d0bcff] text-[#131313] font-bold' : 'text-[#958ea0]'
              }`}
            >
              {lang === 'fa' ? 'ورود به حساب' : 'Log In'}
            </button>
            <button
              onClick={() => {
                setAuthMode('register');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 rounded-lg transition-all ${
                authMode === 'register' ? 'bg-[#d0bcff] text-[#131313] font-bold' : 'text-[#958ea0]'
              }`}
            >
              {lang === 'fa' ? 'ثبت نام جدید' : 'Sign Up'}
            </button>
            <button
              onClick={() => {
                setAuthMode('lookup');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 rounded-lg transition-all ${
                authMode === 'lookup' ? 'bg-[#d0bcff] text-[#131313] font-bold' : 'text-[#958ea0]'
              }`}
            >
              {lang === 'fa' ? 'رهگیری با کد' : 'Track by Code'}
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs text-right">
              {errorMsg}
            </div>
          )}

          {/* LOGIN FORM */}
          {authMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-right">
              <div>
                <label className="block text-xs font-semibold text-[#958ea0] mb-1.5">
                  {lang === 'fa' ? 'آدرس ایمیل شما:' : 'Email Address:'}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-black/40 border border-white/15 focus:border-[#d0bcff] rounded-xl px-4 py-2.5 text-xs text-[#e5e2e1] outline-none dir-ltr text-left"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#958ea0] mb-1.5">
                  {lang === 'fa' ? 'رمز عبور:' : 'Password:'}
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-black/40 border border-white/15 focus:border-[#d0bcff] rounded-xl px-4 py-2.5 text-xs text-[#e5e2e1] outline-none dir-ltr text-left"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-[#d0bcff] hover:bg-[#d0bcff]/90 text-[#131313] font-bold text-xs transition-all shadow-lg shadow-[#d0bcff]/20 disabled:opacity-50 mt-2 flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>{isSubmitting ? (lang === 'fa' ? 'در حال ورود...' : 'Signing in...') : (lang === 'fa' ? 'ورود به حساب کاربری' : 'Sign In')}</span>
              </button>
            </form>
          )}

          {/* REGISTER FORM */}
          {authMode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-right">
              <div>
                <label className="block text-xs font-semibold text-[#958ea0] mb-1.5">
                  {lang === 'fa' ? 'نام و نام‌خانوادگی یا نام برند:' : 'Full Name / Brand:'}
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="مثال: محمد احمدی"
                  className="w-full bg-black/40 border border-white/15 focus:border-[#d0bcff] rounded-xl px-4 py-2.5 text-xs text-[#e5e2e1] outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-[#958ea0]">
                    {lang === 'fa' ? 'آدرس ایمیل:' : 'Email Address:'}
                  </label>
                  <span className="text-[10px] text-[#ffb869]">
                    {lang === 'fa' ? 'ایمیل تکراری پذیرفته نمی‌شود' : 'Unique email required'}
                  </span>
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-black/40 border border-white/15 focus:border-[#d0bcff] rounded-xl px-4 py-2.5 text-xs text-[#e5e2e1] outline-none dir-ltr text-left"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#958ea0] mb-1.5">
                  {lang === 'fa' ? 'رمز عبور دلخواه:' : 'Password:'}
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="حداقل ۴ کاراکتر"
                  className="w-full bg-black/40 border border-white/15 focus:border-[#d0bcff] rounded-xl px-4 py-2.5 text-xs text-[#e5e2e1] outline-none dir-ltr text-left"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-[#d0bcff] hover:bg-[#d0bcff]/90 text-[#131313] font-bold text-xs transition-all shadow-lg shadow-[#d0bcff]/20 disabled:opacity-50 mt-2 flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>{isSubmitting ? (lang === 'fa' ? 'در حال ثبت نام...' : 'Registering...') : (lang === 'fa' ? 'عضویت و ورود به سایت' : 'Create Account')}</span>
              </button>
            </form>
          )}

          {/* LOOKUP BY CODE */}
          {authMode === 'lookup' && (
            <div className="space-y-4 text-right">
              <form onSubmit={handleLookupSubmit} className="flex gap-2">
                <input
                  type="text"
                  required
                  value={lookupQuery}
                  onChange={(e) => setLookupQuery(e.target.value)}
                  placeholder="کد رهگیری (مثلاً RITM-1794) یا شماره تماس..."
                  className="flex-1 bg-black/40 border border-white/15 focus:border-[#d0bcff] rounded-xl px-4 py-2.5 text-xs text-[#e5e2e1] outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-[#d0bcff] text-[#131313] font-bold text-xs hover:bg-[#d0bcff]/90 transition-all shrink-0"
                >
                  <Search className="w-4 h-4" />
                </button>
              </form>

              {orders.length > 0 && (
                <div className="mt-4 p-4 rounded-xl bg-black/40 border border-white/10 text-right space-y-3">
                  <span className="text-xs font-mono text-[#d0bcff] block">
                    سفارش یافت شد: {orders[0].order_code}
                  </span>
                  <div className="text-xs space-y-1">
                    <p><span className="text-[#958ea0]">مشتری:</span> {orders[0].full_name}</p>
                    <p><span className="text-[#958ea0]">نوع پروژه:</span> {orders[0].project_type}</p>
                    <p><span className="text-[#958ea0]">وضعیت:</span> {orders[0].status}</p>
                    {orders[0].admin_notes && (
                      <p className="p-2 rounded bg-white/5 border border-white/10 text-[#adc6ff]">
                        💬 پیام تیم: {orders[0].admin_notes}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // 2. IF LOGGED IN: SHOW CLIENT DASHBOARD (روند کار پروژه)
  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">
      {/* Header Profile Bar */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#d0bcff]/15 border border-[#d0bcff]/30 flex items-center justify-center text-[#d0bcff]">
            <User className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-[#e5e2e1]">
                {currentUser.first_name || currentUser.username}
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/10 text-[#adc6ff]">
                @{currentUser.username}
              </span>
            </div>
            <p className="text-xs text-[#958ea0] mt-0.5">
              {lang === 'fa' ? 'پنل اختصاصی پیگیری پروژه‌ها و ارتباط با استودیو ریتم' : 'Client Project Progress Center'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={onNavigateToOrder}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#d0bcff] hover:bg-[#d0bcff]/90 text-[#131313] font-semibold text-xs transition-all shadow-sm"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{lang === 'fa' ? 'ثبت سفارش جدید' : 'New Order'}</span>
          </button>

          <button
            onClick={onLogout}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#958ea0] hover:text-red-400 border border-white/10 transition-colors"
            title="خروج از حساب"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Live Orders & Workflow */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-[#e5e2e1] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#d0bcff]" />
            <span>{lang === 'fa' ? 'روند کار پروژه‌های شما' : 'Your Projects & Live Progress'}</span>
          </h2>
          <span className="text-xs text-[#958ea0] font-mono">
            {orders.length} {lang === 'fa' ? 'پروژه ثبت شده' : 'Projects'}
          </span>
        </div>

        {loadingOrders ? (
          <div className="glass-panel rounded-2xl p-12 text-center text-[#958ea0] text-xs">
            <span className="w-6 h-6 border-2 border-[#d0bcff] border-t-transparent rounded-full animate-spin inline-block mb-3" />
            <p>{lang === 'fa' ? 'در حال بارگذاری وضعیت پروژه‌ها...' : 'Loading project progress...'}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="glass-panel rounded-2xl p-10 text-center border border-white/10">
            <Sparkles className="w-10 h-10 text-[#d0bcff]/50 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-[#e5e2e1] mb-1">
              {lang === 'fa' ? 'هنوز پروژه‌ای ثبت نکرده‌اید' : 'No active projects yet'}
            </h3>
            <p className="text-xs text-[#958ea0] max-w-md mx-auto mb-6">
              {lang === 'fa'
                ? 'ایده دیجیتال خود را از طریق دکمه زیر ارسال کنید تا کارشناسان ریتم سریعاً مراحل طراحی و پیاده‌سازی را آغاز نمایند.'
                : 'Start your creative vision with RITM studio today.'}
            </p>
            <button
              onClick={onNavigateToOrder}
              className="px-6 py-2.5 rounded-xl bg-[#d0bcff] text-[#131313] font-bold text-xs hover:bg-[#d0bcff]/90 transition-all"
            >
              {lang === 'fa' ? 'شروع و ثبت اولین سفارش' : 'Start First Order'}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((ord) => {
              const wf = getWorkflowProgress(ord.status);
              return (
                <div
                  key={ord.id}
                  className="glass-panel rounded-2xl p-6 border border-white/10 shadow-lg text-right relative overflow-hidden"
                >
                  {/* Top line with code and date */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-5 border-b border-white/[0.08] gap-2">
                    <div>
                      <span className="font-mono text-xs font-bold text-[#d0bcff] block">
                        {ord.order_code}
                      </span>
                      <h3 className="text-sm font-bold text-[#e5e2e1] mt-0.5">
                        {ord.project_type === 'video'
                          ? 'پروژه تدوین ویدیو و پست‌پروداکشن 🎬'
                          : ord.project_type === 'web'
                          ? 'پروژه طراحی و توسعه وب‌سایت 💻'
                          : ord.project_type === 'mobile'
                          ? 'پروژه اپلیکیشن موبایل 📱'
                          : 'پروژه سفارشی و هوش مصنوعی 🎨'}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium border bg-white/5 ${wf.color}`}>
                        {wf.label}
                      </span>
                      <span className="text-[11px] font-mono text-[#958ea0]">
                        {new Date(ord.created_at).toLocaleDateString('fa-IR')}
                      </span>
                    </div>
                  </div>

                  {/* VISUAL 4-STEP WORKFLOW STEPPER */}
                  <div className="mb-6">
                    <span className="text-xs font-semibold text-[#958ea0] block mb-3">
                      {lang === 'fa' ? 'مراحل پیشرفت اجرای پروژه:' : 'Project Execution Timeline:'}
                    </span>

                    {/* Progress Bar Track */}
                    <div className="relative w-full h-1.5 bg-white/10 rounded-full mb-4">
                      <div
                        className="h-full bg-gradient-to-r from-[#3c0091] via-[#d0bcff] to-[#a3e635] rounded-full transition-all duration-700"
                        style={{ width: `${wf.percent}%` }}
                      />
                    </div>

                    {/* 4 Milestones */}
                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      <div className={`space-y-1 ${wf.step >= 1 ? 'text-[#e5e2e1]' : 'text-[#958ea0]/50'}`}>
                        <div className={`w-6 h-6 rounded-full mx-auto flex items-center justify-center text-[10px] font-bold ${wf.step >= 1 ? 'bg-[#d0bcff] text-[#131313]' : 'bg-white/10 text-[#958ea0]'}`}>
                          ۱
                        </div>
                        <span className="text-[10px] block font-medium">ثبت اولیه</span>
                      </div>

                      <div className={`space-y-1 ${wf.step >= 2 ? 'text-[#e5e2e1]' : 'text-[#958ea0]/50'}`}>
                        <div className={`w-6 h-6 rounded-full mx-auto flex items-center justify-center text-[10px] font-bold ${wf.step >= 2 ? 'bg-[#adc6ff] text-[#131313]' : 'bg-white/10 text-[#958ea0]'}`}>
                          ۲
                        </div>
                        <span className="text-[10px] block font-medium">تایید و زمان‌بندی</span>
                      </div>

                      <div className={`space-y-1 ${wf.step >= 3 ? 'text-[#e5e2e1]' : 'text-[#958ea0]/50'}`}>
                        <div className={`w-6 h-6 rounded-full mx-auto flex items-center justify-center text-[10px] font-bold ${wf.step >= 3 ? 'bg-[#d0bcff] text-[#131313]' : 'bg-white/10 text-[#958ea0]'}`}>
                          ۳
                        </div>
                        <span className="text-[10px] block font-medium">در حال اجرا</span>
                      </div>

                      <div className={`space-y-1 ${wf.step >= 4 ? 'text-[#e5e2e1]' : 'text-[#958ea0]/50'}`}>
                        <div className={`w-6 h-6 rounded-full mx-auto flex items-center justify-center text-[10px] font-bold ${wf.step >= 4 ? 'bg-[#a3e635] text-[#131313]' : 'bg-white/10 text-[#958ea0]'}`}>
                          ۴
                        </div>
                        <span className="text-[10px] block font-medium">تحویل نهایی</span>
                      </div>
                    </div>
                  </div>

                  {/* Team Note if exists */}
                  {ord.admin_notes && (
                    <div className="p-3.5 rounded-xl bg-white/[0.04] border border-[#d0bcff]/30 mb-4 flex items-start gap-2.5">
                      <Sparkles className="w-4 h-4 text-[#d0bcff] shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[11px] font-bold text-[#d0bcff] block">
                          پیام و توضیحات تیم فنی ریتم:
                        </span>
                        <p className="text-xs text-[#e5e2e1] leading-relaxed mt-0.5">
                          {ord.admin_notes}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Order Specs */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3 rounded-xl bg-black/40 border border-white/5 text-[11px] text-[#958ea0] mb-4">
                    <div>
                      <span>بودجه مدنظر: </span>
                      <strong className="text-[#e5e2e1] font-mono">{ord.budget || 'توافقی'}</strong>
                    </div>
                    <div>
                      <span>مهلت تحویل: </span>
                      <strong className="text-[#e5e2e1]">{ord.deadline || 'توافقی'}</strong>
                    </div>
                    <div>
                      <span>روش ارتباط: </span>
                      <strong className="text-[#e5e2e1] font-mono">{ord.contact}</strong>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => setSelectedContractOrder(ord)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#d0bcff]/15 hover:bg-[#d0bcff]/25 text-[#d0bcff] border border-[#d0bcff]/30 text-xs font-semibold cursor-pointer transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>{lang === 'fa' ? 'فاکتور و قرارداد' : 'Invoice & Contract'}</span>
                      </button>

                      {onNavigateToChat && (
                        <button
                          onClick={() => onNavigateToChat(ord.order_code)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#a3e635]/15 hover:bg-[#a3e635]/25 text-[#a3e635] border border-[#a3e635]/30 text-xs font-semibold cursor-pointer transition-colors"
                          title="گفتگوی مستقیم با پشتیبانی درباره این پروژه"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{lang === 'fa' ? 'گفتگوی آنلاین' : 'Live Chat'}</span>
                        </button>
                      )}

                      {ord.status !== 'cancelled' && ord.status !== 'completed' && (
                        <button
                          onClick={() => setOrderToCancel(ord)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-medium cursor-pointer transition-colors"
                          title="درخواست لغو سفارش"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{lang === 'fa' ? 'لغو سفارش' : 'Cancel'}</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-3 mr-auto">
                      <a
                        href="https://t.me/RITM_FreeLancer"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-[#38bdf8] hover:underline"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{lang === 'fa' ? 'کانال رسمی' : 'Channel'}</span>
                      </a>

                      <span className="text-[10px] text-[#958ea0] font-mono">
                        بروزرسانی: {new Date(ord.updated_at).toLocaleDateString('fa-IR')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CANCEL ORDER CONFIRMATION MODAL */}
        {orderToCancel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="glass-panel w-full max-w-md rounded-2xl border border-red-500/30 p-6 shadow-2xl space-y-4 text-right">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center mx-auto border border-red-500/30">
                <AlertCircle className="w-6 h-6" />
              </div>

              <div className="text-center space-y-1">
                <h3 className="text-lg font-bold text-white">
                  {lang === 'fa' ? 'لغو سفارش' : 'Cancel Order'}
                </h3>
                <p className="text-xs text-[#958ea0] leading-relaxed">
                  {lang === 'fa'
                    ? `آیا از لغو سفارش شماره ${orderToCancel.order_code} اطمینان دارید؟ وضعیت پروژه به «لغو شده توسط کاربر» تغییر خواهد کرد.`
                    : `Are you sure you want to cancel order #${orderToCancel.order_code}?`}
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-[#b8b3c4] block">
                  {lang === 'fa' ? 'علت انصراف و لغو (اختیاری):' : 'Reason for cancellation (optional):'}
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder={
                    lang === 'fa'
                      ? 'علت انصراف خود را در صورت تمایل بنویسید...'
                      : 'Please specify the reason...'
                  }
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-[#71717a] focus:outline-none focus:border-[#d0bcff] h-20 resize-none"
                />
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setOrderToCancel(null);
                    setCancelReason('');
                  }}
                  disabled={isCancellingOrder}
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold cursor-pointer"
                >
                  {lang === 'fa' ? 'بازگشت' : 'Back'}
                </button>
                <button
                  onClick={handleCancelOrderConfirm}
                  disabled={isCancellingOrder}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isCancellingOrder
                    ? (lang === 'fa' ? 'در حال لغو...' : 'Cancelling...')
                    : (lang === 'fa' ? 'بله، لغو سفارش' : 'Confirm Cancel')}
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedContractOrder && (
          <ProjectContractModal
            order={selectedContractOrder}
            lang={lang}
            onClose={() => setSelectedContractOrder(null)}
          />
        )}
      </div>
    </div>
  );
};
