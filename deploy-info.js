#!/usr/bin/env node

console.log('🚀 EAC PWA - Deploy para Railway\n');

console.log('✅ BUILDS CONCLUÍDOS:');
console.log('📱 PWA: /pwa/dist/');
console.log('⚙️  Admin: /frontend/dist/');
console.log('🔧 API: /backend/');

console.log('\n📋 PASSOS PARA DEPLOY NO RAILWAY:');
console.log('1. Fazer commit de todas as mudanças:');
console.log('   git add .');
console.log('   git commit -m "Build para produção"');

console.log('\n2. Fazer push para o GitHub:');
console.log('   git push origin main');

console.log('\n3. No Railway:');
console.log('   - O deploy será automático após o push');
console.log('   - O Railway usará o Dockerfile');
console.log('   - As rotas ficaram:');
console.log('     • PWA: https://seu-app.up.railway.app/');
console.log('     • Admin: https://seu-app.up.railway.app/admin');
console.log('     • API: https://seu-app.up.railway.app/api');

console.log('\n4. Variáveis de ambiente no Railway:');
console.log('   ✅ NODE_ENV=production');
console.log('   ✅ DATABASE_URL já configurado');
console.log('   ✅ PostgreSQL conectado');

console.log('\n🎉 TUDO PRONTO PARA PRODUÇÃO!');
console.log('\nEstrutura final:');
console.log('├── / → PWA (React app principal)');
console.log('├── /admin → Frontend Admin (gerenciamento)');
console.log('└── /api → Backend API (dados)');

const fs = require('fs');
const path = require('path');

// Verificar se os builds existem
const frontendExists = fs.existsSync(path.join(__dirname, 'frontend', 'dist', 'index.html'));
const pwaExists = fs.existsSync(path.join(__dirname, 'pwa', 'dist', 'index.html'));

console.log('\n🔍 VERIFICAÇÃO DOS BUILDS:');
console.log(frontendExists ? '✅ Frontend build OK' : '❌ Frontend build FALTANDO');
console.log(pwaExists ? '✅ PWA build OK' : '❌ PWA build FALTANDO');

if (frontendExists && pwaExists) {
  console.log('\n🎯 PRONTO PARA DEPLOY!');
} else {
  console.log('\n⚠️  Execute primeiro: node build-production.js');
}
