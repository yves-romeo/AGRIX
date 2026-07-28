import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(url, anonKey, {
  auth: { persistSession: false },
});

export interface CropRow {
  id: string;
  crop_name: string;
  quantity_kg: number;
  location: string;
  created_at: string;
}
