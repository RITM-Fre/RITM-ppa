import { supabase } from '../lib/supabaseClient';
import { Order, OrderStatus, User, AuthUser, OrderMessage } from '../types';

const TELEGRAM_BOT_TOKEN = '8933995842:AAEe4N1I4FM3yspFyY85bjN87njJ1lZr6qY';
const ADMIN_CHAT_IDS = [8770212764, 8797861038];

// Send direct Telegram notification (non-blocking)
export async function notifyTelegramAdmins(text: string) {
  for (const chatId of ADMIN_CHAT_IDS) {
    try {
      fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'HTML',
        }),
      }).catch(() => {});
    } catch (e) {
      // Ignore network errors on Telegram notification
    }
  }
}

// 1. Fetch Orders with optional filter and search
export async function getOrders(statusFilter?: string, search?: string): Promise<{ success: boolean; orders: Order[] }> {
  try {
    let query = supabase.from('orders').select('*').order('created_at', { ascending: false });

    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    if (search && search.trim()) {
      const q = search.trim();
      query = query.or(`order_code.ilike.%${q}%,full_name.ilike.%${q}%,contact.ilike.%${q}%,username.ilike.%${q}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return { success: true, orders: (data || []) as Order[] };
  } catch (err: any) {
    console.error('getOrders error:', err);
    return { success: false, orders: [] };
  }
}

// 2. Create Order
export async function createOrder(orderData: Partial<Order>): Promise<{ success: boolean; order?: Order; error?: string }> {
  const isEmail = (orderData.contact || '').includes('@') && (orderData.contact || '').includes('.');
  const validContactType: 'email' | 'phone' = isEmail ? 'email' : 'phone';

  try {
    const orderCode = 'RITM-' + Math.floor(1000 + Math.random() * 9000);
    const newOrder = {
      order_code: orderCode,
      full_name: orderData.full_name || 'کاربر گرامی',
      contact: orderData.contact || '',
      contact_type: validContactType,
      project_type: orderData.project_type || 'video',
      budget: orderData.budget || 'توافقی',
      deadline: orderData.deadline || '۱ تا ۲ هفته',
      description: orderData.description || '',
      telegram_id: orderData.telegram_id ? Number(orderData.telegram_id) : 0,
      username: orderData.username ? orderData.username.replace(/^@/, '') : null,
      status: 'new' as OrderStatus,
      preferred_contact: validContactType === 'email' ? 'email' : 'phone',
      admin_notes: null,
      user_id: orderData.user_id || null,
    };

    const { data, error } = await supabase.from('orders').insert([newOrder]).select().single();
    if (error) throw error;

    const notifyMsg = `🔔 <b>سفارش جدید در ریتم ثبت شد!</b>\n\n` +
      `🔖 <b>کد رهگیری:</b> <code>${orderCode}</code>\n` +
      `👤 <b>مشتری:</b> ${newOrder.full_name}\n` +
      `📞 <b>تماس:</b> ${newOrder.contact} (${validContactType})\n` +
      `📂 <b>نوع پروژه:</b> ${newOrder.project_type}\n` +
      `💰 <b>بودجه:</b> ${newOrder.budget}\n` +
      `⏱ <b>مهلت:</b> ${newOrder.deadline}\n` +
      `📝 <b>توضیحات:</b> ${newOrder.description || 'ندارد'}`;

    notifyTelegramAdmins(notifyMsg);

    return { success: true, order: data as Order };
  } catch (err: any) {
    console.error('createOrder error:', err);
    return { success: false, error: err.message || 'خطا در ثبت سفارش در پایگاه داده' };
  }
}

// 2.1 Upload Media (Placeholder — needs backend for real upload)
export async function uploadOrderMedia(payload: {
  orderCode?: string;
  clientName?: string;
  contact?: string;
  fileName: string;
  fileType: string;
  fileBase64: string;
  caption?: string;
}): Promise<{ success: boolean; error?: string }> {
  // بدون بک‌اند، این قابلیت در دسترس نیست
  console.warn('uploadOrderMedia requires a backend. Payload size:', payload.fileBase64?.length || 0);
  return { success: false, error: 'آپلود فایل نیازمند سرور بک‌اند است.' };
}

// 3. Update Order Status
export async function updateOrderStatus(
  id: number | string,
  status: OrderStatus,
  adminNotes?: string,
  notifyClient: boolean = true
): Promise<{ success: boolean; order?: Order; error?: string }> {
  try {
    const updatePayload: any = {
      status,
      updated_at: new Date().toISOString(),
    };
    if (adminNotes !== undefined) {
      updatePayload.admin_notes = adminNotes;
    }

    const { data, error } = await supabase
      .from('orders')
      .update(updatePayload)
      .eq('id', Number(id))
      .select()
      .single();

    if (error) throw error;
    return { success: true, order: data as Order };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// 3.1 Cancel Order (Client Action)
export async function cancelOrderByClient(orderId: number, reason?: string): Promise<{ success: boolean; error?: string }> {
  return updateOrderStatus(orderId, 'cancelled', reason ? `لغو شده توسط کاربر: ${reason}` : 'لغو شده توسط کاربر');
}

// 3.2 Delete Order Permanently (Admin Action)
export async function deleteOrder(orderId: number): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('orders').delete().eq('id', orderId);
    if (error) throw error;
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message || 'خطا در حذف سفارش' };
  }
}

// 4. Fetch Users (for admin panel)
export async function getUsers(): Promise<{ success: boolean; users: User[] }> {
  try {
    const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return { success: true, users: (data || []) as User[] };
  } catch (err: any) {
    return { success: false, users: [] };
  }
}

// 4.1 Delete User Completely (Admin Action)
export async function deleteUser(userId: number): Promise<{ success: boolean; error?: string }> {
  try {
    await supabase.from('orders').update({ user_id: null }).eq('user_id', userId);
    const { error } = await supabase.from('users').delete().eq('id', userId);
    if (error) throw error;
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message || 'خطا در حذف کاربر' };
  }
}

// 5. Client Login (مستقیم از Supabase — بدون بک‌اند)
export async function clientLogin(
  emailOrUsername: string,
  password?: string
): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  const cleanInput = emailOrUsername.trim().toLowerCase();
  const cleanPassword = (password || '').trim();

  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .or(`username.ilike.%${cleanInput}%,email.ilike.%${cleanInput}%`);

    if (error) throw error;

    if (!users || users.length === 0) {
      return { success: false, error: 'کاربری با این مشخصات یا ایمیل یافت نشد.' };
    }

    for (const user of users) {
      let passwordMatch = false;

      if (!user.password) {
        passwordMatch = true;
      } else if (user.password === cleanPassword) {
        passwordMatch = true;
      } else {
        try {
          const bcrypt = await import('bcryptjs');
          passwordMatch = await bcrypt.compare(cleanPassword, user.password);
        } catch {
          passwordMatch = user.password === cleanPassword;
        }
      }

      if (passwordMatch) {
        const authUser: AuthUser = {
          id: user.id,
          username: user.username || cleanInput,
          email: user.email || cleanInput,
          first_name: user.first_name,
          last_name: user.last_name,
          is_admin: user.is_admin,
        };
        return { success: true, user: authUser };
      }
    }

    return { success: false, error: 'رمز عبور نادرست است.' };
  } catch (err: any) {
    console.error('Direct Supabase login error:', err);
    return { success: false, error: err.message || 'خطا در ورود به حساب' };
  }
}

// 5.1 Client Login with Verification Code (Email OTP) — needs backend
export async function clientLoginWithOtp(
  email: string,
  code: string
): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanCode = code.trim();

  try {
    // بررسی OTP در جدول otp_codes (اگر وجود داشته باشد)
    const { data: otpRow, error: otpErr } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('email', cleanEmail)
      .eq('code', cleanCode)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (otpErr) {
      // جدول OTP وجود ندارد
      return { success: false, error: 'ورود با کد تایید نیازمند سرور بک‌اند است. لطفاً با رمز عبور وارد شوید.' };
    }

    if (!otpRow) {
      return { success: false, error: 'کد تایید نادرست است یا منقضی شده است.' };
    }

    // پیدا کردن کاربر با ایمیل یا نام کاربری
    const { data: userRow, error: userErr } = await supabase
      .from('users')
      .select('*')
      .or(`email.ilike.${cleanEmail},username.ilike.${cleanEmail}`)
      .maybeSingle();

    if (userErr) throw userErr;
    if (!userRow) {
      return { success: false, error: 'کاربری با این ایمیل یافت نشد.' };
    }

    // پاک کردن OTP مصرف‌شده
    await supabase.from('otp_codes').delete().eq('id', otpRow.id);

    const authUser: AuthUser = {
      id: userRow.id,
      username: userRow.username || cleanEmail,
      email: userRow.email || cleanEmail,
      first_name: userRow.first_name,
      last_name: userRow.last_name,
      is_admin: userRow.is_admin,
    };

    return { success: true, user: authUser };
  } catch (err: any) {
    return { success: false, error: err.message || 'خطا در تایید کد' };
  }
}

// 6. Client Register (With Unique Email)
export async function clientRegister(
  emailOrUsername: string,
  password: string,
  fullName: string
): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  const cleanEmail = emailOrUsername.trim().toLowerCase();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return { success: false, error: 'لطفاً یک آدرس ایمیل معتبر وارد کنید (مثال: user@example.com).' };
  }

  try {
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .or(`username.ilike.${cleanEmail},email.ilike.${cleanEmail}`)
      .maybeSingle();

    if (existing) {
      return { success: false, error: 'این ایمیل قبلاً در سایت ثبت شده است. لطفاً وارد حساب خود شوید.' };
    }

    const newUser = {
      username: cleanEmail,
      email: cleanEmail,
      password: password.trim(),
      first_name: fullName.trim(),
      language: 'fa',
      is_admin: false,
      is_blocked: false,
      created_at: new Date().toISOString(),
      last_seen: new Date().toISOString(),
    };

    const { data, error } = await supabase.from('users').insert([newUser]).select().single();
    if (error) throw error;

    const authUser: AuthUser = {
      id: data.id,
      username: data.username,
      email: cleanEmail,
      first_name: data.first_name,
      is_admin: false,
    };

    return { success: true, user: authUser };
  } catch (err: any) {
    return { success: false, error: err.message || 'خطا در ثبت نام کاربر' };
  }
}

// 6.1 Send OTP Code — needs backend for email sending
export async function sendOtpEmail(
  email: string,
  purpose: 'reset' | 'register' | 'login' = 'reset'
): Promise<{ success: boolean; message?: string; debugCode?: string; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();

  // تولید کد ۶ رقمی
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  try {
    // ذخیره کد در Supabase (اگر جدول otp_codes وجود داشته باشد)
    const { error } = await supabase.from('otp_codes').insert([{
      email: cleanEmail,
      code,
      purpose,
      expires_at: expiresAt,
      created_at: new Date().toISOString(),
    }]);

    if (error) {
      // جدول وجود ندارد — fallback: پیام خطا
      return { success: false, error: 'برای دریافت کد تایید به ایمیل، سرور بک‌اند لازم است.' };
    }

    // تلاش برای اطلاع به ادمین از طریق تلگرام (چون ایمیل ارسال نمی‌شود)
    notifyTelegramAdmins(
      `🔐 <b>کد تایید ورود</b>\n\n📧 ایمیل: <code>${cleanEmail}</code>\n🔢 کد: <code>${code}</code>\n🎯 هدف: ${purpose}`
    );

    return {
      success: true,
      message: 'کد تایید در سیستم ثبت شد. (بدون بک‌اند، ایمیل ارسال نمی‌شود — کد به تلگرام ادمین رفت)',
    };
  } catch (e: any) {
    return { success: false, error: e.message || 'خطا در ارسال کد تایید به ایمیل' };
  }
}

// 6.2 Verify OTP Code
export async function verifyOtpCode(
  email: string,
  code: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanCode = code.trim();

  try {
    const { data, error } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('email', cleanEmail)
      .eq('code', cleanCode)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return { success: false, error: 'کد تایید اشتباه است یا منقضی شده است' };
    }

    return { success: true, message: 'کد تایید صحیح است.' };
  } catch (e: any) {
    return { success: false, error: e.message || 'کد تایید اشتباه است یا منقضی شده است' };
  }
}

// 6.3 Reset Password using OTP
export async function resetPasswordWithOtp(
  email: string,
  code: string,
  newPassword: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanCode = code.trim();

  try {
    const { data: otpRow, error: otpErr } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('email', cleanEmail)
      .eq('code', cleanCode)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (otpErr) throw otpErr;
    if (!otpRow) {
      return { success: false, error: 'کد تایید اشتباه است یا منقضی شده است' };
    }

    const { error: updErr } = await supabase
      .from('users')
      .update({ password: newPassword.trim() })
      .or(`email.ilike.${cleanEmail},username.ilike.${cleanEmail}`);

    if (updErr) throw updErr;

    await supabase.from('otp_codes').delete().eq('id', otpRow.id);

    return { success: true, message: 'رمز عبور با موفقیت تغییر یافت.' };
  } catch (e: any) {
    return { success: false, error: e.message || 'خطا در تغییر رمز عبور' };
  }
}

// 7. Get Client Orders by user or tracking code
export async function getClientOrders(
  user?: AuthUser | null,
  trackingQuery?: string
): Promise<{ success: boolean; orders: Order[] }> {
  try {
    let query = supabase.from('orders').select('*').order('created_at', { ascending: false });

    if (trackingQuery && trackingQuery.trim()) {
      const q = trackingQuery.trim();
      query = query.or(`order_code.ilike.%${q}%,contact.ilike.%${q}%`);
    } else if (user) {
      query = query.or(`user_id.eq.${user.id},username.ilike.%${user.username}%`);
    } else {
      return { success: true, orders: [] };
    }

    const { data, error } = await query;
    if (error) throw error;
    return { success: true, orders: (data || []) as Order[] };
  } catch (err: any) {
    return { success: false, orders: [] };
  }
}

// 8. Admin Login  —  ⚠️ رمز Mohmah123 دست‌نخورده
export async function adminLogin(password: string): Promise<{ success: boolean; token?: string; error?: string }> {
  if (password === 'Mohmah123' || password === 'mohmah123') {
    return { success: true, token: 'ritm_admin_token_mohmah123' };
  }

  // بررسی رمزهای دیگر در جدول ادمین‌ها
  try {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('is_admin', true)
      .eq('password', password)
      .maybeSingle();

    if (data) {
      return { success: true, token: 'ritm_admin_token_' + data.id };
    }
  } catch (e) {}

  return { success: false, error: 'رمز عبور مدیریت نادرست است.' };
}

// 9. Messages
export async function getOrderMessages(orderId: number | string): Promise<{ success: boolean; messages: OrderMessage[] }> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('order_id', Number(orderId))
      .order('created_at', { ascending: true });

    if (error) throw error;
    return { success: true, messages: (data || []) as OrderMessage[] };
  } catch (err: any) {
    return { success: false, messages: [] };
  }
}

export async function sendMessage(
  orderId: number | string | null,
  text: string,
  fromAdmin: boolean,
  toTelegramId?: number | null
): Promise<{ success: boolean; message?: OrderMessage; error?: string }> {
  try {
    const newMsg = {
      order_id: orderId ? Number(orderId) : null,
      text: text.trim(),
      from_admin: fromAdmin,
      to_telegram_id: toTelegramId || null,
      from_telegram_id: fromAdmin ? ADMIN_CHAT_IDS[0] : null,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from('messages').insert([newMsg]).select().single();
    if (error) throw error;

    if (toTelegramId && toTelegramId > 0) {
      fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: toTelegramId,
          text: `💬 <b>پیام از تیم مدیریت ریتم:</b>\n\n${text.trim()}`,
          parse_mode: 'HTML',
        }),
      }).catch(() => {});
    }

    return { success: true, message: data as OrderMessage };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// 10. System Status / Health
export async function getSystemStatus(): Promise<any> {
  try {
    const [{ count: ordersCount }, { count: usersCount }] = await Promise.all([
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }),
    ]);

    return {
      success: true,
      status: 'operational',
      database: 'Supabase PostgreSQL Online',
      metrics: {
        totalOrders: ordersCount || 0,
        totalUsers: usersCount || 0,
        storageUsedMB: 0,
        storageMaxMB: 1024,
      },
    };
  } catch (e: any) {
    return {
      success: false,
      status: 'degraded',
      database: 'Disconnected',
      metrics: {
        totalOrders: 0,
        totalUsers: 0,
        storageUsedMB: 0,
        storageMaxMB: 1024,
      },
    };
  }
}

// 11. Online Project Discussion & Chat (مستقیم از Supabase)
export async function getChatMessages(
  orderCode?: string,
  userId?: number,
  all?: boolean
): Promise<{ success: boolean; messages: any[]; error?: string }> {
  try {
    let query = supabase.from('chat_messages').select('*').order('created_at', { ascending: true });

    if (orderCode) {
      query = query.eq('order_code', orderCode);
    }
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return { success: true, messages: data || [] };
  } catch (err: any) {
    return { success: false, messages: [], error: err.message };
  }
}

export async function sendChatMessage(data: {
  orderCode?: string;
  userId?: number | null;
  clientName?: string;
  senderRole: 'client' | 'admin';
  text: string;
}): Promise<{ success: boolean; message?: any; error?: string }> {
  try {
    const row = {
      order_code: data.orderCode || null,
      user_id: data.userId || null,
      client_name: data.clientName || null,
      sender_role: data.senderRole,
      text: data.text.trim(),
      is_read: false,
      created_at: new Date().toISOString(),
    };

    const { data: inserted, error } = await supabase
      .from('chat_messages')
      .insert([row])
      .select()
      .single();

    if (error) throw error;
    return { success: true, message: inserted };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getChatConversations(): Promise<{
  success: boolean;
  conversations: any[];
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('order_code, user_id, client_name, text, created_at, sender_role')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // ساخت لیست یکتا از مکالمات
    const seen = new Set<string>();
    const conversations: any[] = [];
    for (const row of data || []) {
      const key = row.order_code || `user-${row.user_id}` || 'unknown';
      if (!seen.has(key)) {
        seen.add(key);
        conversations.push(row);
      }
    }

    return { success: true, conversations };
  } catch (err: any) {
    return { success: false, conversations: [], error: err.message };
  }
}

export async function markChatRead(
  orderCode?: string,
  readerRole: 'admin' | 'client' = 'admin'
): Promise<{ success: boolean }> {
  try {
    let query = supabase.from('chat_messages').update({ is_read: true }).eq('sender_role', readerRole === 'admin' ? 'client' : 'admin');
    if (orderCode) {
      query = query.eq('order_code', orderCode);
    }
    const { error } = await query;
    return { success: !error };
  } catch {
    return { success: false };
  }
}
