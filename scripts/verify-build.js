#!/usr/bin/env node

// Script para verificar que el build use la URL correcta del backend
const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando configuración del build...');

// 1. Verificar variables de entorno
const envProd = path.join(__dirname, '../.env.production');
if (fs.existsSync(envProd)) {
    const content = fs.readFileSync(envProd, 'utf8');
    console.log('📄 Contenido de .env.production:');
    console.log(content);
    
    if (content.includes('https://backend-aula-production.up.railway.app')) {
        console.log('✅ Variable de entorno correcta');
    } else {
        console.log('❌ Variable de entorno incorrecta');
        process.exit(1);
    }
} else {
    console.log('❌ Archivo .env.production no encontrado');
    process.exit(1);
}

// 2. Verificar next.config.mjs
const nextConfig = path.join(__dirname, '../next.config.mjs');
if (fs.existsSync(nextConfig)) {
    const content = fs.readFileSync(nextConfig, 'utf8');
    console.log('📄 Contenido de next.config.mjs:');
    console.log(content);
}

// 3. Verificar api-new.js
const apiNew = path.join(__dirname, '../lib/api-new.js');
if (fs.existsSync(apiNew)) {
    const content = fs.readFileSync(apiNew, 'utf8');
    if (content.includes('https://backend-aula-production.up.railway.app')) {
        console.log('✅ api-new.js tiene la URL correcta');
    } else {
        console.log('❌ api-new.js tiene URL incorrecta');
        process.exit(1);
    }
} else {
    console.log('❌ Archivo api-new.js no encontrado');
    process.exit(1);
}

console.log('✅ Todas las verificaciones pasaron');
console.log('🚀 El build debería usar la URL correcta del backend');