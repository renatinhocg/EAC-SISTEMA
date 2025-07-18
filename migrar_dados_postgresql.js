const { Client } = require('pg');
const fs = require('fs');

const config = {
  host: 'hopper.proxy.rlwy.net',
  port: 26344,
  user: 'postgres',
  password: 'lFRJeOJXZQAKkFUcxomASkLBIbhUOSuW',
  database: 'railway',
  ssl: {
    rejectUnauthorized: false
  }
};

// Dados das tabelas básicas
const dadosIniciais = {
  tipo_circulo: [
    { nome: 'EAC' }
  ],
  equipe: [
    { nome: 'Garçom', descricao: 'Equipe de garçom', sobre: 'Serve os adolescentes e tios', funcao: 'Equipe externa' },
    { nome: 'Ordem e Montagem', descricao: 'Arruma e limpa o ambiente', sobre: 'A Equipe Ordem e Montagem é formada por dois casais coordenadores', funcao: 'Equipe interna' },
    { nome: 'Banda', descricao: '', sobre: '', funcao: 'Equipe externa' },
    { nome: 'Sala', descricao: '', sobre: '', funcao: 'Equipe interna' },
    { nome: 'Mini-bar', descricao: '', sobre: '', funcao: 'Equipe externa' },
    { nome: 'Vigília', descricao: '', sobre: '', funcao: 'Equipe interna' },
    { nome: 'Meditação', descricao: '', sobre: '', funcao: 'Equipe interna' },
    { nome: 'Doutrina', descricao: '', sobre: '', funcao: 'Equipe interna' },
    { nome: 'Cozinha', descricao: '', sobre: '', funcao: 'Equipe interna' },
    { nome: 'Secretaria', descricao: '', sobre: '', funcao: 'Equipe interna' },
    { nome: 'Evangelização Infantil', descricao: '', sobre: '', funcao: 'Equipe interna' },
    { nome: 'Portaria', descricao: '', sobre: '', funcao: 'Equipe externa' },
    { nome: 'Visitação', descricao: '', sobre: '', funcao: 'Equipe externa' }
  ]
};

async function migrarDadosMySQL() {
  const client = new Client(config);
  
  try {
    console.log('🔄 Migrando dados do MySQL para PostgreSQL...');
    
    await client.connect();
    console.log('✅ Conectado ao PostgreSQL');
    
    // Inserir dados iniciais
    console.log('📊 Inserindo dados iniciais...');
    
    // Tipo círculo
    for (const item of dadosIniciais.tipo_circulo) {
      await client.query('INSERT INTO tipo_circulo (nome) VALUES ($1) ON CONFLICT (nome) DO NOTHING', [item.nome]);
    }
    console.log('  ✓ tipo_circulo inserido');
    
    // Equipes
    for (const equipe of dadosIniciais.equipe) {
      await client.query(
        'INSERT INTO equipe (nome, descricao, sobre, funcao) VALUES ($1, $2, $3, $4)',
        [equipe.nome, equipe.descricao, equipe.sobre, equipe.funcao]
      );
    }
    console.log('  ✓ equipes inseridas');
    
    // Migrar dados do arquivo SQL (se disponível)
    console.log('\n📁 Tentando migrar dados do backup MySQL...');
    
    try {
      const dadosSQL = fs.readFileSync('dados_completos_local.sql', 'utf8');
      const linhas = dadosSQL.split('\n').filter(linha => linha.trim().startsWith('INSERT'));
      
      console.log(`📊 Encontrados ${linhas.length} INSERTs para migrar`);
      
      let sucessos = 0;
      let erros = 0;
      
      for (let i = 0; i < Math.min(linhas.length, 100); i++) { // Migrar apenas os primeiros 100 para teste
        try {
          const linha = linhas[i];
          
          // Converter INSERT MySQL para PostgreSQL (básico)
          let linhaPG = linha
            .replace(/INSERT INTO /g, 'INSERT INTO ')
            .replace(/`/g, '"') // Aspas MySQL para PostgreSQL
            .replace(/\\'/g, "''"); // Escape de aspas simples
          
          // Pular INSERTs que podem ter problemas de foreign key por enquanto
          if (linhaPG.includes('INSERT INTO usuario') || 
              linhaPG.includes('INSERT INTO presenca') ||
              linhaPG.includes('INSERT INTO reflexao')) {
            continue;
          }
          
          await client.query(linhaPG);
          sucessos++;
          
          if ((i + 1) % 20 === 0) {
            console.log(`  📈 Processados: ${i + 1}/100`);
          }
        } catch (error) {
          erros++;
          if (erros <= 5) { // Mostrar apenas os primeiros 5 erros
            console.log(`  ⚠️ Erro no INSERT ${i + 1}: ${error.message.substring(0, 60)}...`);
          }
        }
      }
      
      console.log(`\n📊 Migração de teste concluída: ${sucessos} sucessos, ${erros} erros`);
      
    } catch (error) {
      console.log('  ⚠️ Arquivo de backup não encontrado ou erro na leitura');
    }
    
    // Verificar dados inseridos
    console.log('\n📋 Verificando dados inseridos:');
    const tabelas = ['tipo_circulo', 'equipe', 'usuario', 'agenda', 'checklist', 'presenca'];
    
    for (const tabela of tabelas) {
      try {
        const result = await client.query(`SELECT COUNT(*) as total FROM ${tabela}`);
        console.log(`  📊 ${tabela}: ${result.rows[0].total} registros`);
      } catch (error) {
        console.log(`  ❌ Erro ao contar ${tabela}: ${error.message}`);
      }
    }
    
    console.log('\n🎉 PostgreSQL configurado e com dados iniciais!');
    
  } catch (error) {
    console.error('❌ Erro na migração:', error.message);
  } finally {
    await client.end();
  }
}

migrarDadosMySQL();
