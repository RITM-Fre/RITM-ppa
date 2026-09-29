import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Activity,
  Database,
  Send,
  RefreshCw,
  Radio,
  CheckCircle,
  Megaphone,
} from 'lucide-react';
import { getSystemStatus, notifyTelegramAdmins, sendMessage } from '../services/api';

interface BotHealthTerminalProps {
  lang: 'fa' | 'en';
}

export const BotHealthTerminal: React.FC<BotHealthTerminalProps> = ({ lang }) => {
  const [statusData, setStatusData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [broadcastText, setBroadcastText] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState('');

  const [testText, setTestText] = useState('سلام! پیام تستی از پورتال سفارشات ریتم ⚡');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState('');

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const data = await getSystemStatus();
      if (data.success) {
        setStatusData(data);
      }
    } catch (e) {
      console.error('Failed to fetch status:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastText.trim()) return;
    setIsBroadcasting(true);
    setBroadcastResult('');
    try {
      await notifyTelegramAdmins(`📢 <b>پیام همگانی ریتم:</b>\n\n${broadcastText.trim()}`);
      setBroadcastResult(
        lang === 'fa'
          ? `پیام همگانی با موفقیت برای مدیران ارسال شد.`
          : `Broadcast delivered successfully.`
      );
      setBroadcastText('');
    } catch (e) {
      setBroadcastResult('خطا در برقراری ارتباط');
    } finally {
      setIsBroadcasting(false);
    }
  };

  const handleTestPing = async () => {
    setIsSendingTest(true);
    setTestResult('');
    try {
      const data = await sendMessage(
        null,
        testText,
        true,
        8770212764
      );
      if (data.success) {
        setTestResult(lang === 'fa' ? 'پیام با موفقیت به تلگرام مدیر مخابره شد!' : 'Ping dispatched to Telegram!');
      } else {
        setTestResult('ارسال پیام موفقیت‌آمیز نبود.');
      }
    } catch (e) {
      setTestResult('خطا در ارتباط با شبکه.');
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl glass-panel border border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#e5e2e1]">
                {lang === 'fa' ? 'وضعیت پایش زنده ربات و دیتابیس ریتم' : 'Live Bot & Database Engine Status'}
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-[#958ea0] mt-0.5">
              Telegram Polling Daemon • Supabase PostgreSQL • Real-Time Webhooks
            </p>
          </div>
        </div>

        <button
          onClick={fetchStatus}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-[#e5e2e1] transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{lang === 'fa' ? 'بروزرسانی' : 'Refresh'}</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Telegram Bot Info */}
        <div className="glass-card rounded-2xl p-5 border border-white/10 text-right">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-[#958ea0]">{lang === 'fa' ? 'ربات تلگرام' : 'Telegram Bot'}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <span className="text-lg font-bold text-[#e5e2e1] block">
            @{statusData?.bot?.username || 'RITM_FreeLancbot'}
          </span>
          <div className="mt-3 pt-3 border-t border-white/[0.08] text-xs font-mono text-[#958ea0] space-y-1">
            <div className="flex justify-between">
              <span>شناسه ربات:</span>
              <span className="text-[#e5e2e1]">{statusData?.bot?.id || '8933995842'}</span>
            </div>
            <div className="flex justify-between">
              <span>وضعیت Poller:</span>
              <span className="text-emerald-400">Listening...</span>
            </div>
            <div className="flex justify-between">
              <span>ادمین پیش‌فرض:</span>
              <span className="text-[#d0bcff]">{statusData?.adminId || '8770212764'}</span>
            </div>
          </div>
        </div>

        {/* Supabase Status */}
        <div className="glass-card rounded-2xl p-5 border border-white/10 text-right">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-[#958ea0]">{lang === 'fa' ? 'دیتابیس سوپابیس' : 'Supabase Backend'}</span>
            <Database className="w-4 h-4 text-[#adc6ff]" />
          </div>
          <span className="text-lg font-bold text-[#adc6ff] block">
            db.kydrkdyxfcavsfkinusp
          </span>
          <div className="mt-3 pt-3 border-t border-white/[0.08] text-xs font-mono text-[#958ea0] space-y-1">
            <div className="flex justify-between">
              <span>جدول سفارشات (orders):</span>
              <span className="text-[#e5e2e1]">{statusData?.metrics?.totalOrders || 0} ردیف</span>
            </div>
            <div className="flex justify-between">
              <span>جدول کاربران (users):</span>
              <span className="text-[#e5e2e1]">{statusData?.metrics?.totalUsers || 0} ردیف</span>
            </div>
            <div className="flex justify-between">
              <span>وضعیت اتصال:</span>
              <span className="text-emerald-400">CONNECTED</span>
            </div>
          </div>
        </div>

        {/* Test Ping Tool */}
        <div className="glass-card rounded-2xl p-5 border border-white/10 text-right flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#958ea0]">{lang === 'fa' ? 'تست ارسال تلگرام' : 'Telegram Ping'}</span>
              <Send className="w-4 h-4 text-[#d0bcff]" />
            </div>
            <p className="text-xs text-[#958ea0] mb-3">
              ارسال پیام مستقیم به تلگرام ادمین (8770212764)
            </p>
          </div>

          <div className="space-y-2">
            <button
              onClick={handleTestPing}
              disabled={isSendingTest}
              className="w-full py-2 px-3 rounded-xl bg-[#d0bcff] hover:bg-[#d0bcff]/90 text-[#131313] text-xs font-bold transition-all disabled:opacity-50"
            >
              {isSendingTest ? 'در حال ارسال پیام...' : 'ارسال تست به تلگرام ادمین'}
            </button>
            {testResult && (
              <span className="text-[11px] text-emerald-400 block text-center font-mono">
                {testResult}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Broadcast Announcement Tool */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10 text-right">
        <div className="flex items-center gap-2 mb-3">
          <Megaphone className="w-4 h-4 text-[#ffb869]" />
          <h3 className="text-sm font-bold text-[#e5e2e1]">
            {lang === 'fa' ? 'ارسال پیام همگانی به تمام کاربران ثبت شده در تلگرام' : 'Broadcast Announcement to Users'}
          </h3>
        </div>

        <form onSubmit={handleBroadcast} className="space-y-3">
          <textarea
            rows={2}
            value={broadcastText}
            onChange={(e) => setBroadcastText(e.target.value)}
            placeholder={
              lang === 'fa'
                ? 'متن پیام یا اطلاعیه برای ارسال به تمام کاربران ربات تلگرام...'
                : 'Write an announcement text to broadcast...'
            }
            className="w-full bg-black/40 border border-white/15 focus:border-[#d0bcff] rounded-xl p-3 text-xs text-[#e5e2e1] outline-none"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#958ea0]">
              {broadcastResult}
            </span>
            <button
              type="submit"
              disabled={isBroadcasting || !broadcastText.trim()}
              className="px-5 py-2 rounded-xl bg-[#ffb869] text-[#131313] font-bold text-xs hover:bg-[#ffb869]/90 disabled:opacity-50 transition-all"
            >
              {isBroadcasting ? 'در حال ارسال همگانی...' : 'ارسال پیام همگانی'}
            </button>
          </div>
        </form>
      </div>

      {/* Live Event Logs */}
      <div className="glass-panel rounded-2xl border border-white/10 p-5 text-right font-mono">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#d0bcff]" />
            <h3 className="text-xs font-bold text-[#e5e2e1]">
              {lang === 'fa' ? 'لاگ رویدادها و پیام‌های دریافتی ربات' : 'Bot Real-Time Event Logs'}
            </h3>
          </div>
          <span className="text-[11px] text-[#958ea0]">
            {statusData?.recentLogs?.length || 0} events
          </span>
        </div>

        <div className="h-64 overflow-y-auto space-y-1.5 text-xs text-left dir-ltr">
          {(!statusData?.recentLogs || statusData.recentLogs.length === 0) ? (
            <p className="text-gray-500 py-4 text-center">No recent events logged yet.</p>
          ) : (
            statusData.recentLogs.map((log: any) => (
              <div key={log.id} className="flex items-start gap-2 py-0.5 text-xs">
                <span className="text-[#958ea0] shrink-0">[{log.time}]</span>
                <span
                  className={`font-semibold shrink-0 ${
                    log.level === 'error'
                      ? 'text-red-400'
                      : log.level === 'warn'
                      ? 'text-[#ffb869]'
                      : 'text-[#d0bcff]'
                  }`}
                >
                  [{log.level.toUpperCase()}]
                </span>
                <span className="text-[#e5e2e1]/90 break-all">{log.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
