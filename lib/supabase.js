import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

let client = null;
if (supabaseUrl && supabaseAnonKey) {
  try {
    client = createClient(supabaseUrl, supabaseAnonKey);
  } catch (e) {
    console.error('Error al inicializar Supabase:', e);
  }
}

// Proxy de seguridad ultra-robusto
// Si el cliente no existe, devuelve funciones que se devuelven a sí mismas (chaining)
const createSafeProxy = () => {
  const handler = {
    get: (target, prop) => {
      if (client && client[prop]) return client[prop];
      
      // Si llegamos aquí, o no hay cliente o la prop no existe
      // Devolvemos una función "muda" que permite seguir encadenando
      return (...args) => new Proxy({}, handler);
    }
  };
  return new Proxy({}, handler);
};

export const supabase = createSafeProxy();

if (!client && typeof window !== 'undefined') {
  console.warn('⚠️ Supabase: Falta configuración en Environment Variables.');
}
