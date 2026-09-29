import React, { useState, useEffect } from 'react';
import {
  Shield,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Send,
  AlertCircle,
  Users,
  RefreshCw,
  MessageSquare,
  FileText,
  X,
  ExternalLink,
  LogOut,
  Trash2,
  Settings,
  Megaphone,
} from 'lucide-react';
import { Order, User, OrderStatus } from '../types';
import { getOrders, getUsers, updateOrderStatus, sendMessage, deleteUser } from '../services/api';

interface AdminPanelProps {
  lang: 'fa' | 'en';
  onLogout?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ lang, onLogout }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Status update state
  const [newStatus, setNewStatus] = useState<OrderStatus>('new');
  const [adminNotes, setAdminNotes] = useState('');
  const [notifyClient, setNotifyClient] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Direct Message state
  const [directMessage, setDirectMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [messageSuccess, setMessageSuccess] = useState('');

  // Active view inside admin: 'orders' | 'users' | 'settings'
  const [adminSubTab, setAdminSubTab] = useState<'orders' | 'users' | 'settings'>('orders');

  // User Deletion state
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  // System Settings state
  const [settingsOrdersOpen, setSettingsOrdersOpen] = useState(() => {
    return localStorage.getItem('ritm_orders_open') !== 'false';
  });
  const [telegramChannel, setTelegramChannel] = useState(() => {
    return localStorage.getItem('ritm_tg_channel') || '@RITM_FreeLancer';
  });
  const [globalAnnouncement, setGlobalAnnouncement] = useState(() => {
    return localStorage.getItem('ritm_announcement') || '';
  });
  const [settingsSavedMessage, setSettingsSavedMessage] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersData, usersData] = await Promise.all([
        getOrders(statusFilter, searchQuery),
        getUsers(),
      ]);

      if (ordersData.success) setOrders(ordersData.orders || []);
      if (usersData.success) setUsers(usersData.users || []);
    } catch (e) {
      console.error('Failed to load admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const openOrderDrawer = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setAdminNotes(order.admin_notes || '');
    setMessageSuccess('');
    setDirectMessage('');
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    setIsUpdating(true);
    try {
      const data = await updateOrderStatus(
        selectedOrder.id,
        newStatus,
        adminNotes,
        notifyClient
      );
      if (data.success && data.order) {
        setSelectedOrder(data.order);
        setOrders((prev) => prev.map((o) => (o.id === data.order!.id ? data.order! : o)));
        setMessageSuccess(lang === 'fa' ? 'وضعیت با موفقیت بروزرسانی شد.' : 'Status updated successfully.');
        setTimeout(() => setMessageSuccess(''), 3000);
      }
    } catch (e) {
      console.error('Failed to update status:', e);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSendDirectMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !directMessage.trim() || !selectedOrder.telegram_id) return;

    setIsSendingMessage(true);
    try {
      const data = await sendMessage(
        selectedOrder.id,
        directMessage.trim(),
        true,
        selectedOrder.telegram_id
      );
      if (data.success) {
        setDirectMessage('');
        setMessageSuccess(lang === 'fa' ? 'پیام به کاربر در تلگرام ارسال شد.' : 'Message dispatched to Telegram user.');
        setTimeout(() => setMessageSuccess(''), 3000);
      }
    } catch (e) {
      console.error('Error sending message:', e);
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Status badge styling helper
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'new':
        return {
          label: lang === 'fa' ? 'جدید / در انتظار' : 'New',
          color: 'text-[#ffb869] border-[#ffb869]/30 bg-[#ffb869]/10',
        };
      case 'approved':
        return {
          label: lang === 'fa' ? 'تایید شده / بررسی' : 'Approved',
          color: 'text-[#adc6ff] border-[#adc6ff]/30 bg-[#adc6ff]/10',
        };
      case 'in_progress':
        return {
          label: lang === 'fa' ? 'در حال انجام' : 'In Progress',
          color: 'text-[#d0bcff] border-[#d0bcff]/30 bg-[#d0bcff]/10',
        };
      case 'completed':
        return {
          label: lang === 'fa' ? 'تکمیل شده' : 'Completed',
          color: 'text-[#a3e635] border-[#a3e635]/30 bg-[#a3e635]/10',
        };
      case 'rejected':
      case 'cancelled':
        return {
          label: lang === 'fa' ? 'رد / لغو شده' : 'Cancelled',
          color: 'text-red-400 border-red-500/30 bg-red-500/10',
        };
      default:
        return { label: status, color: 'text-gray-400 border-gray-600 bg-gray-800' };
    }
  };

  // Metrics
  const totalCount = orders.length;
  const pendingCount = orders.filter((o) => o.status === 'new').length;
  const inProgressCount = orders.filter((o) => o.status === 'in_progress' || o.status === 'approved').length;
  const completedCount = orders.filter((o) => o.status === 'completed').length;

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#d0bcff]" />
            <h1 className="text-xl font-bold text-[#e5e2e1]">
              {lang === 'fa' ? 'داشبورد مدیریت سفارشات ریتم' : 'RITM Admin Command Center'}
            </h1>
          </div>
          <p className="text-xs text-[#958ea0] mt-1">
            {lang === 'fa'
              ? 'متصل مستقیم به پایگاه داده Supabase و ربات تلگرام @RITM_FreeLancbot'
              : 'Direct connection to Supabase database & @RITM_FreeLancbot'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{lang === 'fa' ? 'خروج از پنل' : 'Logout'}</span>
            </button>
          )}

          <div className="flex p-1 rounded-xl bg-white/5 border border-white/10 text-xs">
            <button
              onClick={() => setAdminSubTab('orders')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                adminSubTab === 'orders' ? 'bg-[#d0bcff] text-[#131313] font-bold' : 'text-[#958ea0] hover:text-white'
              }`}
            >
              {lang === 'fa' ? `سفارشات (${totalCount})` : `Orders (${totalCount})`}
            </button>
            <button
              onClick={() => setAdminSubTab('users')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                adminSubTab === 'users' ? 'bg-[#d0bcff] text-[#131313] font-bold' : 'text-[#958ea0] hover:text-white'
              }`}
            >
              {lang === 'fa' ? `کاربران سایت (${users.length})` : `Users (${users.length})`}
            </button>
            <button
              onClick={() => setAdminSubTab('settings')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                adminSubTab === 'settings' ? 'bg-[#d0bcff] text-[#131313] font-bold' : 'text-[#958ea0] hover:text-white'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>{lang === 'fa' ? 'تنظیمات سایت' : 'Settings'}</span>
            </button>
          </div>

          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[#e5e2e1] transition-all"
            title="بروزرسانی داده‌ها"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="glass-card rounded-xl p-4 border border-white/10">
          <span className="text-xs text-[#958ea0] block">
            {lang === 'fa' ? 'کل سفارشات' : 'Total Orders'}
          </span>
          <span className="text-2xl font-mono font-bold text-[#e5e2e1] mt-1 block">
            {totalCount}
          </span>
        </div>

        <div className="glass-card rounded-xl p-4 border border-white/10">
          <span className="text-xs text-[#958ea0] block">
            {lang === 'fa' ? 'در انتظار بررسی' : 'Pending Review'}
          </span>
          <span className="text-2xl font-mono font-bold text-[#ffb869] mt-1 block">
            {pendingCount}
          </span>
        </div>

        <div className="glass-card rounded-xl p-4 border border-white/10">
          <span className="text-xs text-[#958ea0] block">
            {lang === 'fa' ? 'در حال اجرا' : 'In Progress'}
          </span>
          <span className="text-2xl font-mono font-bold text-[#adc6ff] mt-1 block">
            {inProgressCount}
          </span>
        </div>

        <div className="glass-card rounded-xl p-4 border border-white/10">
          <span className="text-xs text-[#958ea0] block">
            {lang === 'fa' ? 'تکمیل شده' : 'Completed'}
          </span>
          <span className="text-2xl font-mono font-bold text-[#a3e635] mt-1 block">
            {completedCount}
          </span>
        </div>
      </div>

      {/* SUBTAB 1: ORDERS */}
      {adminSubTab === 'orders' && (
        <div className="space-y-4">
          {/* Filters & Search */}
          <div className="glass-panel rounded-xl p-3 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
              {[
                { id: 'all', labelFa: 'همه', labelEn: 'All' },
                { id: 'new', labelFa: 'جدید', labelEn: 'New' },
                { id: 'approved', labelFa: 'تایید شده', labelEn: 'Approved' },
                { id: 'in_progress', labelFa: 'در حال اجرا', labelEn: 'In Progress' },
                { id: 'completed', labelFa: 'تکمیل شده', labelEn: 'Completed' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setStatusFilter(f.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    statusFilter === f.id
                      ? 'bg-white/15 text-[#d0bcff] font-bold border border-white/20'
                      : 'text-[#958ea0] hover:text-[#e5e2e1]'
                  }`}
                >
                  {lang === 'fa' ? f.labelFa : f.labelEn}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <form onSubmit={handleSearch} className="flex items-center gap-2 w-full md:w-72">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={lang === 'fa' ? 'جستجو بر اساس نام یا کد...' : 'Search code or name...'}
                  className="w-full bg-black/40 border border-white/15 focus:border-[#d0bcff] rounded-xl py-1.5 px-3 text-xs text-[#e5e2e1] outline-none"
                />
              </div>
              <button
                type="submit"
                className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-[#e5e2e1] transition-colors"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Orders Table */}
          <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-black/30 border-b border-white/10 text-[#958ea0] font-medium">
                    <th className="py-3.5 px-4">کد رهگیری</th>
                    <th className="py-3.5 px-4">مشتری</th>
                    <th className="py-3.5 px-4">نوع پروژه</th>
                    <th className="py-3.5 px-4">بودجه</th>
                    <th className="py-3.5 px-4">مهلت</th>
                    <th className="py-3.5 px-4">وضعیت</th>
                    <th className="py-3.5 px-4">تاریخ ثبت</th>
                    <th className="py-3.5 px-4 text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-[#958ea0]">
                        {loading
                          ? (lang === 'fa' ? 'در حال بارگذاری اطلاعات...' : 'Loading orders...')
                          : (lang === 'fa' ? 'هیچ سفارشی با این فیلتر یافت نشد.' : 'No orders found matching filters.')}
                      </td>
                    </tr>
                  ) : (
                    orders.map((ord) => {
                      const badge = getStatusBadge(ord.status);
                      return (
                        <tr
                          key={ord.id}
                          className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                          onClick={() => openOrderDrawer(ord)}
                        >
                          <td className="py-3.5 px-4 font-mono font-bold text-[#d0bcff]">
                            {ord.order_code}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-[#e5e2e1] block">{ord.full_name}</span>
                            <span className="text-[11px] text-[#958ea0] font-mono block">
                              {ord.contact}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-[#e5e2e1]">
                              {ord.project_type === 'video'
                                ? 'تدوین ویدیو'
                                : ord.project_type === 'web'
                                ? 'توسعه وب'
                                : ord.project_type === 'mobile'
                                ? 'اپ موبایل'
                                : 'سایر موارد'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-[#e5e2e1] font-mono">
                            {ord.budget || 'توافقی'}
                          </td>
                          <td className="py-3.5 px-4 text-[#958ea0]">
                            {ord.deadline || 'توافقی'}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-full text-[10.5px] border ${badge.color}`}
                            >
                              {badge.label}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-[#958ea0] font-mono">
                            {new Date(ord.created_at).toLocaleDateString('fa-IR')}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openOrderDrawer(ord);
                              }}
                              className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-[#e5e2e1] text-[11px] border border-white/10 transition-colors"
                            >
                              مدیریت
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: USERS */}
      {adminSubTab === 'users' && (
        <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#e5e2e1]">
                {lang === 'fa' ? 'مدیریت کاربران ثبت‌شده و فعال سایت' : 'Registered Users Management'}
              </h3>
              <p className="text-[11px] text-[#8c94a4]">امکان مشاهده مشخصات و حذف کامل کاربر از کل سیستم</p>
            </div>
            <span className="text-xs text-[#958ea0] font-mono">تعداد: {users.length}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-black/30 border-b border-white/10 text-[#958ea0]">
                  <th className="py-3 px-4">شناسه</th>
                  <th className="py-3 px-4">نام کاربر / برند</th>
                  <th className="py-3 px-4">ایمیل / آیدی</th>
                  <th className="py-3 px-4">نقش</th>
                  <th className="py-3 px-4">تاریخ عضویت</th>
                  <th className="py-3 px-4">عملیات ادمین</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-4 font-mono text-[#d0bcff]">#{u.id}</td>
                    <td className="py-3 px-4 text-[#e5e2e1] font-semibold">
                      {u.first_name || ''} {u.last_name || ''}
                    </td>
                    <td className="py-3 px-4 font-mono text-[#adc6ff] dir-ltr text-right">
                      {u.email || u.username || '-'}
                    </td>
                    <td className="py-3 px-4">
                      {u.is_admin ? (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-[#d0bcff]/20 text-[#d0bcff] border border-[#d0bcff]/30 font-bold">
                          مدیر سیستم
                        </span>
                      ) : (
                        <span className="text-[#958ea0]">کاربر عادی</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-[#958ea0]">
                      {new Date(u.created_at).toLocaleDateString('fa-IR')}
                    </td>
                    <td className="py-3 px-4">
                      {!u.is_admin && (
                        <button
                          onClick={() => setUserToDelete(u)}
                          className="px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/25 text-red-400 border border-red-500/30 text-xs flex items-center gap-1 cursor-pointer transition-colors"
                          title="حذف کامل این کاربر از سیستم"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>حذف کاربر</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 3: SETTINGS */}
      {adminSubTab === 'settings' && (
        <div className="space-y-6">
          {/* Card 1: Order Reception Toggle */}
          <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-right">
                <h3 className="text-base font-bold text-white">وضعیت پذیرش سفارشات در سایت</h3>
                <p className="text-xs text-[#8c94a4] mt-0.5">در صورت غیرفعال‌سازی، کاربران پیامی مبنی بر پر بودن موقت ظرفیت مشاهده خواهند کرد.</p>
              </div>
              <button
                onClick={() => {
                  const nextVal = !settingsOrdersOpen;
                  setSettingsOrdersOpen(nextVal);
                  localStorage.setItem('ritm_orders_open', String(nextVal));
                  setSettingsSavedMessage('وضعیت پذیرش سفارشات با موفقیت ذخیره شد.');
                  setTimeout(() => setSettingsSavedMessage(''), 3000);
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  settingsOrdersOpen
                    ? 'bg-[#a3e635]/20 text-[#a3e635] border border-[#a3e635]/40 hover:bg-[#a3e635]/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30'
                }`}
              >
                {settingsOrdersOpen ? 'پذیرش سفارشات: فعال ✅' : 'پذیرش سفارشات: متوقف ⛔'}
              </button>
            </div>
          </div>

          {/* Card 2: Telegram Channel ID */}
          <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4 text-right">
            <div>
              <h3 className="text-base font-bold text-white">آدرس و آیدی کانال تلگرام استودیو</h3>
              <p className="text-xs text-[#8c94a4] mt-0.5">کانالی که دکمه تلگرام در هدر و فوتر به آن لینک می‌شود.</p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input
                type="text"
                value={telegramChannel}
                onChange={(e) => setTelegramChannel(e.target.value)}
                placeholder="@RITM_FreeLancer"
                className="flex-1 bg-[#161823] border border-white/15 focus:border-[#d0bcff] rounded-xl px-4 py-2.5 text-xs text-white outline-none dir-ltr text-left font-mono"
              />
              <button
                onClick={() => {
                  localStorage.setItem('ritm_tg_channel', telegramChannel.trim());
                  setSettingsSavedMessage('آدرس کانال تلگرام با موفقیت ذخیره شد.');
                  setTimeout(() => setSettingsSavedMessage(''), 3000);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#d0bcff] text-[#0d0f17] font-bold text-xs hover:bg-[#d0bcff]/90 transition-colors cursor-pointer"
              >
                ذخیره کانال
              </button>
            </div>
          </div>

          {/* Card 3: Global Broadcast Announcement */}
          <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4 text-right">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-[#ffb869]" />
                <span>پیام اطلاعیه سراسری برای کاربران سایت</span>
              </h3>
              <p className="text-xs text-[#8c94a4] mt-0.5">متن اخبار، تخفیف ویژه یا اعلامیه‌های فوری استودیو ریتم.</p>
            </div>

            <textarea
              rows={3}
              value={globalAnnouncement}
              onChange={(e) => setGlobalAnnouncement(e.target.value)}
              placeholder="مثال: جشنواره تخفیف ادیت ویدیو با پریمیر پرو تا انتهای هفته جاری فعال است..."
              className="w-full bg-[#161823] border border-white/15 focus:border-[#d0bcff] rounded-xl p-3 text-xs text-white outline-none leading-relaxed"
            />

            <div className="flex items-center justify-between">
              {settingsSavedMessage && (
                <span className="text-xs text-[#a3e635] font-medium">{settingsSavedMessage}</span>
              )}
              <button
                onClick={() => {
                  localStorage.setItem('ritm_announcement', globalAnnouncement.trim());
                  setSettingsSavedMessage('پیام اطلاعیه ذخیره شد.');
                  setTimeout(() => setSettingsSavedMessage(''), 3000);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#d0bcff] text-[#0d0f17] font-bold text-xs hover:bg-[#d0bcff]/90 transition-colors cursor-pointer mr-auto"
              >
                ذخیره و ثبت پیام
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE USER CONFIRMATION MODAL */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md rounded-2xl border border-red-500/40 p-6 shadow-2xl space-y-4 text-right">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center mx-auto border border-red-500/30">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-white">حذف کامل کاربر از سایت</h3>
              <p className="text-xs text-[#8c94a4] leading-relaxed">
                آیا مطمئن هستید که می‌خواهید کاربر{' '}
                <span className="text-white font-bold">{userToDelete.first_name || userToDelete.email || userToDelete.username || userToDelete.id}</span>{' '}
                را به طور کامل از سایت حذف کنید؟ این عملیات برگشت‌ناپذیر است.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setUserToDelete(null)}
                className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold cursor-pointer"
              >
                انصراف
              </button>
              <button
                onClick={async () => {
                  setIsDeletingUser(true);
                  try {
                    const res = await deleteUser(userToDelete.id);
                    if (res.success) {
                      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
                      setUserToDelete(null);
                    }
                  } catch (e) {
                    console.error('Failed to delete user:', e);
                  } finally {
                    setIsDeletingUser(false);
                  }
                }}
                disabled={isDeletingUser}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                {isDeletingUser ? 'در حال حذف...' : 'بله، حذف کن'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ORDER DETAILS MODAL / DRAWER */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-2xl rounded-2xl border border-white/20 p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {/* Close button */}
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-5 left-5 p-1 rounded-lg bg-white/5 hover:bg-white/10 text-[#958ea0] hover:text-[#e5e2e1] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="mb-6">
              <span className="font-mono text-xs text-[#d0bcff] font-bold block mb-1">
                {selectedOrder.order_code}
              </span>
              <h2 className="text-xl font-bold text-[#e5e2e1]">
                {selectedOrder.full_name}
              </h2>
            </div>

            {messageSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
                {messageSuccess}
              </div>
            )}

            {/* Grid specs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-black/40 border border-white/10 mb-6 text-xs">
              <div>
                <span className="text-[#958ea0] block">نوع پروژه:</span>
                <span className="text-[#e5e2e1] font-semibold">{selectedOrder.project_type}</span>
              </div>
              <div>
                <span className="text-[#958ea0] block">بودجه:</span>
                <span className="text-[#e5e2e1] font-semibold">{selectedOrder.budget || 'توافقی'}</span>
              </div>
              <div>
                <span className="text-[#958ea0] block">مهلت:</span>
                <span className="text-[#e5e2e1] font-semibold">{selectedOrder.deadline || 'توافقی'}</span>
              </div>
              <div>
                <span className="text-[#958ea0] block">تماس:</span>
                <span className="text-[#e5e2e1] font-mono">{selectedOrder.contact}</span>
              </div>
              <div>
                <span className="text-[#958ea0] block">شناسه تلگرام:</span>
                <span className="text-[#e5e2e1] font-mono">{selectedOrder.telegram_id || 'ندارد'}</span>
              </div>
              <div>
                <span className="text-[#958ea0] block">تاریخ ثبت:</span>
                <span className="text-[#e5e2e1] font-mono">
                  {new Date(selectedOrder.created_at).toLocaleDateString('fa-IR')}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h4 className="text-xs font-bold text-[#958ea0] mb-2">توضیحات و نیازمندی‌های مشتری:</h4>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 text-xs text-[#e5e2e1] leading-relaxed whitespace-pre-line">
                {selectedOrder.description}
              </div>
            </div>

            {/* Status Update Form */}
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 mb-6 space-y-4">
              <h4 className="text-xs font-bold text-[#d0bcff]">بروزرسانی وضعیت سفارش:</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[#958ea0] block mb-1">وضعیت جدید:</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                    className="w-full bg-black/50 border border-white/15 rounded-lg p-2 text-xs text-[#e5e2e1] outline-none"
                  >
                    <option value="new">🟡 جدید (New)</option>
                    <option value="approved">🔍 تایید شده / در بررسی (Approved)</option>
                    <option value="in_progress">⚡ در حال طراحی و اجرا (In Progress)</option>
                    <option value="completed">✅ تکمیل و تحویل داده شد (Completed)</option>
                    <option value="rejected">❌ رد شده (Rejected)</option>
                    <option value="cancelled">🚫 لغو شده (Cancelled)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-[#958ea0] block mb-1">یادداشت فنی / پیام به مشتری:</label>
                  <input
                    type="text"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="مثلاً: فاز اول با موفقیت آماده شد"
                    className="w-full bg-black/50 border border-white/15 rounded-lg p-2 text-xs text-[#e5e2e1] outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-[#958ea0]">
                  <input
                    type="checkbox"
                    checked={notifyClient}
                    onChange={(e) => setNotifyClient(e.target.checked)}
                    className="rounded border-white/20 bg-black/40 text-[#d0bcff]"
                  />
                  <span>ارسال اعلان خودکار به حساب تلگرام کاربر</span>
                </label>

                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={handleUpdateStatus}
                  className="px-4 py-2 rounded-xl bg-[#d0bcff] hover:bg-[#d0bcff]/90 text-[#131313] font-bold text-xs transition-all disabled:opacity-50"
                >
                  {isUpdating ? 'در حال ثبت...' : 'ذخیره تغییرات'}
                </button>
              </div>
            </div>

            {/* Send Direct Telegram Message */}
            {selectedOrder.telegram_id && selectedOrder.telegram_id > 0 && (
              <form onSubmit={handleSendDirectMessage} className="p-4 rounded-xl bg-black/40 border border-white/10">
                <h4 className="text-xs font-bold text-[#adc6ff] mb-2 flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5" />
                  <span>ارسال پیام مستقیم به تلگرام مشتری ({selectedOrder.telegram_id})</span>
                </h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={directMessage}
                    onChange={(e) => setDirectMessage(e.target.value)}
                    placeholder="متن پیام به کاربر در تلگرام..."
                    className="flex-1 bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-[#e5e2e1] outline-none"
                  />
                  <button
                    type="submit"
                    disabled={isSendingMessage || !directMessage.trim()}
                    className="px-4 py-2 rounded-xl bg-[#adc6ff] hover:bg-[#adc6ff]/90 text-[#131313] font-bold text-xs transition-all disabled:opacity-50"
                  >
                    {isSendingMessage ? 'در حال ارسال...' : 'ارسال'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
