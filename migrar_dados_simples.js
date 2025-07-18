const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: './backend/.env' });

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false
  }
});

// Extrair dados de INSERT statements
function extrairInserts(nomeTabela, conteudoSQL) {
  const regex = new RegExp(`INSERT INTO ${nomeTabela} [^;]+;`, 'gi');
  const matches = conteudoSQL.match(regex);
  
  if (!matches) {
    console.log(`⚠️  Nenhum INSERT encontrado para tabela ${nomeTabela}`);
    return [];
  }

  console.log(`📋 Encontrados ${matches.length} INSERTs para ${nomeTabela}`);
  return matches;
}

async function executarInserts(nomeTabela, inserts) {
  if (inserts.length === 0) {
    console.log(`⚠️  Nenhum dado para migrar na tabela ${nomeTabela}`);
    return;
  }

  console.log(`🔄 Executando ${inserts.length} INSERTs para ${nomeTabela}...`);
  
  let sucessos = 0;
  let erros = 0;
  
  for (let i = 0; i < inserts.length; i++) {
    const insert = inserts[i];
    
    try {
      // Converte o INSERT de MySQL para PostgreSQL
      let insertPostgreSQL = insert;
      
      // Remove crase de nomes de colunas e tabelas
      insertPostgreSQL = insertPostgreSQL.replace(/`([^`]+)`/g, '$1');
      
      // Troca aspas simples para strings por aspas duplas quando necessário (na verdade, vamos manter aspas simples no PostgreSQL)
      
      await client.query(insertPostgreSQL);
      sucessos++;
      
      if (sucessos % 50 === 0) {
        console.log(`   ✅ ${sucessos} registros inseridos...`);
      }
      
    } catch (err) {
      erros++;
      if (erros <= 5) {  // Mostra apenas os primeiros 5 erros
        console.log(`❌ Erro no INSERT ${i + 1}:`, err.message);
        console.log(`   SQL: ${insert.substring(0, 100)}...`);
      }
    }
  }
  
  console.log(`✅ ${nomeTabela}: ${sucessos} sucessos, ${erros} erros`);
  return { sucessos, erros };
}

async function migrarTodosDados() {
  try {
    await client.connect();
    console.log('🔗 Conectado ao PostgreSQL Railway\n');
    
    // Lê o arquivo de backup
    const backupPath = path.join(__dirname, 'dados_completos_local.sql');
    
    if (!fs.existsSync(backupPath)) {
      console.error('❌ Arquivo dados_completos_local.sql não encontrado!');
      return;
    }
    
    const conteudoSQL = fs.readFileSync(backupPath, 'utf8');
    console.log('📄 Arquivo SQL carregado\n');
    
    // Lista de tabelas na ordem correta (por causa das foreign keys)
    const tabelas = [
      'tipo_circulo',  // Já tem dados, mas pode ter mais
      'usuario',       // Depende de tipo_circulo e equipe
      'equipe',        // Já tem dados, mas pode ter mais
      'checklist',
      'agenda',
      'presenca',      // Depende de agenda e usuario
      'reflexao',      // Depende de equipe e usuario
      'notificacao',   // Depende de usuario
      'notificacao_lidos', // Depende de notificacao e usuario
      'checklist_equipes'  // Depende de checklist e equipe
    ];
    
    let totalSucessos = 0;
    let totalErros = 0;
    
    // Migrar cada tabela
    for (const tabela of tabelas) {
      console.log(`\n📋 Processando tabela ${tabela}...`);
      
      const inserts = extrairInserts(tabela, conteudoSQL);
      const resultado = await executarInserts(tabela, inserts);
      
      if (resultado) {
        totalSucessos += resultado.sucessos;
        totalErros += resultado.erros;
      }
    }
    
    console.log(`\n🎉 Migração completa!`);
    console.log(`📊 Total: ${totalSucessos} sucessos, ${totalErros} erros`);
    
    // Verificar totais finais
    console.log('\n📊 Contagem final das tabelas:');
    const tabelasPostgreSQL = ['usuario', 'equipe', 'checklist', 'agenda', 'presenca', 'reflexao', 'notificacao', 'notificacao_lidos', 'checklist_equipes', 'tipo_circulo'];
    
    for (const tabela of tabelasPostgreSQL) {
      try {
        const result = await client.query(`SELECT COUNT(*) as total FROM ${tabela}`);
        console.log(`   ${tabela}: ${result.rows[0].total} registros`);
      } catch (err) {
        console.log(`   ${tabela}: erro - ${err.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro na migração:', error.message);
  } finally {
    await client.end();
  }
}

migrarTodosDados();
