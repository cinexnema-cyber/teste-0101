import { createClient } from '@supabase/supabase-js';

// Environment variables with fallbacks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gardjxolnrykvxxtatdq.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhcmRqeG9sbnJ5a3Z4eHRhdGRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzNzY3MjcsImV4cCI6MjA3MDk1MjcyN30.0qkhDmTyXsc8U63t1UTh5fV1UCOfzjH7Q0hO2GNj6sQ';

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key exists:', !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase environment variables are missing');
  throw new Error('Supabase configuration is required');
}

// Create Supabase client with additional options
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});

// Test connection
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('CineXnema').select('count').limit(1);
    if (error) {
      console.warn('Supabase connection test failed:', error.message);
      return false;
    }
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.warn('⚠️ Supabase connection error:', error);
    return false;
  }
};

// Database types
export interface User {
  id?: string; // Supabase Auth UUID
  user_id: string; // Database table UUID
  username: string;
  email: string;
  displayName: string;
  bio?: string;
  passwordHash?: string;
  subscriptionStatus: 'ativo' | 'inativo';
  subscriptionStart?: Date;
  subscriptionPlan?: 'monthly' | 'yearly';
  comissaoPercentual: number;
  confirmationLink?: string; // For email confirmation
}

export interface Subscription {
  id: string;
  user_id: string;
  status: 'active' | 'inactive' | 'cancelled' | 'trial';
  plan_type: 'monthly' | 'yearly';
  start_date: string;
  end_date: string;
  payment_method?: string;
  created_at: string;
  updated_at: string;
}
