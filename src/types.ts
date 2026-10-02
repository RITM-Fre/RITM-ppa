export type ProjectType = 'video' | 'web' | 'mobile' | 'other';

export type OrderStatus = 'new' | 'approved' | 'in_progress' | 'completed' | 'rejected' | 'cancelled';

export interface Order {
  id: number;
  order_code: string;
  user_id?: number | null;
  telegram_id: number;
  username?: string | null;
  full_name: string;
  contact: string;
  contact_type: string;
  project_type: ProjectType;
  budget?: string | null;
  description: string;
  preferred_contact?: string | null;
  deadline?: string | null;
  status: OrderStatus;
  admin_notes?: string | null;
  attached_file_name?: string | null;
  attached_file_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PortfolioProject {
  id: string;
  category: ProjectType;
  type: 'video' | 'image';
  titleFa: string;
  titleEn: string;
  descFa: string;
  descEn: string;
  tags: string[];
  image: string;
  mediaUrl?: string;
  posterUrl?: string;
}

export interface User {
  id: number;
  telegram_id: number;
  username?: string | null;
  email?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  language: string;
  is_admin: boolean;
  is_blocked: boolean;
  created_at: string;
  last_seen: string;
}

export interface AuthUser {
  id: number;
  username: string;
  email?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  is_admin?: boolean;
}

export interface OrderMessage {
  id: number;
  order_id?: number | null;
  from_admin: boolean;
  from_telegram_id?: number | null;
  to_telegram_id?: number | null;
  text: string;
  created_at: string;
}

export interface ProjectChatMessage {
  id: string;
  orderCode?: string;
  userId?: number | null;
  clientName: string;
  senderRole: 'client' | 'admin';
  text: string;
  createdAt: string;
  read: boolean;
}

export interface ChatConversation {
  orderCode: string;
  clientName: string;
  userId?: number | null;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  projectType?: ProjectType;
  orderStatus?: OrderStatus;
}

export interface BotState {
  step: 'idle' | 'awaiting_category' | 'awaiting_name' | 'awaiting_contact' | 'awaiting_budget' | 'awaiting_deadline' | 'awaiting_description' | 'awaiting_confirm';
  tempOrder: Partial<Order>;
  lastInteraction: number;
}

export interface ServiceDetail {
  id: ProjectType;
  titleFa: string;
  titleEn: string;
  descFa: string;
  descEn: string;
  badge: string;
  featuresFa: string[];
  featuresEn: string[];
  startingPrice: string;
  deliveryTime: string;
  icon: string;
}
