#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando build para produção...\n');

// Função para executar comandos
function runCommand(command, cwd = process.cwd()) {
  console.log(`📂 Executando em ${cwd}: ${command}`);
  try {
    execSync(command, { 
      cwd, 
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'production' }
    });
    console.log('✅ Comando executado com sucesso\n');
  } catch (error) {
    console.error('❌ Erro ao executar comando:', error.message);
    process.exit(1);
  }
}

// 1. Limpar builds anteriores
console.log('🧹 Limpando builds anteriores...');
const frontendDist = path.join(__dirname, 'frontend', 'dist');
const pwaDist = path.join(__dirname, 'pwa', 'dist');

if (fs.existsSync(frontendDist)) {
  fs.rmSync(frontendDist, { recursive: true, force: true });
  console.log('🗑️ Frontend dist removido');
}

if (fs.existsSync(pwaDist)) {
  fs.rmSync(pwaDist, { recursive: true, force: true });
  console.log('🗑️ PWA dist removido');
}

// 2. Instalar dependências
console.log('📦 Instalando dependências...');
runCommand('npm install --production=false', __dirname);
runCommand('npm install --legacy-peer-deps', path.join(__dirname, 'frontend'));
runCommand('npm install', path.join(__dirname, 'pwa'));
runCommand('npm install --production=false', path.join(__dirname, 'backend'));

// 3. Build do Frontend Admin
console.log('🏗️ Fazendo build do Frontend Admin...');
runCommand('npm run build', path.join(__dirname, 'frontend'));

// 4. Build do PWA
console.log('🏗️ Fazendo build do PWA...');
runCommand('npm run build', path.join(__dirname, 'pwa'));

// 5. Verificar se os builds foram criados
console.log('🔍 Verificando builds...');
if (!fs.existsSync(frontendDist)) {
  console.error('❌ Build do frontend não foi criado!');
  process.exit(1);
}

if (!fs.existsSync(pwaDist)) {
  console.error('❌ Build do PWA não foi criado!');
  process.exit(1);
}

console.log('✅ Frontend Admin build criado:', frontendDist);
console.log('✅ PWA build criado:', pwaDist);

// 6. Verificar arquivos principais
const frontendIndex = path.join(frontendDist, 'index.html');
const pwaIndex = path.join(pwaDist, 'index.html');

if (fs.existsSync(frontendIndex)) {
  console.log('✅ Frontend index.html encontrado');
} else {
  console.error('❌ Frontend index.html não encontrado!');
}

if (fs.existsSync(pwaIndex)) {
  console.log('✅ PWA index.html encontrado');
} else {
  console.error('❌ PWA index.html não encontrado!');
}

console.log('\n🎉 Build concluído com sucesso!');
console.log('\n📋 Próximos passos:');
console.log('1. Fazer commit das mudanças');
console.log('2. Fazer push para o GitHub');
console.log('3. O Railway fará deploy automaticamente');
console.log('\nEstrutura final:');
console.log('├── backend/ (API)');
console.log('├── frontend/dist/ (Admin em /admin)');
console.log('└── pwa/dist/ (PWA em /)');
