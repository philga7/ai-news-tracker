import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Detect if we are in a Vite environment
const isVite = typeof import.meta !== 'undefined' && import.meta.env;

if (!isVite) {
  // Only configure dotenv when running outside of Vite
  dotenv.config({path: '.env'});
}

const supabaseUrl = isVite ? import.meta.env.VITE_SUPABASE_URL : process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = isVite ? import.meta.env.VITE_SUPABASE_ANON_KEY : process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = isVite ? import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY : process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  throw new Error("Missing Supabase environment variables.");
}

// Client for anonymous and authenticated users
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client with service role for backend operations (use this for scripts)
export const supabaseAdmin = createClient(
  isVite ? import.meta.env.VITE_SUPABASE_URL : process.env.NEXT_PUBLIC_SUPABASE_URL,
  isVite ? import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY : process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

// Type for article records
export type Article = {
  id?: string;
  title: string;
  url: string;
  original_url?: string;
  source: string;
  timestamp: string;
  category: string;
  is_cfp?: boolean;
};

// Helper functions for articles table
export const articlesTable = {
  // Non-privileged operations
  async getRecentArticles(limit = 20) {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  },

  async getCFPArticles(limit = 20) {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('is_cfp', true)
      .order('timestamp', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  },

  // Admin operations
  async upsertArticle(article: Article) {
    const { data, error } = await supabaseAdmin
      .from('articles')
      .upsert(article, { onConflict: 'url' })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteArticle(url: string) {
    const { error } = await supabaseAdmin
      .from('articles')
      .delete()
      .eq('url', url);
    
    if (error) throw error;
  }
};
