import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// Función recursiva que crea un proxy seguro para evitar crashes
// cuando las variables de entorno no están configuradas
const createNoOpProxy = () => {
  const handler = {
    get: (_target, _prop) => createNoOpProxy(),
    apply: (_target, _thisArg, _args) => createNoOpProxy(),
  };
  // El target es una función para que funcione tanto como objeto como como función
  return new Proxy(function () {}, handler);
};

let realClient = null;

if (supabaseUrl && supabaseAnonKey) {
  try {
    realClient = createClient(supabaseUrl, supabaseAnonKey);
  } catch (e) {
    console.error('❌ Error al inicializar Supabase:', e);
  }
} else {
  console.warn('⚠️ Supabase: Variables de entorno no encontradas. La app funcionará sin base de datos.');
}

// Exportamos el cliente real si existe, o un proxy seguro en caso contrario
export const supabase = realClient ?? createNoOpProxy();
