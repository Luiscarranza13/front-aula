#!/usr/bin/env node

// Script para probar la conexión con el backend antes del build
const https = require('https');

const BACKEND_URL = 'https://backend-aula-production.up.railway.app';

console.log('🔍 Probando conexión con el backend...');
console.log(`📡 URL: ${BACKEND_URL}`);

// Test 1: Health check
function testHealthCheck() {
  return new Promise((resolve, reject) => {
    const req = https.get(`${BACKEND_URL}/health`, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Health check: OK');
          resolve(JSON.parse(data));
        } else {
          console.log(`❌ Health check: ${res.statusCode}`);
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ Health check: ${error.message}`);
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      console.log('❌ Health check: Timeout');
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

// Test 2: Courses endpoint
function testCoursesEndpoint() {
  return new Promise((resolve, reject) => {
    const req = https.get(`${BACKEND_URL}/courses`, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          const courses = JSON.parse(data);
          console.log(`✅ Courses endpoint: ${courses.length} cursos disponibles`);
          resolve(courses);
        } else {
          console.log(`❌ Courses endpoint: ${res.statusCode}`);
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ Courses endpoint: ${error.message}`);
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      console.log('❌ Courses endpoint: Timeout');
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

// Ejecutar tests
async function runTests() {
  console.log('\n🚀 Iniciando tests de conectividad...\n');
  
  let healthOk = false;
  let coursesOk = false;
  
  try {
    await testHealthCheck();
    healthOk = true;
  } catch (error) {
    console.log(`⚠️  Health check falló: ${error.message}`);
  }
  
  try {
    await testCoursesEndpoint();
    coursesOk = true;
  } catch (error) {
    console.log(`⚠️  Courses endpoint falló: ${error.message}`);
  }
  
  console.log('\n📊 Resumen de tests:');
  console.log(`   Health Check: ${healthOk ? '✅ OK' : '❌ FAIL'}`);
  console.log(`   Courses API: ${coursesOk ? '✅ OK' : '❌ FAIL'}`);
  
  if (healthOk && coursesOk) {
    console.log('\n🎉 ¡Backend funcionando correctamente!');
    console.log('✅ El frontend podrá conectarse sin problemas');
  } else if (healthOk) {
    console.log('\n⚠️  Backend parcialmente funcional');
    console.log('🔄 El sistema usará datos de fallback para cursos');
  } else {
    console.log('\n❌ Backend no disponible');
    console.log('💾 El sistema usará completamente datos mock');
  }
  
  console.log(`\n🔗 Para verificar manualmente: ${BACKEND_URL}/courses`);
  console.log('🏗️  Continuando con el build...\n');
}

runTests().catch(console.error);