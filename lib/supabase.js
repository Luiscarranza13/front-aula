import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// NON-THENABLE safe no-op proxy:
// Retorna undefined para 'then'/'catch'/'finally' para que await no se cuelgue
const createNoOpProxy = () => {
  const PROMISE_PROPS = new Set(['then', 'catch', 'finally']);
  const SYMBOL_PROPS = new Set([
    Symbol.toPrimitive, Symbol.iterator, Symbol.asyncIterator,
    Symbol.toStringTag, Symbol.hasInstance,
  ]);
  
  const handler = {
    get: (_target, prop) => {
      // Crítico: retornar undefined para props de Promise
      // Si no, `await noOpProxy` cuelga infinitamente
      if (PROMISE_PROPS.has(prop)) return undefined;
      if (SYMBOL_PROPS.has(prop)) return undefined;
      return createNoOpProxy();
    },
    apply: (_target, _thisArg, _args) => createNoOpProxy(),
    construct: (_target, _args) => createNoOpProxy(),
  };
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
