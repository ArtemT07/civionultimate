import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'owner' | 'admin' | 'materials_manager';

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  preferred_language: string;
  created_at: string;
  updated_at: string;
};

export type Role = {
  id: string;
  user_id: string;
  role: UserRole;
  assigned_by: string | null;
  created_at: string;
};

export type MaterialCategory = {
  id: string;
  name_es: string;
  name_en: string;
  description_es: string | null;
  description_en: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type Material = {
  id: string;
  category_id: string;
  name_es: string;
  name_en: string;
  description_es: string | null;
  description_en: string | null;
  photo_url: string | null;
  store_price: number;
  company_profit_price: number;
  discount_price: number;
  labor_price: number;
  final_price: number;
  unit: string;
  is_base_material: boolean;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type Project = {
  id: string;
  user_id: string;
  name: string;
  area: number;
  project_type: 'residential' | 'commercial';
  base_cost: number;
  materials_cost: number;
  total_cost: number;
  selected_materials: any[];
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type AnalyticsEvent = {
  id: string;
  event_type: 'page_visit' | 'calculator_use' | 'contact_form' | 'project_created';
  user_id: string | null;
  page_name: string | null;
  metadata: any;
  created_at: string;
};

export const trackAnalytics = async (
  eventType: AnalyticsEvent['event_type'],
  pageName?: string,
  metadata?: any
) => {
  try {
    await supabase.rpc('track_analytics', {
      p_event_type: eventType,
      p_page_name: pageName || null,
      p_metadata: metadata || {},
    });
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
};
