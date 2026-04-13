import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'traveler' | 'local' | 'admin';

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string | null;
  trust_score: number;
  location: string | null;
  verified: boolean;
  is_blocked?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Query {
  id: string;
  traveler_id: string;
  location: string;
  category: 'safety' | 'price' | 'route' | 'food' | 'scam';
  question: string;
  is_anonymous: boolean;
  status: 'open' | 'answered' | 'resolved';
  created_at: string;
  profiles?: Profile;
  ai_scam_risk?: 'low' | 'medium' | 'high';
  ai_safety_tips?: string[];
  ai_explanation?: string;
  ai_confidence?: number;
}

export interface Answer {
  id: string;
  query_id: string;
  local_id: string;
  answer_text: string;
  helpful_count: number;
  rating?: number;
  created_at: string;
  profiles?: Profile;
}

export interface Rating {
  id: string;
  answer_id: string;
  traveler_id: string;
  rating: number;
  feedback?: string;
  created_at: string;
}

export interface Verification {
  id: string;
  local_id: string;
  document_type: 'id' | 'address_proof';
  document_url: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export interface ScamReport {
  id: string;
  reporter_id: string | null;
  location: string;
  description: string;
  status: 'pending' | 'verified' | 'dismissed';
  created_at: string;
}

export interface AdminLog {
  id: string;
  admin_id: string;
  action: string;
  target_id: string | null;
  details?: any;
  timestamp: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'answer' | 'verification' | 'system' | 'helpful';
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  created_at: string;
  metadata?: any;
}
