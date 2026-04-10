import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

let client = null;
if (supabaseUrl && supabaseAnonKey) {
  client = createClient(supabaseUrl, supabaseAnonKey);
}

// Proxy de seguridad para evitar crashes en tiempo de build si faltan las variables
export const supabase = new Proxy({}, {
  get: (target, prop) => {
    if (client) return client[prop];
    return (...args) => {
      console.error(`Supabase Error: Se intentó llamar a "${String(prop)}" pero las variables de entorno no están configuradas.`);
      return { data: null, error: { message: 'Configuración faltante' }, count: 0 };
    };
  }
});

if (!client && typeof window !== 'undefined') {
  console.warn('Supabase client not initialized: Missing environment variables.');
}
