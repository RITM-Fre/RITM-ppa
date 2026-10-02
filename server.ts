import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '3000', 10);
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://kydrkdyxfcavsfkinusp.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5ZHJrZHl4ZmNhdnNma2ludXNwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDU5Nzk1OCwiZXhwIjoyMTA2MTczOTU4fQ.EJLK_9jKeX9sXogTgZSJbZn6yfoxRTUkKLidlo5QFYY';
const ADMIN_TELEGRAM_ID = process.env.ADMIN_TELEGRAM_ID ? parseInt(process.env.ADMIN_TELEGRAM_ID, 10) : 8770212764;
const rawAppUrl = (process.env.APP_URL || '').trim();
const APP_URL = rawAppUrl.startsWith('https://') ? rawAppUrl : '';
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

// Mailer Setup for Email OTP
let mailTransporter: any = null;
if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  try {
    mailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } catch (e) {
    console.warn('Failed to initialize nodemailer transporter:', e);
  }
}

// Initialize Supabase Client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const app = express();
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// 1 GB Local Storage Setup
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
const PUBLIC_UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(PUBLIC_UPLOADS_DIR)) {
  fs.mkdirSync(PUBLIC_UPLOADS_DIR, { recursive: true });
}
app.use('/uploads', express.static(UPLOADS_DIR));
app.use('/uploads', express.static(PUBLIC_UPLOADS_DIR));

// Nem Portfolio Static Serving
const NEM_DIR = path.join(__dirname, 'nem');
const PUBLIC_NEM_DIR = path.join(__dirname, 'public', 'nem');
const ASSETS_NEM_DIR = path.join(__dirname, 'public', 'assets', 'nem');
app.use('/nem', express.static(NEM_DIR));
app.use('/nem', express.static(PUBLIC_NEM_DIR));
app.use('/assets/nem', express.static(NEM_DIR));
app.use('/assets/nem', express.static(PUBLIC_NEM_DIR));
app.use('/assets/nem', express.static(ASSETS_NEM_DIR));

// Online Project Chat Setup & Persistence
const CHAT_FILE = path.join(__dirname, 'chat_messages.json');

export interface ChatMessageRecord {
  id: string;
  orderCode?: string;
  userId?: number | null;
  clientName: string;
  senderRole: 'client' | 'admin';
  text: string;
  createdAt: string;
  read: boolean;
}

function loadChatMessages(): ChatMessageRecord[] {
  try {
    if (fs.existsSync(CHAT_FILE)) {
      return JSON.parse(fs.readFileSync(CHAT_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Error loading chat messages:', e);
  }
  const defaultMessages: ChatMessageRecord[] = [
    {
      id: 'chat-welcome-1',
      orderCode: 'RITM-GENERAL',
      clientName: 'استودیو ریتم',
      senderRole: 'admin',
      text: 'سلام و احترام! به سامانه گفتگوی اختصاصی استودیو ریتم خوش آمدید. تمامی سوالات، هماهنگی‌های فنی، اصلاحات و مراحل اجرای پروژه شما در این بخش به صورت زنده پاسخ داده می‌شود.',
      createdAt: new Date().toISOString(),
      read: true,
    },
  ];
  saveChatMessages(defaultMessages);
  return defaultMessages;
}

function saveChatMessages(messages: ChatMessageRecord[]) {
  try {
    fs.writeFileSync(CHAT_FILE, JSON.stringify(messages, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving chat messages:', e);
  }
}

// 1 GB Total Storage Limit (in bytes)
const MAX_STORAGE_BYTES = 1024 * 1024 * 1024; // 1,073,741,824 bytes = 1 GB
const META_FILE = path.join(__dirname, 'uploads_meta.json');

export interface StoredFileRecord {
  id: string;
  orderCode: string;
  clientName: string;
  contact: string;
  fileName: string;
  storedFileName: string;
  fileType: string;
  sizeBytes: number;
  uploadDate: string;
  caption?: string;
  url: string;
}

function loadStorageMeta(): StoredFileRecord[] {
  try {
    if (fs.existsSync(META_FILE)) {
      const content = fs.readFileSync(META_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (e) {
    console.error('Error loading storage meta:', e);
  }
  return [];
}

function saveStorageMeta(records: StoredFileRecord[]) {
  try {
    fs.writeFileSync(META_FILE, JSON.stringify(records, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving storage meta:', e);
  }
}

// In-memory conversation state for Telegram bot users
interface UserSession {
  step: 'idle' | 'category' | 'name' | 'contact' | 'budget' | 'deadline' | 'description' | 'confirm';
  data: {
    project_type?: 'video' | 'web' | 'mobile' | 'other';
    full_name?: string;
    contact?: string;
    contact_type?: string;
    budget?: string;
    deadline?: string;
    description?: string;
  };
  language: 'fa' | 'en';
}

const userSessions = new Map<number, UserSession>();
const recentBotLogs: Array<{ id: string; time: string; level: 'info' | 'warn' | 'error'; message: string }> = [];

function logBot(message: string, level: 'info' | 'warn' | 'error' = 'info') {
  const time = new Date().toLocaleTimeString('fa-IR');
  recentBotLogs.unshift({ id: Math.random().toString(36).substring(2, 9), time, level, message });
  if (recentBotLogs.length > 80) recentBotLogs.pop();
  console.log(`[Bot ${level.toUpperCase()}] ${message}`);
}

// Telegram API Helper
async function callTelegram(method: string, payload: Record<string, any>) {
  try {
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (error) {
    console.error(`Telegram call failed for ${method}:`, error);
    return { ok: false, error: String(error) };
  }
}

// Helper to upsert user into Supabase
async function syncUserToDb(tgUser: { id: number; username?: string; first_name?: string; last_name?: string }) {
  try {
    const { data: existing } = await supabase
      .from('users')
      .select('id, is_admin')
      .eq('telegram_id', tgUser.id)
      .maybeSingle();

    const isAdmin = tgUser.id === ADMIN_TELEGRAM_ID || existing?.is_admin || false;

    if (existing) {
      await supabase
        .from('users')
        .update({
          username: tgUser.username || null,
          first_name: tgUser.first_name || null,
          last_name: tgUser.last_name || null,
          last_seen: new Date().toISOString(),
          is_admin: isAdmin,
        })
        .eq('telegram_id', tgUser.id);
      return existing.id;
    } else {
      const { data: inserted } = await supabase
        .from('users')
        .insert({
          telegram_id: tgUser.id,
          username: tgUser.username || null,
          first_name: tgUser.first_name || null,
          last_name: tgUser.last_name || null,
          language: 'fa',
          is_admin: isAdmin,
          is_blocked: false,
          created_at: new Date().toISOString(),
          last_seen: new Date().toISOString(),
        })
        .select('id')
        .single();
      return inserted?.id || null;
    }
  } catch (err) {
    console.error('Error syncing user to Supabase:', err);
    return null;
  }
}

// Keyboard Generators
function getMainReplyKeyboard(webAppUrl?: string, isAdmin: boolean = false) {
  const keyboard: Array<Array<{ text: string; web_app?: { url: string } }>> = [
    [{ text: '📝 ثبت سفارش پروژه' }, { text: '💼 نمونه کارها' }],
    [{ text: '⚡ خدمات و تعرفه‌ها' }, { text: '📋 پیگیری سفارش‌های من' }],
    [{ text: '📞 تماس و مشاوره' }, { text: 'ℹ️ درباره ریتم' }]
  ];
  if (webAppUrl) {
    keyboard.unshift([{ text: '🚀 باز کردن وب‌اپلیکیشن ریتم', web_app: { url: webAppUrl } }]);
  }
  if (isAdmin) {
    if (webAppUrl) {
      keyboard.push([
        { text: '👑 ورود به پنل مدیریت ریتم', web_app: { url: `${webAppUrl}/?tab=admin` } }
      ]);
    } else {
      keyboard.push([{ text: '👑 ورود به پنل مدیریت ریتم' }]);
    }
  }
  return {
    keyboard,
    resize_keyboard: true,
    is_persistent: true,
  };
}

function getCategoryKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: '🎬 تدوین ویدیو و پست‌پروداکشن', callback_data: 'cat_video' },
      ],
      [
        { text: '💻 توسعه و طراحی وب‌سایت', callback_data: 'cat_web' },
      ],
      [
        { text: '📱 اپلیکیشن موبایل', callback_data: 'cat_mobile' },
      ],
      [
        { text: '🎨 هوش مصنوعی و سایر خدمات', callback_data: 'cat_other' },
      ],
      [
        { text: '❌ انصراف', callback_data: 'cancel_order' },
      ]
    ]
  };
}

function getBudgetKeyboard() {
  return {
    inline_keyboard: [
      [{ text: '🟢 کمتر از ۱۰ میلیون تومان', callback_data: 'budget_under_10' }],
      [{ text: '🟡 ۱۰ تا ۵۰ میلیون تومان', callback_data: 'budget_10_50' }],
      [{ text: '🟣 بیش از ۵۰ میلیون تومان', callback_data: 'budget_over_50' }],
      [{ text: '⚪ توافقی / نیاز به مشاوره', callback_data: 'budget_custom' }],
      [{ text: '❌ انصراف', callback_data: 'cancel_order' }]
    ]
  };
}

function getDeadlineKeyboard() {
  return {
    inline_keyboard: [
      [{ text: '⚡ فوری (کمتر از ۱ هفته)', callback_data: 'dl_urgent' }],
      [{ text: '📅 ۱ تا ۲ هفته', callback_data: 'dl_1_2w' }],
      [{ text: '🗓️ ۲ تا ۴ هفته', callback_data: 'dl_2_4w' }],
      [{ text: '⏳ زمان آزاد / توافقی', callback_data: 'dl_flexible' }],
      [{ text: '❌ انصراف', callback_data: 'cancel_order' }]
    ]
  };
}

function getConfirmKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: '✅ تایید نهایی و ارسال سفارش', callback_data: 'confirm_yes' }
      ],
      [
        { text: '✏️ ویرایش مجدد اطلاعات', callback_data: 'confirm_edit' },
        { text: '❌ انصراف و لغو', callback_data: 'cancel_order' }
      ]
    ]
  };
}

// Bot Message Handler (Used both for live Telegram poller and for UI simulator)
export async function handleBotIncoming({
  chatId,
  userId,
  text,
  username,
  firstName,
  lastName,
  callbackData,
  isSimulation = false,
  photo,
  video,
  document,
  voice,
  caption,
}: {
  chatId: number;
  userId: number;
  text?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  callbackData?: string;
  isSimulation?: boolean;
  photo?: any[];
  video?: any;
  document?: any;
  voice?: any;
  caption?: string;
}) {
  let session = userSessions.get(userId);
  if (!session) {
    session = { step: 'idle', data: {}, language: 'fa' };
    userSessions.set(userId, session);
  }

  if (!isSimulation) {
    await syncUserToDb({ id: userId, username, first_name: firstName, last_name: lastName });
  }

  const cleanText = (text || '').trim();

  // Helper response collector for simulator
  const responses: Array<{ text: string; replyMarkup?: any }> = [];
  async function reply(msg: string, replyMarkup?: any) {
    responses.push({ text: msg, replyMarkup });
    if (!isSimulation) {
      await callTelegram('sendMessage', {
        chat_id: chatId,
        text: msg,
        parse_mode: 'HTML',
        reply_markup: replyMarkup,
      });
    }
  }

  // Handle incoming media (Photo, Video, Document, Voice) from Telegram users!
  if (photo || video || document || voice) {
    const userLabel = `${firstName || ''} ${lastName || ''}`.trim() || 'کاربر گرامی';
    const contactInfo = username ? `@${username}` : `شناسه عددی: ${userId}`;

    if (!isSimulation) {
      try {
        if (photo && Array.isArray(photo) && photo.length > 0) {
          const fileId = photo[photo.length - 1].file_id;
          await callTelegram('sendPhoto', {
            chat_id: ADMIN_TELEGRAM_ID,
            photo: fileId,
            caption: `📸 <b>تصویر جدید از تلگرام!</b>\n\n👤 <b>فرستنده:</b> ${userLabel} (${contactInfo})\n🆔 <b>آیدی:</b> <code>${userId}</code>\n${caption ? `📝 <b>توضیحات:</b> ${caption}` : ''}`,
            parse_mode: 'HTML',
          });
        } else if (video) {
          await callTelegram('sendVideo', {
            chat_id: ADMIN_TELEGRAM_ID,
            video: video.file_id,
            caption: `🎬 <b>ویدیو جدید از تلگرام!</b>\n\n👤 <b>فرستنده:</b> ${userLabel} (${contactInfo})\n🆔 <b>آیدی:</b> <code>${userId}</code>\n${caption ? `📝 <b>توضیحات:</b> ${caption}` : ''}`,
            parse_mode: 'HTML',
          });
        } else if (document) {
          await callTelegram('sendDocument', {
            chat_id: ADMIN_TELEGRAM_ID,
            document: document.file_id,
            caption: `📁 <b>سند/فایل جدید از تلگرام!</b>\n\n👤 <b>فرستنده:</b> ${userLabel} (${contactInfo})\n📄 <b>نام فایل:</b> ${document.file_name || 'فایل'}\n🆔 <b>آیدی:</b> <code>${userId}</code>\n${caption ? `📝 <b>توضیحات:</b> ${caption}` : ''}`,
            parse_mode: 'HTML',
          });
        } else if (voice) {
          await callTelegram('sendVoice', {
            chat_id: ADMIN_TELEGRAM_ID,
            voice: voice.file_id,
            caption: `🎙 <b>ویس جدید از تلگرام!</b>\n👤 ${userLabel} (${contactInfo}) | <code>${userId}</code>`,
            parse_mode: 'HTML',
          });
        }
      } catch (mediaErr) {
        console.error('Error forwarding user media to admin:', mediaErr);
      }
    }

    if (session.step === 'description') {
      session.data.description = (session.data.description ? session.data.description + ' + [فایل ضمیمه دریافت شد]' : '[فایل ضمیمه دریافت شد]') + (caption ? `: ${caption}` : '');
    }

    await reply(
      `✅ <b>فایل شما با موفقیت دریافت شد!</b>\n\n` +
      `این فایل مستقیماً به تیم مدیریت و تدوین ریتم تحویل داده شد. چنانچه نیاز به ثبت سفارش یا ارسال توضیحات دیگر دارید، از گزینه‌های زیر استفاده فرمایید.`,
      getMainReplyKeyboard(APP_URL, userId === ADMIN_TELEGRAM_ID || username === 'AdvRFL')
    );
    return responses;
  }

  // Handle Cancel Callback
  if (callbackData === 'cancel_order') {
    session.step = 'idle';
    session.data = {};
    await reply(
      '❌ ثبت سفارش لغو شد.\nهر زمان مایل بودید می‌توانید از طریق منوی اصلی دوباره سفارش خود را ثبت فرمایید.',
      getMainReplyKeyboard(APP_URL)
    );
    return responses;
  }

  // Handle Admin Callbacks
  if (callbackData === 'admin_view_new') {
    const isAdm = userId === ADMIN_TELEGRAM_ID || username === 'AdvRFL';
    if (!isAdm) {
      await reply('⛔ دسترسی غیرمجاز.');
      return responses;
    }

    try {
      const { data: newOrders } = await supabase
        .from('orders')
        .select('*')
        .eq('status', 'new')
        .order('created_at', { ascending: false })
        .limit(5);

      if (!newOrders || newOrders.length === 0) {
        await reply('✅ در حال حاضر هیچ سفارش جدید در انتظاری وجود ندارد.');
      } else {
        let msg = `📋 <b>آخرین سفارشات جدید (${newOrders.length}):</b>\n\n`;
        const buttons: any[] = [];

        newOrders.forEach((o, i) => {
          msg += `<b>${i + 1}. ${o.order_code}</b> | ${o.full_name}\n`;
          msg += `📁 نوع: ${o.project_type} | 💰 بودجه: ${o.budget}\n`;
          msg += `📞 تماس: ${o.contact}\n`;
          msg += `📝 توضیح: ${o.description.substring(0, 60)}...\n──────────────\n`;

          buttons.push([
            { text: `✅ تایید ${o.order_code}`, callback_data: `approve_${o.id}` },
            { text: `❌ رد ${o.order_code}`, callback_data: `reject_${o.id}` }
          ]);
        });

        await reply(msg, { inline_keyboard: buttons });
      }
    } catch (e) {
      await reply('خطا در دریافت سفارشات جدید.');
    }
    return responses;
  }

  if (callbackData && callbackData.startsWith('approve_')) {
    const orderId = parseInt(callbackData.replace('approve_', ''), 10);
    try {
      const { data: updated } = await supabase
        .from('orders')
        .update({ status: 'approved', updated_at: new Date().toISOString() })
        .eq('id', orderId)
        .select('*')
        .single();

      if (updated) {
        await reply(`✅ سفارش <b>${updated.order_code}</b> (${updated.full_name}) تایید شد.`);
        if (updated.telegram_id && updated.telegram_id > 0) {
          await callTelegram('sendMessage', {
            chat_id: updated.telegram_id,
            text: `🎉 سفارش شما با کد <b>${updated.order_code}</b> توسط مدیریت تایید شد! جهت هماهنگی مراحل اجرا با شما تماس گرفته خواهد شد.`,
            parse_mode: 'HTML',
          });
        }
      }
    } catch (e) {
      await reply('خطا در تایید سفارش.');
    }
    return responses;
  }

  if (callbackData && callbackData.startsWith('reject_')) {
    const orderId = parseInt(callbackData.replace('reject_', ''), 10);
    try {
      const { data: updated } = await supabase
        .from('orders')
        .update({ status: 'rejected', updated_at: new Date().toISOString() })
        .eq('id', orderId)
        .select('*')
        .single();

      if (updated) {
        await reply(`❌ سفارش <b>${updated.order_code}</b> رد شد.`);
      }
    } catch (e) {
      await reply('خطا در رد سفارش.');
    }
    return responses;
  }

  // Handle Category Selection Callback
  if (callbackData && callbackData.startsWith('cat_')) {
    const catMap: Record<string, 'video' | 'web' | 'mobile' | 'other'> = {
      cat_video: 'video',
      cat_web: 'web',
      cat_mobile: 'mobile',
      cat_other: 'other',
    };
    session.data.project_type = catMap[callbackData] || 'video';
    session.step = 'name';

    const catLabels = {
      video: 'تدوین ویدیو و پست‌پروداکشن 🎬',
      web: 'توسعه و طراحی وب‌سایت 💻',
      mobile: 'اپلیکیشن موبایل 📱',
      other: 'هوش مصنوعی و سایر خدمات 🎨',
    };

    await reply(
      `✅ دسته‌بندی انتخاب شد: <b>${catLabels[session.data.project_type]}</b>\n\n` +
      `👤 لطفاً <b>نام و نام‌خانوادگی</b> یا <b>نام برند/کسب‌و‌کار</b> خود را وارد فرمایید:`
    );
    return responses;
  }

  // Handle Budget Selection Callback
  if (callbackData && callbackData.startsWith('budget_')) {
    const budgetMap: Record<string, string> = {
      budget_under_10: 'کمتر از ۱۰ میلیون تومان',
      budget_10_50: '۱۰ تا ۵۰ میلیون تومان',
      budget_over_50: 'بیش از ۵۰ میلیون تومان',
      budget_custom: 'توافقی / نیاز به مشاوره',
    };
    session.data.budget = budgetMap[callbackData] || 'توافقی';
    session.step = 'deadline';
    await reply(
      `💰 بودجه تقریبی: <b>${session.data.budget}</b>\n\n` +
      `⏱️ <b>بازه زمانی مدنظر (مهلت تحویل)</b> پروژه را انتخاب کنید:`,
      getDeadlineKeyboard()
    );
    return responses;
  }

  // Handle Deadline Selection Callback
  if (callbackData && callbackData.startsWith('dl_')) {
    const dlMap: Record<string, string> = {
      dl_urgent: 'فوری (کمتر از ۱ هفته)',
      dl_1_2w: '۱ تا ۲ هفته',
      dl_2_4w: '۲ تا ۴ هفته',
      dl_flexible: 'زمان آزاد / توافقی',
    };
    session.data.deadline = dlMap[callbackData] || 'توافقی';
    session.step = 'description';
    await reply(
      `📅 مهلت تحویل: <b>${session.data.deadline}</b>\n\n` +
      `✍️ لطفاً <b>توضیحات و نیازمندی‌های پروژه</b> خود را به صورت کامل ارسال کنید (شامل سناریو، ویژگی‌ها، سبک دلخواه، یا نمونه‌های مشابه):`
    );
    return responses;
  }

  // Handle Confirm Callback
  if (callbackData === 'confirm_yes') {
    if (!session.data.project_type || !session.data.full_name) {
      await reply('⚠️ اطلاعات سفارش ناقص است. لطفاً فرآیند ثبت سفارش را مجدداً شروع کنید.', getMainReplyKeyboard(APP_URL));
      session.step = 'idle';
      return responses;
    }

    // Generate unique order code: RITM-XXXX
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const orderCode = `RITM-${randomCode}`;

    const catLabels = {
      video: 'تدوین ویدیو',
      web: 'توسعه وب',
      mobile: 'اپلیکیشن موبایل',
      other: 'سایر موارد',
    };

    let orderId: number | null = null;

    if (!isSimulation) {
      try {
        const rawContact = session.data.contact || (username ? `@${username}` : String(userId));
        const isEmail = rawContact.includes('@') && rawContact.includes('.');
        const validContactType: 'email' | 'phone' = isEmail ? 'email' : 'phone';

        // Get user_id from users table
        let dbUserId: number | null = null;
        const { data: u } = await supabase.from('users').select('id').eq('telegram_id', userId).maybeSingle();
        if (u) dbUserId = u.id;

        const { data: insertedOrder, error } = await supabase
          .from('orders')
          .insert({
            order_code: orderCode,
            user_id: dbUserId,
            telegram_id: userId,
            username: username || null,
            full_name: session.data.full_name,
            contact: rawContact,
            contact_type: validContactType,
            preferred_contact: 'telegram',
            project_type: session.data.project_type,
            budget: session.data.budget || 'توافقی',
            deadline: session.data.deadline || 'توافقی',
            description: session.data.description || 'توضیحات تکمیلی ارائه نشده',
            status: 'new',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select('id')
          .single();

        if (error) {
          console.error('Supabase order insert error:', error);
        } else {
          orderId = insertedOrder?.id || null;
        }

        // Notify Admin on Telegram immediately!
        const adminMsg =
          `🔔 <b>سفارش جدید در ریتم ثبت شد!</b>\n\n` +
          `🔖 <b>کد رهگیری:</b> <code>${orderCode}</code>\n` +
          `👤 <b>مشتری:</b> ${session.data.full_name} (${username ? '@' + username : userId})\n` +
          `📁 <b>نوع پروژه:</b> ${catLabels[session.data.project_type]}\n` +
          `💰 <b>بودجه:</b> ${session.data.budget}\n` +
          `⏱️ <b>مهلت:</b> ${session.data.deadline}\n` +
          `📞 <b>ارتباط:</b> ${session.data.contact}\n` +
          `📝 <b>توضیحات:</b>\n${session.data.description}\n\n` +
          `🌐 مشاهده در پنل مدیریت ریتم`;

        await callTelegram('sendMessage', {
          chat_id: ADMIN_TELEGRAM_ID,
          text: adminMsg,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [
                { text: `💬 ارتباط با کاربر`, url: username ? `https://t.me/${username}` : `tg://user?id=${userId}` }
              ]
            ]
          }
        });
        logBot(`Order ${orderCode} created by user ${userId} and sent to admin.`);
      } catch (e) {
        console.error('Failed to notify admin or insert order:', e);
      }
    }

    // Success response to user
    await reply(
      `🎉 <b>سفارش شما با موفقیت ثبت شد!</b>\n\n` +
      `🔖 <b>کد پیگیری سفارش شما:</b> <code>${orderCode}</code>\n\n` +
      `▫️ <b>نوع پروژه:</b> ${catLabels[session.data.project_type]}\n` +
      `▫️ <b>بودجه:</b> ${session.data.budget}\n` +
      `▫️ <b>مهلت تحویل:</b> ${session.data.deadline}\n\n` +
      `تیم ریتم اطلاعات شما را بررسی کرده و ظرف کمتر از ۲۴ ساعت از طریق همین ربات یا اطلاعات تماسی که ارسال فرمودید با شما تماس خواهد گرفت.\n\n` +
      `با تشکر از اعتماد شما به <b>ریتم</b> ✨`,
      getMainReplyKeyboard(APP_URL)
    );

    session.step = 'idle';
    session.data = {};
    return responses;
  }

  if (callbackData === 'confirm_edit') {
    session.step = 'category';
    await reply('🔄 جهت ویرایش، مجدداً دسته‌بندی پروژه را انتخاب فرمایید:', getCategoryKeyboard());
    return responses;
  }

  // Global Command / Button Matching
  const isUserAdmin = userId === ADMIN_TELEGRAM_ID || username === 'AdvRFL';

  if (cleanText === '/start' || cleanText === 'شروع مجدد') {
    session.step = 'idle';
    session.data = {};
    const welcome =
      `درود بر شما ${firstName || 'دوست گرامی'} به <b>ریتم (RITM)</b> خوش آمدید! ⚡\n\n` +
      `ما پل ارتباطی بین هنر دیجیتال و مهندسی نرم‌افزار هستیم.\n` +
      `خدمات ما شامل:\n` +
      `• 🎬 <b>تدوین ویدیو و پست‌پروداکشن</b> (پریمیر پرو، اصلاح رنگ سینمایی)\n` +
      `• 💻 <b>طراحی و توسعه وب‌سایت‌های پیشرفته</b> (سریع، واکنش‌گرا و سئو شده)\n` +
      `• 📱 <b>ساخت اپلیکیشن‌های موبایل</b> (مبتنی بر تجربه کاربری بهینه)\n\n` +
      `از دکمه‌های زیر برای ثبت سفارش یا مشاهده نمونه کارها استفاده نمایید 👇`;

    await reply(welcome, getMainReplyKeyboard(APP_URL, isUserAdmin));
    return responses;
  }

  if (cleanText === '/admin' || cleanText === '👑 ورود به پنل مدیریت ریتم') {
    if (!isUserAdmin) {
      await reply('⛔ شما دسترسی مدیر به پنل ریتم را ندارید.', getMainReplyKeyboard(APP_URL, false));
      return responses;
    }

    let totalOrd = 0;
    let newOrd = 0;
    let totalUsr = 0;
    try {
      const { count: c1 } = await supabase.from('orders').select('*', { count: 'exact', head: true });
      const { count: c2 } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'new');
      const { count: c3 } = await supabase.from('users').select('*', { count: 'exact', head: true });
      totalOrd = c1 || 0;
      newOrd = c2 || 0;
      totalUsr = c3 || 0;
    } catch (e) {}

    const adminWebUrl = `${APP_URL}/?tab=admin`;

    const adminMsg =
      `👑 <b>پنل اختصاصی مدیریت استودیو ریتم</b>\n\n` +
      `درود مدیر گرامی! وضعیت کنونی سیستم:\n` +
      `📦 <b>کل سفارشات:</b> ${totalOrd}\n` +
      `🟡 <b>سفارشات جدید در انتظار:</b> ${newOrd}\n` +
      `👥 <b>کاربران تلگرام:</b> ${totalUsr}\n\n` +
      `🌐 <b>آدرس وب‌پنل مدیریت:</b>\n` +
      `${adminWebUrl}\n\n` +
      `برای ورود مستقیم به پنل از دکمه زیر استفاده کنید 👇`;

    const inline_keyboard: any[] = [];
    if (APP_URL) {
      inline_keyboard.push([
        { text: '🚀 باز کردن پنل مدیریت داخل تلگرام', web_app: { url: adminWebUrl } }
      ]);
      inline_keyboard.push([
        { text: '🌐 باز کردن در مرورگر اینترنت', url: adminWebUrl }
      ]);
    }
    inline_keyboard.push([
      { text: '📋 مشاهده سفارشات جدید', callback_data: 'admin_view_new' }
    ]);

    await reply(adminMsg, { inline_keyboard });
    return responses;
  }

  if (cleanText === '📝 ثبت سفارش پروژه' || cleanText === '/order') {
    session.step = 'category';
    session.data = {};
    await reply(
      `🎯 <b>مرحله ۱ از ۵ — انتخاب نوع پروژه</b>\n\n` +
      `لطفاً زمینه و دسته‌بندی پروژه‌ای که قصد سفارش آن را دارید انتخاب کنید:`,
      getCategoryKeyboard()
    );
    return responses;
  }

  if (cleanText === '💼 نمونه کارها' || cleanText === '/portfolio') {
    await reply(
      `🌟 <b>برگزیده نمونه‌کارهای ریتم (RITM)</b>\n\n` +
      `۱. <b>تیزر معرفی محصول</b> (تدوین پریمیر پرو، ساند دیزاین، کالر گریدینگ)\n` +
      `۲. <b>سایت شرکتی مدرن</b> (کدنویسی اختصاصی، انیمیشن‌های روان و سئو)\n` +
      `۳. <b>اپلیکیشن مدیریت وظایف</b> (موبایل اپلیکیشن سبک و محلی)\n` +
      `۴. <b>تیزر تبلیغاتی ریتمیک</b> (افکت‌های بصری و ضرب‌آهنگ دقیق)\n` +
      `۵. <b>طراحی ویدیو با هوش مصنوعی</b> (تکنیک‌های نسل جدید ویدیوسازی)\n\n` +
      `🌐 برای مشاهده گالری کامل و ویدیوهای تعاملی، از دکمه زیر استفاده نمایید:`,
      {
        inline_keyboard: [
          [{ text: '🌐 مشاهده سایت و پورتفولیو آنلاین', url: 'https://t-emi.github.io/RITM/' }],
          [{ text: '📝 سفارش پروژه مشابه', callback_data: 'cat_video' }]
        ]
      }
    );
    return responses;
  }

  if (cleanText === '⚡ خدمات و تعرفه‌ها' || cleanText === '/services') {
    await reply(
      `⚡ <b>خدمات تخصصی استودیو ریتم:</b>\n\n` +
      `🎬 <b>۱. تدوین و ادیت ویدیو:</b>\n` +
      `• تیزر، مستند و فیلم کوتاه\n` +
      `• اصلاح رنگ و نور حرفه‌ای (Color Grading)\n` +
      `• میکس و مسترینگ صدا\n` +
      `⏱️ تحویل: ۳ الی ۷ روز کاری\n\n` +
      `💻 <b>۲. طراحی و توسعه وب:</b>\n` +
      `• سایت‌های شرکتی، فروشگاهی و شخصی\n` +
      `• بهینه‌سازی سرعت و استانداردهای سئو\n` +
      `⏱️ تحویل: ۱ الی ۲ هفته کاری\n\n` +
      `📱 <b>۳. اپلیکیشن موبایل:</b>\n` +
      `• رابط کاربری تمیز و بصری\n` +
      `• ذخیره‌سازی آفلاین و سرعت بالا\n` +
      `⏱️ تحویل: ۲ الی ۴ هفته کاری\n\n` +
      `💬 کلیه پروژه‌ها دارای ۲ مرحله بازبینی و ادیت رایگان پس از تحویل هستند.`,
      {
        inline_keyboard: [
          [{ text: '📝 شروع ثبت سفارش', callback_data: 'cat_video' }]
        ]
      }
    );
    return responses;
  }

  if (cleanText === '📋 پیگیری سفارش‌های من' || cleanText === '/myorders') {
    if (isSimulation) {
      await reply(
        `📋 <b>سفارش‌های ثبت شده شما:</b>\n\n` +
        `🔖 کد: <code>RITM-1042</code>\n` +
        `▫️ نوع: تدوین ویدیو\n` +
        `▫️ وضعیت: ⏳ در حال بررسی اولیه\n` +
        `▫️ تاریخ ثبت: امروز`
      );
      return responses;
    }

    try {
      const { data: userOrders } = await supabase
        .from('orders')
        .select('*')
        .eq('telegram_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (!userOrders || userOrders.length === 0) {
        await reply(
          `شما هنوز سفارشی در ریتم ثبت نکرده‌اید.\nهمین حالا با زدن دکمه <b>📝 ثبت سفارش</b> پروژه خود را آغاز کنید!`,
          getMainReplyKeyboard(APP_URL)
        );
      } else {
        let msg = `📋 <b>سفارش‌های ثبت شده شما (${userOrders.length}):</b>\n\n`;
        const statusMap: Record<string, string> = {
          new: '🟡 ثبت شده / در انتظار بررسی',
          reviewing: '🔍 در حال بررسی توسط تیم فنی',
          in_progress: '⚡ در حال انجام',
          completed: '✅ تکمیل و تحویل داده شد',
          rejected: '❌ رد شده',
          canceled: '🚫 لغو شده',
        };

        userOrders.forEach((ord, index) => {
          msg += `<b>${index + 1}. کد:</b> <code>${ord.order_code}</code>\n`;
          msg += `📁 <b>نوع:</b> ${ord.project_type}\n`;
          msg += `📊 <b>وضعیت:</b> ${statusMap[ord.status] || ord.status}\n`;
          msg += `💰 <b>بودجه:</b> ${ord.budget || 'توافقی'}\n`;
          msg += `📅 <b>تاریخ:</b> ${new Date(ord.created_at).toLocaleDateString('fa-IR')}\n`;
          if (ord.admin_notes) {
            msg += `💬 <b>پیام پشتیبانی:</b> ${ord.admin_notes}\n`;
          }
          msg += `──────────────\n`;
        });

        await reply(msg, getMainReplyKeyboard(APP_URL));
      }
    } catch (err) {
      await reply('خطا در دریافت لیست سفارش‌ها. لطفاً لحظاتی دیگر تلاش کنید.');
    }
    return responses;
  }

  if (cleanText === '📞 تماس و مشاوره' || cleanText === '/contact') {
    await reply(
      `📞 <b>راه‌های ارتباطی با ریتم (RITM):</b>\n\n` +
      `📍 <b>آدرس:</b> تهران، ایران\n` +
      `✈️ <b>تلگرام پشتیبانی:</b> @RITM_FreeLancer\n` +
      `🌐 <b>شبکه‌های اجتماعی و کانال‌ها:</b>\n` +
      `• یوتیوب: youtube.com/RITM_Editz\n` +
      `• ایکس: x.com/RITM_Editz\n` +
      `• پیام‌رسان بله: ble.ir/RITM_FreeLancer\n\n` +
      `همچنین می‌توانید از طریق همین ربات مستقیم با پشتیبان گفتگو کنید.`
    );
    return responses;
  }

  if (cleanText === 'ℹ️ درباره ریتم' || cleanText === '/about') {
    await reply(
      `✨ <b>استودیو خلاقیت دیجیتال ریتم (RITM)</b>\n\n` +
      `ریتم متولد شد تا شکاف میان هنر و فناوری را پر کند. ما به قدرت داستان‌گویی تصویری و کدنویسی دقیق باور داریم. با ریتم، برند شما با بالاترین استانداردهای بصری و فنی جلوه خواهد کرد.\n\n` +
      `▫️ نسخه اپلیکیشن اندروید ریتم V2 نیز در وب‌سایت در دسترس است.\n` +
      `▫️ مدیریت و پشتیبانی: @AdvRFL`
    );
    return responses;
  }

  // Multi-step Registration Conversation States
  if (session.step === 'name') {
    if (cleanText.length < 2) {
      await reply('⚠️ لطفاً یک نام معتبر (حداقل ۲ کاراکتر) وارد فرمایید:');
      return responses;
    }
    session.data.full_name = cleanText;
    session.step = 'contact';
    await reply(
      `✅ با تشکر جناب/سرکار <b>${cleanText}</b>.\n\n` +
      `📞 <b>مرحله ۳ از ۵ — شماره تماس یا ایمیل</b>\n` +
      `لطفاً شماره تماس، آیدی تلگرام یا ایمیل خود را جهت هماهنگی ارسال کنید:`
    );
    return responses;
  }

  if (session.step === 'contact') {
    if (cleanText.length < 4) {
      await reply('⚠️ لطفاً شماره همراه، ایمیل یا آیدی معتبر وارد کنید:');
      return responses;
    }
    session.data.contact = cleanText;
    session.data.contact_type = cleanText.includes('@') ? (cleanText.startsWith('@') ? 'telegram' : 'email') : 'phone';
    session.step = 'budget';
    await reply(
      `💰 <b>مرحله ۴ از ۵ — بودجه تقریبی</b>\n` +
      `بازه بودجه مدنظرتان را از گزینه‌های زیر انتخاب نمایید:`,
      getBudgetKeyboard()
    );
    return responses;
  }

  if (session.step === 'description') {
    if (cleanText.length < 5) {
      await reply('⚠️ لطفاً توضیحات مختصری درباره پروژه و امکانات مدنظر بنویسید (حداقل ۵ کاراکتر):');
      return responses;
    }
    session.data.description = cleanText;
    session.step = 'confirm';

    const catLabels = {
      video: 'تدوین ویدیو و پست‌پروداکشن 🎬',
      web: 'توسعه و طراحی وب‌سایت 💻',
      mobile: 'اپلیکیشن موبایل 📱',
      other: 'سایر موارد 🎨',
    };

    const summary =
      `🔍 <b>پیش‌نمایش سفارش شما:</b>\n\n` +
      `👤 <b>نام سفارش‌دهنده:</b> ${session.data.full_name}\n` +
      `📁 <b>دسته‌بندی:</b> ${catLabels[session.data.project_type || 'video']}\n` +
      `📞 <b>اطلاعات تماس:</b> ${session.data.contact}\n` +
      `💰 <b>بودجه:</b> ${session.data.budget || 'توافقی'}\n` +
      `⏱️ <b>مهلت تحویل:</b> ${session.data.deadline || 'توافقی'}\n\n` +
      `📝 <b>توضیحات پروژه:</b>\n${session.data.description}\n\n` +
      `آیا اطلاعات فوق مورد تایید شماست؟`;

    await reply(summary, getConfirmKeyboard());
    return responses;
  }

  // Default Fallback
  await reply(
    `پیام شما دریافت شد. لطفاً یکی از گزینه‌های منوی زیر را انتخاب نمایید:`,
    getMainReplyKeyboard(APP_URL)
  );
  return responses;
}

// --- MEDIA STORAGE & UPLOAD (1 GB Quota on Server) ---
app.post('/api/upload-media', async (req: Request, res: Response) => {
  try {
    const { orderCode, clientName, contact, fileName, fileType, fileBase64, caption } = req.body;
    if (!fileBase64) {
      return res.status(400).json({ success: false, message: 'فایلی جهت ارسال یافت نشد.' });
    }

    const base64Data = fileBase64.replace(/^data:[^;]+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const fileSize = buffer.length;

    const currentFiles = loadStorageMeta();
    const currentUsedBytes = currentFiles.reduce((acc, f) => acc + (f.sizeBytes || 0), 0);

    if (currentUsedBytes + fileSize > MAX_STORAGE_BYTES) {
      return res.status(400).json({
        success: false,
        message: 'ظرفیت فضای ذخیره‌سازی سایت (۱ گیگابایت) پر شده است. لطفاً فایل‌های قدیمی را از پنل ادمین حذف فرمایید.',
      });
    }

    const safeOriginalName = (fileName || 'file.bin').replace(/[^a-zA-Z0-9._-]/g, '_');
    const storedFileName = `${Date.now()}_${safeOriginalName}`;
    const filePath = path.join(UPLOADS_DIR, storedFileName);

    fs.writeFileSync(filePath, buffer);
    try {
      fs.writeFileSync(path.join(PUBLIC_UPLOADS_DIR, storedFileName), buffer);
    } catch (e) {}

    const fileRecord: StoredFileRecord = {
      id: Math.random().toString(36).substring(2, 10),
      orderCode: orderCode || 'بدون کد',
      clientName: clientName || 'کاربر سایت',
      contact: contact || '-',
      fileName: fileName || safeOriginalName,
      storedFileName,
      fileType: fileType || 'application/octet-stream',
      sizeBytes: fileSize,
      uploadDate: new Date().toISOString(),
      caption: caption || '',
      url: `/uploads/${storedFileName}`,
    };

    currentFiles.unshift(fileRecord);
    saveStorageMeta(currentFiles);

    // If orderCode exists and not PENDING, update Supabase order description
    if (orderCode && orderCode !== 'PENDING') {
      try {
        const { data: ord } = await supabase.from('orders').select('id, description').eq('order_code', orderCode).maybeSingle();
        if (ord && !ord.description?.includes(fileRecord.url)) {
          await supabase.from('orders').update({
            description: `${ord.description}\n\n📎 فایل پیوست: ${fileRecord.fileName} (${fileRecord.url})`,
          }).eq('id', ord.id);
        }
      } catch (err) {}
    }

    logBot(`File ${fileRecord.fileName} (${(fileSize / (1024 * 1024)).toFixed(2)} MB) stored locally.`);

    return res.json({
      success: true,
      file: fileRecord,
      storage: {
        usedBytes: currentUsedBytes + fileSize,
        maxBytes: MAX_STORAGE_BYTES,
        usedMB: Number(((currentUsedBytes + fileSize) / (1024 * 1024)).toFixed(2)),
        maxMB: 1024,
        usedPercent: Number((((currentUsedBytes + fileSize) / MAX_STORAGE_BYTES) * 100).toFixed(2)),
      },
    });
  } catch (error: any) {
    console.error('Error saving uploaded media locally:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Admin Storage List
app.get('/api/admin/storage', (req: Request, res: Response) => {
  try {
    const files = loadStorageMeta();
    const usedBytes = files.reduce((acc, f) => acc + (f.sizeBytes || 0), 0);
    return res.json({
      success: true,
      files,
      usedBytes,
      maxBytes: MAX_STORAGE_BYTES,
      usedMB: Number((usedBytes / (1024 * 1024)).toFixed(2)),
      maxMB: 1024,
      usedPercent: Number(((usedBytes / MAX_STORAGE_BYTES) * 100).toFixed(2)),
      fileCount: files.length,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Admin Storage Delete File
app.delete('/api/admin/storage/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let files = loadStorageMeta();
    const target = files.find((f) => f.id === id);
    if (!target) {
      return res.status(404).json({ success: false, message: 'فایل یافت نشد.' });
    }

    const filePath = path.join(UPLOADS_DIR, target.storedFileName);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (e) {
        console.warn('File already unlinked:', e);
      }
    }

    files = files.filter((f) => f.id !== id);
    saveStorageMeta(files);

    const usedBytes = files.reduce((acc, f) => acc + (f.sizeBytes || 0), 0);

    return res.json({
      success: true,
      message: 'فایل با موفقیت حذف شد و فضای ذخیره‌سازی آزاد گردید.',
      storage: {
        usedBytes,
        maxBytes: MAX_STORAGE_BYTES,
        usedMB: Number((usedBytes / (1024 * 1024)).toFixed(2)),
        maxMB: 1024,
        usedPercent: Number(((usedBytes / MAX_STORAGE_BYTES) * 100).toFixed(2)),
        fileCount: files.length,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// --- AUTHENTICATION & ACCESS CONTROL CONSTANTS ---
const ADMIN_SECRET = 'Mohmah123';
const ADMIN_TOKEN = 'ritm_admin_token_mohmah123';

// --- REST API ROUTES ---

// Auth 1: Admin Login with password Mohmah123
app.post('/api/auth/admin-login', (req: Request, res: Response) => {
  const { password } = req.body;
  if (password === ADMIN_SECRET) {
    return res.json({ success: true, token: ADMIN_TOKEN, role: 'admin' });
  }
  return res.status(401).json({ success: false, message: 'رمز عبور مدیریت نادرست است.' });
});

// Auth 2: Client Register (Ordinary Users with Unique Email)
app.post('/api/auth/client-register', async (req: Request, res: Response) => {
  try {
    const { email, username, password, full_name } = req.body;
    const rawEmail = (email || username || '').trim().toLowerCase();
    if (!rawEmail || !password || !full_name) {
      return res.status(400).json({ success: false, message: 'لطفاً نام و نام‌خانوادگی، ایمیل و رمز عبور را وارد کنید.' });
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(rawEmail)) {
      return res.status(400).json({ success: false, message: 'فرمت ایمیل وارد شده نامعتبر است (مثال: user@example.com).' });
    }

    // Check if email already exists in Supabase
    const { data: existing } = await supabase
      .from('users')
      .select('id, username')
      .ilike('username', rawEmail)
      .maybeSingle();

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'این ایمیل قبلاً در سایت ثبت شده است. لطفاً وارد حساب خود شوید.',
      });
    }

    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        username: rawEmail,
        password: password.trim(),
        first_name: full_name.trim(),
        language: 'fa',
        is_admin: false,
        is_blocked: false,
        created_at: new Date().toISOString(),
        last_seen: new Date().toISOString(),
      })
      .select('id, username, first_name, last_name, is_admin')
      .single();

    if (error) throw error;
    res.json({ success: true, user: { ...newUser, email: rawEmail } });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Auth 3: Client Login (With Email)
app.post('/api/auth/client-login', async (req: Request, res: Response) => {
  try {
    const { email, username, password } = req.body;
    const rawEmail = (email || username || '').trim().toLowerCase();
    if (!rawEmail || !password) {
      return res.status(400).json({ success: false, message: 'لطفاً ایمیل و رمز عبور خود را وارد کنید.' });
    }

    const { data: user } = await supabase
      .from('users')
      .select('id, username, password, first_name, last_name, is_admin')
      .ilike('username', rawEmail)
      .maybeSingle();

    if (!user || user.password !== password.trim()) {
      return res.status(401).json({ success: false, message: 'ایمیل یا رمز عبور اشتباه است.' });
    }

    const { password: _, ...userSafe } = user;
    res.json({ success: true, user: { ...userSafe, email: rawEmail } });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// --- EMAIL OTP AUTHENTICATION & PASSWORD RESET ---
interface OtpRecord {
  code: string;
  email: string;
  expiresAt: number;
  purpose: 'reset' | 'register';
}
const otpStore = new Map<string, OtpRecord>();

// Auth 3.1: Send OTP Code to user email
app.post('/api/auth/send-otp', async (req: Request, res: Response) => {
  try {
    const { email, purpose = 'reset' } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return res.status(400).json({ success: false, message: 'لطفاً یک آدرس ایمیل معتبر وارد فرمایید.' });
    }

    if (purpose === 'reset') {
      const { data: user } = await supabase
        .from('users')
        .select('id, username')
        .ilike('username', cleanEmail)
        .maybeSingle();

      if (!user) {
        return res.status(404).json({ success: false, message: 'کاربری با این آدرس ایمیل در سیستم یافت نشد.' });
      }
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    otpStore.set(cleanEmail, {
      code,
      email: cleanEmail,
      expiresAt,
      purpose,
    });

    console.log(`[RITM OTP] Verification Code for ${cleanEmail} (${purpose}): ${code}`);

    let emailSent = false;
    if (mailTransporter) {
      try {
        await mailTransporter.sendMail({
          from: `"استودیو ریتم" <${process.env.SMTP_USER}>`,
          to: cleanEmail,
          subject: purpose === 'reset' ? 'کد بازیابی رمز عبور استودیو ریتم' : 'کد تایید ایمیل استودیو ریتم',
          html: `
            <div dir="rtl" style="font-family: Tahoma, sans-serif; background-color: #0d0f17; color: #ffffff; padding: 30px; border-radius: 16px; max-width: 500px; margin: auto; text-align: right; border: 1px solid rgba(255,255,255,0.1);">
              <h2 style="color: #d0bcff; margin-bottom: 20px;">استودیو ریتم | RITM Studio</h2>
              <p style="color: #e5e2e1; font-size: 14px; line-height: 1.8;">سلام کاربر گرامی،</p>
              <p style="color: #958ea0; font-size: 13px;">کد تایید شما جهت ${purpose === 'reset' ? 'بازیابی رمز عبور' : 'تایید حساب کاربری'}:</p>
              <div style="background-color: #161823; border: 1px dashed #d0bcff; border-radius: 12px; padding: 16px; text-align: center; margin: 24px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #a3e635; font-family: monospace;">${code}</span>
              </div>
              <p style="color: #958ea0; font-size: 12px;">این کد تا ۱۰ دقیقه دیگر معتبر است.</p>
              <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 20px 0;" />
              <p style="color: #71717a; font-size: 11px; text-align: center;">تیم پشتیبانی آژانس خلاقیت دیجیتال ریتم</p>
            </div>
          `,
        });
        emailSent = true;
      } catch (err: any) {
        console.error('Failed to send mail via SMTP:', err);
      }
    }

    return res.json({
      success: true,
      message: emailSent
        ? `کد تایید ۶ رقمی به ایمیل ${cleanEmail} ارسال شد.`
        : `کد تایید صادر شد (کد: ${code}).`,
      debugCode: code,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Auth 3.2: Verify OTP Code
app.post('/api/auth/verify-otp', (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanCode = (code || '').trim();

    const record = otpStore.get(cleanEmail);
    if (!record) {
      return res.status(400).json({ success: false, message: 'کد تاییدی برای این ایمیل یافت نشد یا منقضی شده است.' });
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(cleanEmail);
      return res.status(400).json({ success: false, message: 'کد تایید منقضی شده است. لطفاً مجدداً درخواست دهید.' });
    }

    if (record.code !== cleanCode) {
      return res.status(400).json({ success: false, message: 'کد وارد شده نادرست است.' });
    }

    return res.json({ success: true, message: 'کد تایید شد.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Auth 3.3: Reset Password with OTP
app.post('/api/auth/reset-password', async (req: Request, res: Response) => {
  try {
    const { email, code, newPassword } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanCode = (code || '').trim();

    if (!cleanEmail || !newPassword || newPassword.trim().length < 4) {
      return res.status(400).json({ success: false, message: 'رمز عبور جدید باید حداقل ۴ کاراکتر باشد.' });
    }

    const record = otpStore.get(cleanEmail);
    if (!record || record.code !== cleanCode || Date.now() > record.expiresAt) {
      return res.status(400).json({ success: false, message: 'کد تایید نامعتبر است یا منقضی شده است.' });
    }

    const { error } = await supabase
      .from('users')
      .update({
        password: newPassword.trim(),
        last_seen: new Date().toISOString(),
      })
      .ilike('username', cleanEmail);

    if (error) throw error;
    otpStore.delete(cleanEmail);

    return res.json({
      success: true,
      message: 'رمز عبور با موفقیت تغییر یافت. اکنون می‌توانید وارد شوید.',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Auth 4: Client My Orders (Only their own projects & progress)
app.get('/api/client/my-orders', async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId ? parseInt(req.query.userId as string, 10) : 0;
    const username = (req.query.username as string || '').trim().toLowerCase();

    if (!userId && !username) {
      return res.json({ success: true, orders: [] });
    }

    let query = supabase.from('orders').select('*').order('created_at', { ascending: false });

    if (userId > 0 && username) {
      query = query.or(`user_id.eq.${userId},username.ilike.${username}`);
    } else if (userId > 0) {
      query = query.eq('user_id', userId);
    } else if (username) {
      query = query.ilike('username', username);
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json({ success: true, orders: data || [] });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// ==================== ONLINE PROJECT CHAT API ====================
// Get messages for a specific orderCode or user
app.get('/api/chat/messages', (req: Request, res: Response) => {
  try {
    const orderCode = (req.query.orderCode as string || '').trim();
    const userId = req.query.userId ? parseInt(req.query.userId as string, 10) : undefined;
    const all = req.query.all === 'true';

    const allMessages = loadChatMessages();

    if (all) {
      return res.json({ success: true, messages: allMessages });
    }

    if (orderCode) {
      const filtered = allMessages.filter(
        (m) => m.orderCode === orderCode || m.orderCode === 'RITM-GENERAL'
      );
      return res.json({ success: true, messages: filtered });
    }

    if (userId) {
      const filtered = allMessages.filter(
        (m) => m.userId === userId || m.orderCode === 'RITM-GENERAL'
      );
      return res.json({ success: true, messages: filtered });
    }

    res.json({ success: true, messages: allMessages });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Send new message
app.post('/api/chat/send', async (req: Request, res: Response) => {
  try {
    const { orderCode, userId, clientName, senderRole, text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'متن پیام نمی‌تواند خالی باشد.' });
    }

    const allMessages = loadChatMessages();

    const newMsg: ChatMessageRecord = {
      id: `chat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      orderCode: orderCode?.trim() || 'RITM-GENERAL',
      userId: userId || null,
      clientName: (clientName || (senderRole === 'admin' ? 'مدیریت ریتم' : 'کاربر')).trim(),
      senderRole: senderRole === 'admin' ? 'admin' : 'client',
      text: text.trim(),
      createdAt: new Date().toISOString(),
      read: senderRole === 'admin',
    };

    allMessages.push(newMsg);
    saveChatMessages(allMessages);

    // Also persist in order_messages in Supabase if orderCode exists
    if (orderCode && orderCode !== 'RITM-GENERAL') {
      try {
        const { data: order } = await supabase
          .from('orders')
          .select('id')
          .eq('order_code', orderCode)
          .maybeSingle();

        if (order?.id) {
          await supabase.from('order_messages').insert({
            order_id: order.id,
            from_admin: senderRole === 'admin',
            text: text.trim(),
            created_at: newMsg.createdAt,
          });
        }
      } catch (e) {
        // Non-blocking fallback
      }
    }

    res.json({ success: true, message: newMsg });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get conversations list (Admin overview)
app.get('/api/chat/conversations', async (req: Request, res: Response) => {
  try {
    const allMessages = loadChatMessages();

    // Fetch orders to associate project titles & statuses
    let ordersMap: Record<string, any> = {};
    try {
      const { data: orders } = await supabase.from('orders').select('id, order_code, full_name, project_type, status, user_id');
      if (orders) {
        orders.forEach((o) => {
          ordersMap[o.order_code] = o;
        });
      }
    } catch (e) {}

    const groups: Record<string, ChatMessageRecord[]> = {};
    for (const msg of allMessages) {
      const key = msg.orderCode || 'RITM-GENERAL';
      if (!groups[key]) groups[key] = [];
      groups[key].push(msg);
    }

    const conversations = Object.entries(groups).map(([code, msgs]) => {
      const last = msgs[msgs.length - 1];
      const unreadCount = msgs.filter((m) => m.senderRole === 'client' && !m.read).length;
      const linkedOrder = ordersMap[code];

      return {
        orderCode: code,
        clientName: linkedOrder?.full_name || (last.senderRole === 'client' ? last.clientName : (msgs.find(m => m.senderRole === 'client')?.clientName || 'گفتگوی عمومی')),
        userId: linkedOrder?.user_id || last.userId,
        lastMessage: last.text,
        lastMessageTime: last.createdAt,
        unreadCount,
        projectType: linkedOrder?.project_type,
        orderStatus: linkedOrder?.status,
      };
    });

    // Sort by most recent message
    conversations.sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());

    res.json({ success: true, conversations });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Mark messages as read
app.post('/api/chat/mark-read', (req: Request, res: Response) => {
  try {
    const { orderCode, readerRole = 'admin' } = req.body;
    const allMessages = loadChatMessages();

    let updatedCount = 0;
    allMessages.forEach((m) => {
      if (!orderCode || m.orderCode === orderCode) {
        if (readerRole === 'admin' && m.senderRole === 'client' && !m.read) {
          m.read = true;
          updatedCount++;
        } else if (readerRole === 'client' && m.senderRole === 'admin' && !m.read) {
          m.read = true;
          updatedCount++;
        }
      }
    });

    if (updatedCount > 0) {
      saveChatMessages(allMessages);
    }

    res.json({ success: true, updatedCount });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 1. Studio & System status & metrics
app.get('/api/status', async (req: Request, res: Response) => {
  try {
    const { count: ordersCount } = await supabase.from('orders').select('*', { count: 'exact', head: true });
    const { count: usersCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
    const { count: pendingCount } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'new');
    
    const files = loadStorageMeta();
    const usedBytes = files.reduce((acc, f) => acc + (f.sizeBytes || 0), 0);

    res.json({
      success: true,
      supabaseConnected: true,
      metrics: {
        totalOrders: ordersCount || 0,
        totalUsers: usersCount || 0,
        pendingOrders: pendingCount || 0,
        storageUsedMB: Number((usedBytes / (1024 * 1024)).toFixed(2)),
        storageMaxMB: 1024,
        storageFileCount: files.length,
      },
      recentLogs: recentBotLogs.slice(0, 30),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Storage Link Helper
app.post('/api/admin/storage/link', async (req: Request, res: Response) => {
  try {
    const { fileUrl, orderCode } = req.body;
    if (!fileUrl || !orderCode) return res.json({ ok: false });
    const files = loadStorageMeta();
    const target = files.find((f) => f.url === fileUrl);
    if (target) {
      target.orderCode = orderCode;
      saveStorageMeta(files);

      try {
        const { data: ord } = await supabase.from('orders').select('id, description').eq('order_code', orderCode).maybeSingle();
        if (ord && !ord.description?.includes(target.url)) {
          await supabase.from('orders').update({
            description: `${ord.description}\n\n📎 فایل پیوست: ${target.fileName} (${target.url})`,
          }).eq('id', ord.id);
        }
      } catch (err) {}
    }
    return res.json({ ok: true });
  } catch (e) {
    return res.json({ ok: false });
  }
});

// 2. Orders list
app.get('/api/orders', async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string;
    const search = req.query.search as string;

    let query = supabase.from('orders').select('*').order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`order_code.ilike.%${search}%,full_name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json({ success: true, orders: data || [] });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Create Order from Web App / Mini App
app.post('/api/orders', async (req: Request, res: Response) => {
  try {
    const {
      full_name,
      contact,
      contact_type = 'telegram',
      project_type,
      budget,
      deadline,
      description,
      telegram_id,
      username,
    } = req.body;

    if (!full_name || !contact || !project_type || !description) {
      return res.status(400).json({ success: false, message: 'لطفاً فیلدهای ضروری را پر کنید.' });
    }

    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const orderCode = `RITM-${randomCode}`;
    const tgId = telegram_id ? parseInt(telegram_id, 10) : 0;

    // Determine valid contact_type according to constraint: only 'email' or 'phone'
    const isEmail = (contact || '').includes('@') && (contact || '').includes('.');
    const validContactType: 'email' | 'phone' = isEmail ? 'email' : 'phone';
    const preferredContact = (contact || '').startsWith('@') || (username ? true : false) ? 'telegram' : isEmail ? 'email' : 'phone';

    // Find user_id from users table if exists
    let dbUserId: number | null = null;
    if (tgId > 0) {
      const { data: u } = await supabase.from('users').select('id').eq('telegram_id', tgId).maybeSingle();
      if (u) dbUserId = u.id;
    }

    const { data: newOrder, error } = await supabase
      .from('orders')
      .insert({
        order_code: orderCode,
        user_id: dbUserId,
        telegram_id: tgId,
        username: username || null,
        full_name,
        contact,
        contact_type: validContactType,
        preferred_contact: preferredContact,
        project_type,
        budget: budget || 'توافقی',
        deadline: deadline || 'توافقی',
        description,
        status: 'new',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('*')
      .single();

    if (error) throw error;

    // Send Telegram Notification to Admin
    const catLabels: Record<string, string> = {
      video: 'تدوین ویدیو 🎬',
      web: 'توسعه وب 💻',
      mobile: 'اپلیکیشن موبایل 📱',
      other: 'سایر موارد 🎨',
    };

    const adminMsg =
      `🔔 <b>سفارش جدید از وب‌اپلیکیشن ریتم!</b>\n\n` +
      `🔖 <b>کد رهگیری:</b> <code>${orderCode}</code>\n` +
      `👤 <b>مشتری:</b> ${full_name}\n` +
      `📁 <b>نوع پروژه:</b> ${catLabels[project_type] || project_type}\n` +
      `💰 <b>بودجه:</b> ${budget || 'توافقی'}\n` +
      `⏱️ <b>مهلت:</b> ${deadline || 'توافقی'}\n` +
      `📞 <b>ارتباط:</b> ${contact}\n` +
      `📝 <b>توضیحات:</b>\n${description}\n\n` +
      `🌐 پورتال مدیریت سفارشات ریتم`;

    await callTelegram('sendMessage', {
      chat_id: ADMIN_TELEGRAM_ID,
      text: adminMsg,
      parse_mode: 'HTML',
    });

    // If client supplied a telegram_id, send confirmation to their Telegram as well!
    if (tgId > 0) {
      await callTelegram('sendMessage', {
        chat_id: tgId,
        text:
          `🎉 <b>سفارش شما در ریتم ثبت شد!</b>\n\n` +
          `کد رهگیری شما: <code>${orderCode}</code>\n` +
          `به زودی کارشناسان ما با شما تماس خواهند گرفت.`,
        parse_mode: 'HTML',
      });
    }

    logBot(`Web Order ${orderCode} created successfully.`);
    res.json({ success: true, order: newOrder });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Update order status
app.patch('/api/orders/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, admin_notes, notify_client = true } = req.body;

    const { data: updated, error } = await supabase
      .from('orders')
      .update({
        status,
        admin_notes: admin_notes !== undefined ? admin_notes : undefined,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;

    // Notify user on Telegram if applicable
    if (notify_client && updated && updated.telegram_id && updated.telegram_id > 0) {
      const statusLabels: Record<string, string> = {
        new: 'ثبت شده',
        reviewing: 'در حال بررسی توسط تیم فنی 🔍',
        in_progress: 'در حال طراحی و اجرا ⚡',
        completed: 'تکمیل و تحویل نهایی ✅',
        rejected: 'رد شده ❌',
        canceled: 'لغو شده 🚫',
      };

      let notifyText =
        `📢 <b>بروزرسانی وضعیت سفارش ${updated.order_code}</b>\n\n` +
        `وضعیت جدید: <b>${statusLabels[status] || status}</b>\n`;

      if (admin_notes) {
        notifyText += `\n💬 <b>پیام استودیو ریتم:</b>\n${admin_notes}\n`;
      }
      notifyText += `\nجهت پیگیری بیشتر می‌توانید با پشتیبانی (@RITM_FreeLancer) در ارتباط باشید.`;

      await callTelegram('sendMessage', {
        chat_id: updated.telegram_id,
        text: notifyText,
        parse_mode: 'HTML',
      });
      logBot(`Notification sent to Telegram user ${updated.telegram_id} for order ${updated.order_code}`);
    }

    res.json({ success: true, order: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4.1 Delete Order Completely (Admin Action)
app.delete('/api/orders/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const orderId = parseInt(id, 10);
    if (!orderId) {
      return res.status(400).json({ success: false, message: 'شناسه سفارش نامعتبر است' });
    }

    try {
      await supabase.from('order_messages').delete().eq('order_id', orderId);
    } catch (e) {}

    const { error } = await supabase.from('orders').delete().eq('id', orderId);
    if (error) throw error;

    logBot(`Order #${orderId} deleted permanently by admin.`);
    res.json({ success: true, message: 'سفارش با موفقیت حذف گردید.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. Users List
app.get('/api/users', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('last_seen', { ascending: false });
    if (error) throw error;
    res.json({ success: true, users: data || [] });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5.1 Delete User Completely (Admin Action)
app.delete('/api/admin/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id, 10);
    if (!userId) {
      return res.status(400).json({ success: false, message: 'شناسه کاربر نامعتبر است' });
    }

    // Unbind orders from deleted user so records don't break
    await supabase.from('orders').update({ user_id: null }).eq('user_id', userId);

    const { error } = await supabase.from('users').delete().eq('id', userId);
    if (error) throw error;

    logBot(`User ${userId} deleted by admin from website.`);
    res.json({ success: true, message: 'کاربر با موفقیت از سیستم حذف گردید.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 6. Direct Message sender / Order communication
app.get('/api/messages/:orderId', async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    res.json({ success: true, messages: data || [] });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/messages', async (req: Request, res: Response) => {
  try {
    const { order_id, to_telegram_id, text, from_admin = true } = req.body;
    if (!text || !to_telegram_id) {
      return res.status(400).json({ success: false, message: 'متن پیام یا گیرنده نامعتبر است' });
    }

    const { data: saved, error } = await supabase
      .from('messages')
      .insert({
        order_id: order_id || null,
        from_admin,
        from_telegram_id: from_admin ? ADMIN_TELEGRAM_ID : to_telegram_id,
        to_telegram_id,
        text,
        created_at: new Date().toISOString(),
      })
      .select('*')
      .single();

    if (error) throw error;

    // Send on Telegram
    await callTelegram('sendMessage', {
      chat_id: to_telegram_id,
      text: `📩 <b>پیام از طرف استودیو ریتم:</b>\n\n${text}`,
      parse_mode: 'HTML',
    });

    logBot(`Admin message sent to Telegram user ${to_telegram_id}`);
    res.json({ success: true, message: saved });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 7. Bot Broadcast Announcement
app.post('/api/bot/broadcast', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ success: false, message: 'متن پیام الزامی است' });

    const { data: users } = await supabase.from('users').select('telegram_id');
    let sentCount = 0;

    if (users && users.length > 0) {
      for (const u of users) {
        if (u.telegram_id) {
          await callTelegram('sendMessage', {
            chat_id: u.telegram_id,
            text: `📢 <b>اطلاعیه استودیو ریتم:</b>\n\n${text}`,
            parse_mode: 'HTML',
          });
          sentCount++;
        }
      }
    }

    logBot(`Broadcast sent to ${sentCount} users.`);
    res.json({ success: true, sentCount });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Vite Middleware integration in dev or static serving in production
async function bootstrap() {
  const isProduction = process.env.NODE_ENV === 'production' || !!process.env.RAILWAY_ENVIRONMENT || !!process.env.RAILWAY_STATIC_URL;
  if (!isProduction) {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } catch (e) {
      console.warn('Vite dev middleware fallback to dist:', e);
      app.use(express.static(path.resolve(__dirname, 'dist')));
      app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
      });
    }
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

bootstrap().catch(console.error);
