#!/usr/bin/env node

console.log('🚀 RAILWAY DEPLOY - SOLUCIONANDO PROBLEMA\n');

console.log('❌ PROBLEMA IDENTIFICADO:');
console.log('- Repository not found ou problema de autenticação no GitHub\n');

console.log('🔧 SOLUÇÕES ALTERNATIVAS:\n');

console.log('1️⃣ OPÇÃO 1 - Deploy direto via Railway CLI:');
console.log('   railway login');
console.log('   railway link [seu-projeto-id]');
console.log('   railway up');

console.log('\n2️⃣ OPÇÃO 2 - Deploy via GitHub (recomendado):');
console.log('   a) Verificar se o repositório existe no GitHub');
console.log('   b) Reautenticar no Git:');
console.log('      git config --global user.name "Seu Nome"');
console.log('      git config --global user.email "seu@email.com"');
console.log('   c) Tentar push novamente:');
console.log('      git push origin master');

console.log('\n3️⃣ OPÇÃO 3 - Usar Railway GitHub Integration:');
console.log('   a) Criar/atualizar repositório no GitHub');
console.log('   b) Conectar Railway ao repositório');
console.log('   c) Deploy automático será ativado');

console.log('\n🎯 ARQUIVOS IMPORTANTES PARA O DEPLOY:');
console.log('✅ Dockerfile criado');
console.log('✅ .railwayignore criado'); 
console.log('✅ Frontend build em /frontend/dist/');
console.log('✅ PWA build em /pwa/dist/');
console.log('✅ Backend em /backend/');

console.log('\n🔑 VARIÁVEIS DE AMBIENTE NO RAILWAY:');
console.log('NODE_ENV=production');
console.log('PORT=3000 (automático)');
console.log('DATABASE_URL=(já configurado)');

console.log('\n📝 COMANDO PARA TESTE LOCAL:');
console.log('cd "e:\\Projetos\\NOVO" && npm start');

console.log('\n🌐 ENDPOINTS APÓS DEPLOY:');
console.log('• PWA: https://seu-app.up.railway.app/');
console.log('• Admin: https://seu-app.up.railway.app/admin');
console.log('• API: https://seu-app.up.railway.app/api');

const path = require('path');
const fs = require('fs');

// Verificar builds
const frontendBuild = fs.existsSync(path.join(__dirname, 'frontend', 'dist', 'index.html'));
const pwaBuild = fs.existsSync(path.join(__dirname, 'pwa', 'dist', 'index.html'));
const dockerfile = fs.existsSync(path.join(__dirname, 'Dockerfile'));

console.log('\n✅ STATUS DOS ARQUIVOS:');
console.log(frontendBuild ? '✅ Frontend build OK' : '❌ Frontend build FALTANDO');
console.log(pwaBuild ? '✅ PWA build OK' : '❌ PWA build FALTANDO'); 
console.log(dockerfile ? '✅ Dockerfile OK' : '❌ Dockerfile FALTANDO');

if (frontendBuild && pwaBuild && dockerfile) {
  console.log('\n🎉 TUDO PRONTO - apenas resolver o Git/Railway!');
} else {
  console.log('\n⚠️ Execute: node build-production.js');
}
