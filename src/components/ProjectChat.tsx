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
} from 'lucide-react';
import { AuthUser, Order, ProjectChatMessage, ChatConversation } from '../types';
import {
  getChatMessages,
  sendChatMessage,
  getChatConversations,
  markChatRead,
  getClientOrders,
} from '../services/api';

interface ProjectChatProps {
  lang: 'fa' | 'en';
  currentUser: AuthUser | null;
  isAdmin: boolean;
  initialOrderCode?: string | null;
  onNavigateToOrder?: () => void;
}

export const ProjectChat: React.FC<ProjectChatProps> = ({
  lang,
  currentUser,
  isAdmin,
  initialOrderCode = null,
  onNavigateToOrder,
}) => {
  // Messages state
  const [messages, setMessages] = useState<ProjectChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [loading, setLoading] = useState(true);

  // Admin conversation list state
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedOrderCode, setSelectedOrderCode] = useState<string>(initialOrderCode || 'RITM-GENERAL');

  // Client user's orders state
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [selectedClientOrder, setSelectedClientOrder] = useState<Order | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingIntervalRef = useRef<any>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
            }
          } else if (res.orders.length > 0) {
            setSelectedClientOrder(res.orders[0]);
            setSelectedOrderCode(res.orders[0].order_code);
          }
        }
      });
    }
  }, [isAdmin, currentUser, initialOrderCode]);

  // 2. Fetch conversations for admin
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

  // 3. Fetch messages for active conversation
  const fetchMessages = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await getChatMessages(selectedOrderCode, currentUser?.id);
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
    fetchMessages(false);
    if (isAdmin) {
      fetchConversations();
      markChatRead(selectedOrderCode, 'admin');
    } else {
      markChatRead(selectedOrderCode, 'client');
    }
  }, [selectedOrderCode, isAdmin]);

  // Scroll to bottom when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Polling every 4 seconds
  useEffect(() => {
    pollingIntervalRef.current = setInterval(() => {
      fetchMessages(true);
      if (isAdmin) fetchConversations();
    }, 4000);

    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    };
  }, [selectedOrderCode, isAdmin]);

  // Handle Send Message
  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputText).trim();
    if (!textToSend || isSending) return;

    setIsSending(true);
    try {
      const senderRole = isAdmin ? 'admin' : 'client';
      const clientName = isAdmin
        ? (lang === 'fa' ? 'مدیریت استودیو ریتم' : 'RITM Studio Admin')
        : (currentUser?.first_name || currentUser?.username || 'کاربر گرامی');

      const res = await sendChatMessage({
        orderCode: selectedOrderCode,
        userId: currentUser?.id || null,
        clientName,
        senderRole,
        text: textToSend,
      });

      if (res.success && res.message) {
        setMessages((prev) => [...prev, res.message]);
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

  // Quick Prompt Chips
  const quickPrompts = [
    { label: 'استعلام وضعیت پروژه', text: 'سلام، لطفاً آخرین وضعیت اجرایی و پیشرفت پروژه من را بررسی و اعلام فرمایید.' },
    { label: 'هماهنگی اصلاحات و ادیت', text: 'سلام، چند اصلاحیه در فایل یا سناریو دارم، چطور می‌توانم هماهنگ کنم؟' },
    { label: 'ارسال راش و فوتیج سنگین', text: 'سلام، راش‌ها و فوتیج‌های سنگین پروژه را به کدام آیدی تلگرام یا بله ارسال کنم؟' },
    { label: 'استعلام زمان تحویل نهایی', text: 'سلام، زمان تحویل نسخه نهایی پروژه حدوداً چه تاریخی خواهد بود؟' },
  ];

  return (
    <div className="max-w-6xl mx-auto py-4 sm:py-8 px-3 sm:px-6">
      {/* Title Header */}
      <div className="glass-panel rounded-2xl p-5 sm:p-6 border border-white/10 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#d0bcff]/20 text-[#d0bcff] flex items-center justify-center border border-[#d0bcff]/40 shadow-inner">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span>{lang === 'fa' ? 'گفتگوی آنلاین پیرامون پروژه‌ها' : 'Online Project Discussion'}</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#a3e635]/15 text-[#a3e635] border border-[#a3e635]/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#a3e635] animate-pulse" />
                  Live Online
                </span>
              </h1>
              <p className="text-xs text-[#958ea0] mt-0.5">
                {lang === 'fa'
                  ? 'ارتباط مستقیم و بی‌واسطه کارفرما با کارشناسان و تیم فنی استودیو ریتم'
                  : 'Direct online channel between client and RITM production team'}
              </p>
            </div>
          </div>
        </div>

        {/* Telegram / Bale Direct Callout */}
        <div className="flex items-center gap-2 text-xs">
          <a
            href="https://t.me/AdvRFL"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#38bdf8]/10 hover:bg-[#38bdf8]/20 text-[#38bdf8] border border-[#38bdf8]/30 transition-all font-mono"
            title="پی‌وی تلگرام مدیریت جهت ارسال راش و فوتیج‌های سنگین"
          >
            <Send className="w-3.5 h-3.5" />
            <span>تلگرام: @AdvRFL</span>
          </a>

          <a
            href="https://ble.ir/AdvRFL"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#a3e635]/10 hover:bg-[#a3e635]/20 text-[#a3e635] border border-[#a3e635]/30 transition-all font-mono"
            title="پی‌وی پیام‌رسان بله مدیریت"
          >
            <span>بله: @AdvRFL</span>
          </a>
        </div>
      </div>

      {/* Main Chat Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[680px]">
        {/* SIDEBAR: For Admin (List of Conversations) OR For Client (Order Selector) */}
        <div className="lg:col-span-4 glass-panel rounded-2xl border border-white/10 p-4 flex flex-col h-full overflow-hidden">
          {isAdmin ? (
            <>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-[#d0bcff]" />
                  <span>گفتگوهای فعال کارفرمایان</span>
                </span>
                <button
                  onClick={fetchConversations}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#958ea0] hover:text-white transition-colors"
                  title="بروزرسانی"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {conversations.length === 0 ? (
                  <div className="py-12 text-center text-xs text-[#958ea0]">
                    هنوز گفتگویی ثبت نشده است.
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <button
                      key={conv.orderCode}
                      onClick={() => setSelectedOrderCode(conv.orderCode)}
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
                        <span>{conv.orderCode}</span>
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
              {/* Client Sidebar: Project Selection & Details */}
              <div className="pb-3 mb-3 border-b border-white/10">
                <span className="text-xs font-bold text-white flex items-center gap-1.5 mb-2">
                  <Film className="w-4 h-4 text-[#d0bcff]" />
                  <span>انتخاب پروژه جهت گفتگو</span>
                </span>
                <p className="text-[11px] text-[#958ea0] leading-relaxed">
                  می‌توانید پیام خود را به یک پروژه خاص اختصاص دهید یا با بخش مشاوره عمومی صحبت کنید.
                </p>
              </div>

              {/* Selector */}
              <div className="space-y-2 mb-4">
                <button
                  onClick={() => {
                    setSelectedOrderCode('RITM-GENERAL');
                    setSelectedClientOrder(null);
                  }}
                  className={`w-full text-right p-3 rounded-xl border transition-all cursor-pointer ${
                    selectedOrderCode === 'RITM-GENERAL'
                      ? 'bg-[#d0bcff]/15 border-[#d0bcff]/40 text-white'
                      : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/5 text-[#958ea0]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">مشاوره عمومی و هماهنگی پیش از سفارش</span>
                    {selectedOrderCode === 'RITM-GENERAL' && <Check className="w-3.5 h-3.5 text-[#d0bcff]" />}
                  </div>
                  <span className="text-[10px] text-[#958ea0] block mt-0.5">پشتیبانی و پاسخگویی آنلاین ۲۴/۷</span>
                </button>

                {userOrders.map((ord) => (
                  <button
                    key={ord.id}
                    onClick={() => {
                      setSelectedOrderCode(ord.order_code);
                      setSelectedClientOrder(ord);
                    }}
                    className={`w-full text-right p-3 rounded-xl border transition-all cursor-pointer ${
                      selectedOrderCode === ord.order_code
                        ? 'bg-[#d0bcff]/15 border-[#d0bcff]/40 text-white'
                        : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/5 text-[#958ea0]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-mono text-[#d0bcff]">{ord.order_code}</span>
                      {selectedOrderCode === ord.order_code && <Check className="w-3.5 h-3.5 text-[#d0bcff]" />}
                    </div>
                    <span className="text-[11px] text-white block mt-0.5 truncate">
                      {ord.project_type === 'video' ? 'تدوین تیزر ویدیویی 🎬' : ord.project_type === 'web' ? 'طراحی وب‌سایت 💻' : 'اپلیکیشن 📱'}
                    </span>
                    <div className="flex items-center justify-between text-[10px] text-[#958ea0] mt-1 font-mono">
                      <span>بودجه: {ord.budget || 'توافقی'}</span>
                      <span>{new Date(ord.created_at).toLocaleDateString('fa-IR')}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Telegram/Bale Direct Notice Card */}
              <div className="mt-auto p-3.5 rounded-xl bg-gradient-to-br from-[#3c0091]/20 to-black/40 border border-[#d0bcff]/20 text-right space-y-1.5">
                <span className="text-xs font-bold text-[#d0bcff] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>ارسال راش و ویدیوهای حجیم:</span>
                </span>
                <p className="text-[11px] text-[#b8b3c4] leading-relaxed">
                  جهت سرعت بالا و جلوگیری از افت کیفیت، فایل‌های سنگین را به پی‌وی تلگرام یا بله (@AdvRFL) همراه با کد رهگیری ارسال فرمایید.
                </p>
              </div>
            </>
          )}
        </div>

        {/* CHAT WINDOW: Messages, Header & Input */}
        <div className="lg:col-span-8 glass-panel rounded-2xl border border-white/10 flex flex-col h-full overflow-hidden">
          {/* Active Conversation Header */}
          <div className="p-4 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#d0bcff]/20 text-[#d0bcff] flex items-center justify-center font-bold text-xs border border-[#d0bcff]/30">
                {isAdmin ? <User className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>
                    {isAdmin
                      ? `گفتگو درباره پروژه: ${selectedOrderCode}`
                      : selectedOrderCode === 'RITM-GENERAL'
                      ? 'گفتگوی مستقیم با پشتیبانی استودیو ریتم'
                      : `گفتگو درباره پروژه ${selectedOrderCode}`}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#a3e635]" />
                </h3>
                <span className="text-[11px] text-[#958ea0] block">
                  {isAdmin
                    ? 'پاسخ شما بلافاصله برای کارفرما نمایش داده خواهد شد'
                    : 'پاسخگویی آنلاین کارشناسان تدوین و طراحی استودیو ریتم'}
                </span>
              </div>
            </div>

            <button
              onClick={() => fetchMessages(false)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#958ea0] hover:text-white transition-colors"
              title="بارگذاری مجدد پیام‌ها"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Prompt Chips (For Clients) */}
          {!isAdmin && (
            <div className="p-2.5 bg-black/30 border-b border-white/5 flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-[10px] text-[#958ea0] shrink-0 font-medium">سوالات آماده:</span>
              {quickPrompts.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q.text)}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-[#d0bcff]/15 hover:text-[#d0bcff] text-[11px] text-[#e5e2e1] border border-white/10 transition-colors shrink-0 cursor-pointer"
                >
                  {q.label}
                </button>
              ))}
            </div>
          )}

          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar bg-black/20">
            {loading ? (
              <div className="h-full flex items-center justify-center text-xs text-[#958ea0]">
                <span className="w-5 h-5 border-2 border-[#d0bcff] border-t-transparent rounded-full animate-spin inline-block ml-2" />
                <span>در حال بارگذاری پیام‌ها...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#958ea0]">
                <MessageSquare className="w-10 h-10 text-white/20 mb-2" />
                <p className="text-xs">پیامی در این گفتگو ثبت نشده است. اولین پیام را ارسال کنید!</p>
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
                      <span className="text-[10.5px] font-bold text-[#b8b3c4]">
                        {isStudio ? 'استودیو ریتم' : msg.clientName}
                      </span>
                      {isStudio && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-[#d0bcff]/20 text-[#d0bcff] border border-[#d0bcff]/30">
                          تیم ریتم
                        </span>
                      )}
                      <span className="text-[9.5px] text-[#71717a] font-mono dir-ltr">
                        {new Date(msg.createdAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div
                      className={`max-w-[85%] sm:max-w-[75%] p-3.5 rounded-2xl text-xs leading-relaxed text-right relative shadow-md ${
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
            className="p-3 bg-white/[0.02] border-t border-white/10 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                lang === 'fa'
                  ? 'پیام خود را پیرامون پروژه بنویسید (Enter جهت ارسال)...'
                  : 'Type your message about the project...'
              }
              className="flex-1 bg-black/40 border border-white/10 focus:border-[#d0bcff] rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#71717a] focus:outline-none transition-colors"
            />

            <button
              type="submit"
              disabled={isSending || !inputText.trim()}
              className="px-4 py-2.5 rounded-xl bg-[#d0bcff] hover:bg-[#d0bcff]/90 text-[#131313] font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md cursor-pointer"
            >
              {isSending ? (
                <span className="w-3.5 h-3.5 border-2 border-[#131313] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{lang === 'fa' ? 'ارسال' : 'Send'}</span>
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
