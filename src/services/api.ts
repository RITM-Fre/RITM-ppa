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

  // Attempt 1: Call backend API
  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...orderData,
        contact_type: validContactType,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.order) {
        return { success: true, order: data.order };
      }
    }
  } catch (backendErr) {
    console.warn('Backend /api/orders failed, falling back to direct Supabase insert:', backendErr);
  }

  // Attempt 2: Fallback to direct Supabase insert
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

    // Send instant Telegram notification to admins
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
    console.error('createOrder fallback error:', err);
    return { success: false, error: err.message || 'خطا در ثبت سفارش در پایگاه داده' };
  }
}

// 2.1 Upload Media (Photos & Videos from website directly to Telegram!)
export async function uploadOrderMedia(payload: {
  orderCode?: string;
  clientName?: string;
  contact?: string;
  fileName: string;
  fileType: string;
  fileBase64: string;
  caption?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/upload-media', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return { success: Boolean(data.success), error: data.error };
  } catch (err: any) {
    console.error('uploadOrderMedia error:', err);
    return { success: false, error: err.message || 'خطا در ارسال فایل به تلگرام' };
  }
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

    // Notify Telegram if telegram_id exists
    if (notifyClient && data && data.telegram_id && data.telegram_id > 0) {
      const statusLabels: Record<string, string> = {
        approved: 'تایید شده (در نوبت اجرا)',
        in_progress: 'در حال طراحی و پیاده‌سازی',
        completed: 'تکمیل و تحویل نهایی',
        rejected: 'رد شده',
        cancelled: 'لغو شده',
      };
      const text = `📢 <b>بروزرسانی وضعیت سفارش ${data.order_code}</b>\n\nوضعیت جدید: <b>${statusLabels[status] || status}</b>\n${adminNotes ? `یادداشت مدیریت: ${adminNotes}` : ''}`;
      try {
        fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: data.telegram_id,
            text,
            parse_mode: 'HTML',
          }),
        }).catch(() => {});
      } catch (e) {}
    }

    return { success: true, order: data as Order };
  } catch (err: any) {
    return { success: false, error: err.message };
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
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      const data = await res.json();
      return { success: data.success };
    }
  } catch (err) {
    console.warn('Backend delete user failed, attempting direct Supabase deletion:', err);
  }

  try {
    await supabase.from('orders').update({ user_id: null }).eq('user_id', userId);
    const { error } = await supabase.from('users').delete().eq('id', userId);
    if (error) throw error;
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message || 'خطا در حذف کاربر' };
  }
}

// 5. Client Login (Using Email)
export async function clientLogin(
  emailOrUsername: string,
  password?: string
): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  const cleanEmail = emailOrUsername.trim().toLowerCase();

  // Attempt 1: Call backend API
  try {
    const res = await fetch('/api/auth/client-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, password: (password || '').trim() }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.success && data.user) {
      return {
        success: true,
        user: {
          id: data.user.id,
          username: data.user.username,
          email: data.user.email || cleanEmail,
          first_name: data.user.first_name,
          last_name: data.user.last_name,
          is_admin: data.user.is_admin,
        },
      };
    } else if (data.message) {
      return { success: false, error: data.message };
    }
  } catch (backendErr) {
    console.warn('Backend login fallback:', backendErr);
  }

  // Attempt 2: Direct Supabase query
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .ilike('username', cleanEmail)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return { success: false, error: 'کاربری با این مشخصات یا ایمیل یافت نشد.' };
    }

    if (password && data.password && data.password !== password.trim()) {
      return { success: false, error: 'رمز عبور نادرست است.' };
    }

    const authUser: AuthUser = {
      id: data.id,
      username: data.username || cleanEmail,
      email: cleanEmail,
      first_name: data.first_name,
      last_name: data.last_name,
      is_admin: data.is_admin,
    };

    return { success: true, user: authUser };
  } catch (err: any) {
    return { success: false, error: err.message || 'خطا در ورود به حساب' };
  }
}

// 6. Client Register (With Unique Email)
export async function clientRegister(
  emailOrUsername: string,
  password: string,
  fullName: string
): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  const cleanEmail = emailOrUsername.trim().toLowerCase();

  // Basic check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return { success: false, error: 'لطفاً یک آدرس ایمیل معتبر وارد کنید (مثال: user@example.com).' };
  }

  // Attempt 1: Call backend API
  try {
    const res = await fetch('/api/auth/client-register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: cleanEmail,
        password: password.trim(),
        full_name: fullName.trim(),
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.success && data.user) {
      return {
        success: true,
        user: {
          id: data.user.id,
          username: data.user.username,
          email: data.user.email || cleanEmail,
          first_name: data.user.first_name,
          last_name: data.user.last_name,
          is_admin: false,
        },
      };
    } else if (data.message) {
      return { success: false, error: data.message };
    }
  } catch (backendErr) {
    console.warn('Backend register fallback:', backendErr);
  }

  // Attempt 2: Direct Supabase insert with duplicate email check
  try {
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .ilike('username', cleanEmail)
      .maybeSingle();

    if (existing) {
      return { success: false, error: 'این ایمیل قبلاً در سایت ثبت شده است. لطفاً وارد حساب خود شوید.' };
    }

    const newUser = {
      username: cleanEmail,
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

// 8. Admin Login
export async function adminLogin(password: string): Promise<{ success: boolean; token?: string; error?: string }> {
  if (password === 'Mohmah123' || password === 'mohmah123') {
    return { success: true, token: 'ritm_admin_token_mohmah123' };
  }

  // Also check if matches any admin in users table
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

    // Send directly to Telegram bot if recipient has telegram_id
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
export async function getSystemStatus(): Promise<{
  success: boolean;
  status: string;
  database: string;
  telegramBot: string;
  totalOrders: number;
  totalUsers: number;
}> {
  try {
    const [{ count: ordersCount }, { count: usersCount }] = await Promise.all([
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }),
    ]);

    return {
      success: true,
      status: 'operational',
      database: 'Supabase PostgreSQL Online',
      telegramBot: '@RITM_FreeLancbot Active',
      totalOrders: ordersCount || 0,
      totalUsers: usersCount || 0,
    };
  } catch (e: any) {
    return {
      success: false,
      status: 'degraded',
      database: 'Disconnected',
      telegramBot: 'Unknown',
      totalOrders: 0,
      totalUsers: 0,
    };
  }
}
