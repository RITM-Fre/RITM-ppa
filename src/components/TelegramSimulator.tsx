import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Bot,
  User,
  Check,
  CheckCheck,
  Smartphone,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  time: string;
  replyMarkup?: any;
}

interface TelegramSimulatorProps {
  lang: 'fa' | 'en';
}

export const TelegramSimulator: React.FC<TelegramSimulatorProps> = ({ lang }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Send initial /start if chat is empty
  useEffect(() => {
    if (messages.length === 0) {
      handleSend('/start');
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string, callbackData?: string) => {
    const text = textToSend !== undefined ? textToSend : inputText;
    if (!text.trim() && !callbackData) return;

    const time = new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });

    // Add user message to UI
    if (text) {
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: 'user',
          text,
          time,
        },
      ]);
      setInputText('');
    } else if (callbackData) {
      // Find button label for user feedback
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: 'user',
          text: `[دکمه انتخاب شد: ${callbackData}]`,
          time,
        },
      ]);
    }

    setLoading(true);

    try {
      const res = await fetch('/api/bot/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text || undefined,
          callbackData: callbackData || undefined,
          userId: 987654321,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.responses)) {
          for (const resp of data.responses) {
            const respTime = new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
            setMessages((prev) => [
              ...prev,
              {
                id: Math.random().toString(),
                sender: 'bot',
                text: resp.text,
                time: respTime,
                replyMarkup: resp.replyMarkup,
              },
            ]);
          }
          return;
        }
      }
      throw new Error('Fallback to local bot simulation');
    } catch (e) {
      // Offline/Static GitHub Pages Bot Simulation
      const respTime = new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
      let botResp = {
        text: 'درود به استودیو ریتم خوش آمدید! ⚡\nچطور می‌توانیم در پروژه خلاقانه شما همراهتان باشیم؟',
        replyMarkup: {
          inline_keyboard: [
            [{ text: '✨ ثبت سفارش پروژه جدید', callback_data: 'order_start' }],
            [{ text: '🎨 مشاهده نمونه‌کارها', callback_data: 'view_portfolio' }],
            [{ text: '📞 ارتباط مستقیم با مدیریت', callback_data: 'contact_admin' }],
          ],
        },
      };

      if (callbackData === 'order_start' || text?.includes('سفارش')) {
        botResp = {
          text: '📌 لطفا حوزه پروژه خود را انتخاب کنید:\n\n۱. تدوین ویدیو و تیزر\n۲. طراحی و توسعه وبسایت\n۳. ساخت اپلیکیشن موبایل\n۴. هوش مصنوعی و طراحی بصری',
          replyMarkup: {
            inline_keyboard: [
              [{ text: '🎬 تدوین ویدیو', callback_data: 'cat_video' }, { text: '💻 توسعه وب', callback_data: 'cat_web' }],
              [{ text: '📱 اپلیکیشن موبایل', callback_data: 'cat_app' }, { text: '✨ هوش مصنوعی', callback_data: 'cat_ai' }],
              [{ text: '🔙 بازگشت به منو اصلی', callback_data: 'menu_main' }],
            ],
          },
        };
      } else if (callbackData === 'view_portfolio' || text?.includes('نمونه')) {
        botResp = {
          text: '🌟 نمونه کارهای شاخص استودیو ریتم:\n\n• تدوین تیزر بین‌المللی با اصلاح رنگ سینمایی\n• پلتفرم تحت وب سازمانی با سرعت نور\n• بات‌های هوشمند اتوماسیون تلگرام و پایگاه داده سوپابیس\n\nجهت مشاهده جزئیات کامل، تب «نمونه‌کارها» را در سایت بررسی فرمایید.',
          replyMarkup: {
            inline_keyboard: [
              [{ text: '✨ ثبت سفارش فوری', callback_data: 'order_start' }],
              [{ text: '🔙 بازگشت', callback_data: 'menu_main' }],
            ],
          },
        };
      } else if (callbackData === 'contact_admin' || text?.includes('ارتباط') || text?.includes('تماس')) {
        botResp = {
          text: '👨‍💻 پشتیبانی و مدیریت مستقیم ریتم:\n\nتلگرام: @AdvRFL\nربات اختصاصی: @RITM_FreeLancbot\n\nپیام شما به سرعت توسط مدیران بررسی خواهد شد.',
          replyMarkup: {
            inline_keyboard: [
              [{ text: '🔙 منو اصلی', callback_data: 'menu_main' }],
            ],
          },
        };
      } else if (callbackData?.startsWith('cat_')) {
        botResp = {
          text: '✅ حوزه انتخابی شما ثبت شد!\nهم‌اکنون می‌توانید از طریق تب «ثبت سفارش» در بالای سایت، فرم کامل پروژه را تکمیل فرمایید تا بلافاصله در دیتابیس آنلاین سوپابیس ثبت و پیگیری شود.',
          replyMarkup: {
            inline_keyboard: [
              [{ text: '🔙 منو اصلی', callback_data: 'menu_main' }],
            ],
          },
        };
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: 'bot',
          text: botResp.text,
          time: respTime,
          replyMarkup: botResp.replyMarkup,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([]);
    setTimeout(() => handleSend('/start'), 150);
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#d0bcff]/15 border border-[#d0bcff]/30 flex items-center justify-center text-[#d0bcff]">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#e5e2e1]">
              {lang === 'fa' ? 'شبیه‌ساز زنده ربات تلگرام ریتم' : 'Live Telegram Bot Simulator'}
            </h3>
            <p className="text-xs text-[#958ea0]">
              {lang === 'fa'
                ? 'شما می‌توانید دقیقاً همان فرآیند ثبت سفارش و مکالمه ربات @RITM_FreeLancbot را اینجا آزمایش کنید.'
                : 'Interact directly with the bot logic and test step-by-step registration flow.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-[#958ea0] hover:text-[#e5e2e1] transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{lang === 'fa' ? 'شروع مجدد' : 'Reset'}</span>
          </button>

          <a
            href="https://t.me/RITM_FreeLancbot"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#d0bcff] hover:bg-[#d0bcff]/90 text-xs font-semibold text-[#131313] transition-all"
          >
            <span>{lang === 'fa' ? 'باز کردن در تلگرام' : 'Open in Telegram'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Telegram Phone Device Mockup */}
      <div className="max-w-md mx-auto rounded-[2.5rem] p-3 bg-gradient-to-b from-[#2a2a2a] via-[#1c1c1c] to-[#141414] border-4 border-[#333] shadow-2xl">
        {/* Phone Speaker & Notch */}
        <div className="w-28 h-4 bg-[#111] rounded-full mx-auto mb-2 flex items-center justify-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#222]" />
          <div className="w-10 h-1.5 bg-[#222] rounded-full" />
        </div>

        {/* Screen */}
        <div className="rounded-[2rem] bg-[#0f0f0f] border border-white/10 overflow-hidden flex flex-col h-[620px] relative">
          {/* Telegram Header */}
          <div className="px-4 py-3 bg-[#1e1e1e] border-b border-white/10 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full overflow-hidden bg-black/50 border border-white/20 p-0.5">
                <img src={`${import.meta.env.BASE_URL}assets/logo.png`} alt="RITM" className="w-full h-full object-contain" />
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-[#e5e2e1]">RITM | استودیو ریتم</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#a3e635]" />
                </div>
                <span className="text-[10px] text-[#958ea0] block">bot • @RITM_FreeLancbot</span>
              </div>
            </div>

            <div className="text-[10px] font-mono text-[#958ea0] bg-white/5 px-2 py-0.5 rounded">
              Verified
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-right">
            {messages.map((m) => {
              const isUser = m.sender === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isUser ? 'items-start' : 'items-end'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed shadow-md transition-all ${
                      isUser
                        ? 'bg-[#3c0091] text-[#e5e2e1] rounded-bl-sm border border-[#d0bcff]/20'
                        : 'bg-[#1f1f1f] text-[#e5e2e1] rounded-br-sm border border-white/10'
                    }`}
                  >
                    {/* Message content formatted */}
                    <div
                      className="whitespace-pre-line text-[11.5px]"
                      dangerouslySetInnerHTML={{ __html: m.text }}
                    />

                    <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-[#958ea0]">
                      <span>{m.time}</span>
                      {isUser && <CheckCheck className="w-3 h-3 text-[#adc6ff]" />}
                    </div>
                  </div>

                  {/* Inline Keyboards from bot if present */}
                  {m.replyMarkup?.inline_keyboard && (
                    <div className="mt-1.5 max-w-[85%] w-full space-y-1">
                      {m.replyMarkup.inline_keyboard.map((row: any[], rIdx: number) => (
                        <div key={rIdx} className="flex gap-1 w-full">
                          {row.map((btn: any, bIdx: number) => (
                            <button
                              key={bIdx}
                              disabled={loading}
                              onClick={() => {
                                if (btn.url) {
                                  window.open(btn.url, '_blank');
                                } else if (btn.callback_data) {
                                  handleSend(undefined, btn.callback_data);
                                }
                              }}
                              className="flex-1 py-1.5 px-2 text-[10.5px] font-medium bg-[#2a2a2a] hover:bg-[#383838] active:bg-[#444] text-[#adc6ff] rounded-lg border border-white/10 transition-colors truncate"
                            >
                              {btn.text}
                            </button>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-1.5 text-xs text-[#958ea0] p-2 bg-[#1c1c1c] rounded-xl w-24">
                <span className="w-1.5 h-1.5 rounded-full bg-[#d0bcff] animate-ping" />
                <span className="text-[10px]">در حال تایپ...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Reply Bar (Bottom Tabs) */}
          <div className="px-2 py-1.5 bg-[#181818] border-t border-white/10 grid grid-cols-2 gap-1.5 text-[10.5px]">
            <button
              onClick={() => handleSend('📝 ثبت سفارش پروژه')}
              className="py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#d0bcff] font-medium border border-white/10 transition-colors truncate text-center"
            >
              📝 ثبت سفارش پروژه
            </button>
            <button
              onClick={() => handleSend('💼 نمونه کارها')}
              className="py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#e5e2e1] font-medium border border-white/10 transition-colors truncate text-center"
            >
              💼 نمونه کارها
            </button>
            <button
              onClick={() => handleSend('⚡ خدمات و تعرفه‌ها')}
              className="py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#e5e2e1] font-medium border border-white/10 transition-colors truncate text-center"
            >
              ⚡ خدمات و تعرفه‌ها
            </button>
            <button
              onClick={() => handleSend('📋 پیگیری سفارش‌های من')}
              className="py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#e5e2e1] font-medium border border-white/10 transition-colors truncate text-center"
            >
              📋 سفارش‌های من
            </button>
          </div>

          {/* Input Area */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-2.5 bg-[#1e1e1e] border-t border-white/10 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="پیام یا دستور (مثلاً /order)..."
              className="flex-1 bg-black/40 border border-white/15 focus:border-[#d0bcff] rounded-xl px-3 py-2 text-xs text-[#e5e2e1] outline-none placeholder-white/30 text-right"
            />
            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="w-8 h-8 rounded-xl bg-[#d0bcff] hover:bg-[#d0bcff]/90 disabled:opacity-40 text-[#131313] flex items-center justify-center transition-all shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
