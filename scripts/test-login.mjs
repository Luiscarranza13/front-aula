#!/usr/bin/env node
// Script de diagnóstico de login — NovaTec Aula Virtual
// Ejecutar: node scripts/test-login.mjs

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

// Leer .env manualmente
function loadEnv(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const vars = {};
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      vars[key] = val;
    }
    return vars;
  } catch {
    return {};
  }
}

const env = {
  ...loadEnv(path.join(rootDir, '.env')),
  ...loadEnv(path.join(rootDir, '.env.local')),
};

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// ---------------------- DIAGNÓSTICO ----------------------
console.log('\n================================');
console.log('🔍 NovaTec — Diagnóstico de Login');
console.log('================================\n');

// 1. Verificar variables de entorno
console.log('📋 1. Variables de entorno:');
console.log(`   SUPABASE_URL:  ${SUPABASE_URL ? '✅ ' + SUPABASE_URL : '❌ NO ENCONTRADA'}`);
console.log(`   SUPABASE_KEY:  ${SUPABASE_KEY ? '✅ ' + SUPABASE_KEY.slice(0, 20) + '...' : '❌ NO ENCONTRADA'}`);
console.log();

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.log('❌ DIAGNÓSTICO FINAL: Faltan variables de entorno. El login nunca funcionará.');
  process.exit(1);
}

// 2. Crear cliente real
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 3. Probar conectividad básica
console.log('📡 2. Probando conectividad con Supabase...');
try {
  const { data, error } = await supabase.from('usuarios').select('count').limit(1);
  if (error) {
    console.log(`   ❌ Error al conectar a tabla 'usuarios': ${error.message}`);
    console.log(`   💡 Posible causa: La tabla no existe o las políticas RLS bloquean el acceso.`);
    
    // Probar con otra tabla en inglés
    console.log(`   🔄 Intentando con tabla 'profiles'...`);
    const { data: d2, error: e2 } = await supabase.from('profiles').select('count').limit(1);
    if (e2) {
      console.log(`   ❌ Error también en 'profiles': ${e2.message}`);
    } else {
      console.log(`   ✅ La tabla 'profiles' SÍ existe y responde.`);
    }
  } else {
    console.log(`   ✅ Tabla 'usuarios' responde correctamente.`);
  }
} catch (e) {
  console.log(`   ❌ Error de red: ${e.message}`);
}
console.log();

// 4. Probar login
const TEST_EMAIL = 'admin2@gmail.com';
const TEST_PASSWORD = 'novatec123';

console.log(`🔐 3. Probando login con: ${TEST_EMAIL} / ${TEST_PASSWORD}`);
try {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });

  if (error) {
    console.log(`   ❌ Error de autenticación: ${error.message}`);
    console.log(`   💡 Código: ${error.status || 'N/A'}`);
    if (error.message.includes('Invalid login credentials')) {
      console.log(`   💡 El usuario no existe en este proyecto de Supabase o la contraseña es incorrecta.`);
    }
  } else {
    console.log(`   ✅ Login exitoso!`);
    console.log(`   👤 Usuario: ${data.user.email} (ID: ${data.user.id})`);
    console.log(`   🎟️  Token:   ${data.session.access_token.slice(0, 30)}...`);
    
    // 5. Probar carga de perfil
    console.log('\n👥 4. Cargando perfil del usuario...');
    const { data: profile, error: pErr } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle();
    
    if (pErr) {
      console.log(`   ❌ Error al cargar perfil: ${pErr.message}`);
    } else if (!profile) {
      console.log(`   ⚠️ Usuario autenticado pero SIN perfil en tabla 'usuarios'.`);
      console.log(`   💡 El login funcionará pero el rol no se detectará correctamente.`);
    } else {
      console.log(`   ✅ Perfil cargado: ${JSON.stringify(profile, null, 2)}`);
    }
    
    // Cerrar sesión
    await supabase.auth.signOut();
  }
} catch (e) {
  console.log(`   ❌ Excepción inesperada: ${e.message}`);
  console.log(`   Stack: ${e.stack}`);
}

console.log('\n================================');
console.log('✔  Diagnóstico completo.');
console.log('================================\n');
