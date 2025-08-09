#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧹 LIMPANDO ESTRUTURA DO PROJETO\n');

// Arquivos e padrões para remover
const filesToRemove = [
  // Scripts de teste
  'testar_*.js',
  'test_*.js',
  'teste_*.js',
  
  // Scripts de migração/população (já executados)
  'migrar_*.js',
  'popular_*.js',
  'criar_*.js',
  'exportar_*.js',
  'verificar_*.js',
  
  // Scripts de desenvolvimento
  'adicionar_*.js',
  'analisar_*.js',
  'comparar_*.js',
  'corrigir_*.js',
  'debug_*.js',
  'fix-*.js',
  'simular_*.js',
  
  // Arquivos SQL de desenvolvimento
  '*.sql',
  
  // Dados temporários
  'dados_*.json',
  'test-*.json',
  
  // Scripts de deploy/build (já executados)
  'build-production.js',
  'deploy-info.js',
  'railway-*.js',
  'populate-data.js',
  'check-*.js'
];

// Diretórios para limpar (manter estrutura, remover conteúdo desnecessário)
const dirsToClean = [
  // Builds antigos podem ser removidos (serão recriados)
  // 'frontend/dist', 
  // 'pwa/dist'
];

function removeFiles(pattern) {
  const files = [];
  
  // Buscar arquivos que correspondem ao padrão
  fs.readdirSync('.').forEach(file => {
    const isMatch = pattern.includes('*') 
      ? new RegExp(pattern.replace(/\*/g, '.*')).test(file)
      : file === pattern;
      
    if (isMatch && fs.existsSync(file)) {
      files.push(file);
    }
  });
  
  return files;
}

function cleanupProject() {
  let removedCount = 0;
  let removedFiles = [];
  
  console.log('📁 Analisando arquivos para remoção...\n');
  
  filesToRemove.forEach(pattern => {
    const matchingFiles = removeFiles(pattern);
    
    matchingFiles.forEach(file => {
      try {
        if (fs.statSync(file).isFile()) {
          fs.unlinkSync(file);
          removedFiles.push(file);
          removedCount++;
          console.log(`🗑️  Removido: ${file}`);
        }
      } catch (error) {
        console.log(`⚠️  Erro ao remover ${file}: ${error.message}`);
      }
    });
  });
  
  console.log(`\n✅ LIMPEZA CONCLUÍDA!`);
  console.log(`📊 Removidos: ${removedCount} arquivos`);
  
  if (removedFiles.length > 0) {
    console.log('\n📝 Arquivos removidos:');
    removedFiles.forEach(file => console.log(`   • ${file}`));
  }
  
  console.log('\n🎯 ESTRUTURA FINAL MANTIDA:');
  console.log('├── backend/ (API e servidor)');
  console.log('├── frontend/dist/ (Admin build)');
  console.log('├── pwa/dist/ (PWA build)');
  console.log('├── package.json (configurações principais)');
  console.log('├── Dockerfile (para deploy)');
  console.log('├── .railwayignore (configuração deploy)');
  console.log('└── README.md (documentação)');
  
  return removedCount;
}

function createCleanStructureInfo() {
  const info = `# EAC PWA - Estrutura Limpa

## 🎯 Projeto em Produção

### URLs:
- **PWA**: https://app.eacpnsa.com.br/
- **Admin**: https://app.eacpnsa.com.br/admin
- **API**: https://app.eacpnsa.com.br/api

### Estrutura Final:
\`\`\`
├── backend/           # API e servidor Node.js
├── frontend/dist/     # Admin interface (build)
├── pwa/dist/         # PWA app (build)
├── package.json      # Configurações principais
├── Dockerfile        # Configuração para deploy
└── .railwayignore   # Arquivos ignorados no deploy
\`\`\`

### Comandos Úteis:
\`\`\`bash
# Rebuild local (se necessário)
npm run build

# Deploy Railway
railway up

# Ver logs
railway logs
\`\`\`

### Funcionalidades:
✅ PWA completo com todas as telas
✅ Admin interface para gestão
✅ API REST com PostgreSQL
✅ Deploy automático no Railway
✅ DNS customizado configurado
`;

  fs.writeFileSync('ESTRUTURA-LIMPA.md', info);
  console.log('\n📄 Criado: ESTRUTURA-LIMPA.md');
}

// Executar limpeza
const removed = cleanupProject();
createCleanStructureInfo();

console.log('\n🚀 PROJETO PRONTO PARA PRODUÇÃO!');
console.log('📋 Próximos passos:');
console.log('1. Commit das mudanças: git add . && git commit -m "Limpeza da estrutura"');
console.log('2. Deploy: railway up (se necessário)');
console.log('3. Testar: https://app.eacpnsa.com.br');
