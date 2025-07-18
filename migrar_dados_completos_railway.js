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

// Parser melhorado para extrair dados dos INSERTs
function extrairDadosDoBackup(nomeTabela, conteudoSQL) {
  console.log(`🔍 Procurando dados da tabela: ${nomeTabela}`);
  
  const regex = new RegExp(`INSERT INTO ${nomeTabela}[^;]+;`, 'gi');
  const matches = conteudoSQL.match(regex);
  
  if (!matches) {
    console.log(`⚠️  Nenhum INSERT encontrado para ${nomeTabela}`);
    return [];
  }
  
  console.log(`📋 Encontrados ${matches.length} INSERTs para ${nomeTabela}`);
  
  const registros = [];
  
  for (const match of matches) {
    try {
      // Extrair valores entre VALUES e o ;
      const valuesMatch = match.match(/VALUES\s*(.+);/i);
      if (!valuesMatch) continue;
      
      const valuesStr = valuesMatch[1];
      
      // Dividir por "), (" para separar registros múltiplos
      const linhas = valuesStr.split(/\),\s*\(/);
      
      for (let i = 0; i < linhas.length; i++) {
        let linha = linhas[i];
        
        // Limpar parênteses
        linha = linha.replace(/^\(/, '').replace(/\)$/, '');
        
        // Parse manual dos valores
        const valores = parseValues(linha);
        registros.push(valores);
      }
      
    } catch (err) {
      console.log(`❌ Erro ao processar INSERT: ${err.message}`);
    }
  }
  
  console.log(`✅ Extraídos ${registros.length} registros de ${nomeTabela}`);
  return registros;
}

function parseValues(linha) {
  const valores = [];
  let atual = '';
  let dentroDeString = false;
  let i = 0;
  
  while (i < linha.length) {
    const char = linha[i];
    
    if (char === "'" && (i === 0 || linha[i-1] !== '\\')) {
      dentroDeString = !dentroDeString;
      atual += char;
    } else if (char === ',' && !dentroDeString) {
      valores.push(atual.trim());
      atual = '';
    } else {
      atual += char;
    }
    i++;
  }
  
  if (atual.trim()) {
    valores.push(atual.trim());
  }
  
  return valores.map(v => {
    if (v === 'NULL') return null;
    if (v.startsWith("'") && v.endsWith("'")) {
      return v.slice(1, -1); // Remove aspas
    }
    return v;
  });
}

async function migrarUsuarios(dados) {
  console.log('\n👤 Migrando usuários...');
  
  // Limpar usuários existentes
  await client.query('DELETE FROM usuario');
  
  let sucessos = 0;
  let erros = 0;
  
  for (const linha of dados) {
    try {
      // Estrutura esperada do backup: 
      // (id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id)
      // Estrutura PostgreSQL:
      // (id, nome, email, senha, telefone, sobre, foto, tipo_usuario, equipe_id)
      
      const [id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id] = linha;
      
      await client.query(`
        INSERT INTO usuario (nome, email, senha, telefone, foto, tipo_usuario, equipe_id) 
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        nome || 'Sem nome',
        email || `user${id}@email.com`,
        senha || '123456',
        telefone,
        foto,
        tipo_usuario || 'integrante',
        equipe_id === 'NULL' ? null : parseInt(equipe_id)
      ]);
      
      sucessos++;
    } catch (err) {
      erros++;
      if (erros <= 5) {
        console.log(`❌ Erro usuário ${linha[0]}: ${err.message}`);
      }
    }
  }
  
  console.log(`✅ Usuários: ${sucessos} sucessos, ${erros} erros`);
}

async function migrarAgenda(dados) {
  console.log('\n📅 Migrando agenda...');
  
  await client.query('DELETE FROM agenda');
  
  let sucessos = 0;
  let erros = 0;
  
  for (const linha of dados) {
    try {
      // Backup: (id, titulo, descricao, data, hora_inicio, hora_fim, local, presenca_ativa)
      // PostgreSQL: (titulo, descricao, data_evento, local_evento, tipo_circulo_id)
      
      const [id, titulo, descricao, data, hora_inicio, hora_fim, local, presenca_ativa] = linha;
      
      // Combinar data e hora_inicio
      let dataEvento = data;
      if (hora_inicio && hora_inicio !== 'NULL') {
        dataEvento = `${data} ${hora_inicio}`;
      }
      
      await client.query(`
        INSERT INTO agenda (titulo, descricao, data_evento, local_evento, tipo_circulo_id) 
        VALUES ($1, $2, $3, $4, $5)
      `, [
        titulo || 'Evento',
        descricao,
        dataEvento,
        local,
        1 // tipo_circulo_id padrão
      ]);
      
      sucessos++;
    } catch (err) {
      erros++;
      if (erros <= 5) {
        console.log(`❌ Erro agenda ${linha[0]}: ${err.message}`);
      }
    }
  }
  
  console.log(`✅ Agenda: ${sucessos} sucessos, ${erros} erros`);
}

async function migrarChecklists(dados) {
  console.log('\n📋 Migrando checklists...');
  
  await client.query('DELETE FROM checklist');
  
  let sucessos = 0;
  let erros = 0;
  
  for (const linha of dados) {
    try {
      // Backup: (id, titulo, descricao, tipo)
      // PostgreSQL: (titulo, descricao, agenda_id)
      
      const [id, titulo, descricao, tipo] = linha;
      
      await client.query(`
        INSERT INTO checklist (titulo, descricao) 
        VALUES ($1, $2)
      `, [
        titulo || 'Checklist',
        descricao
      ]);
      
      sucessos++;
    } catch (err) {
      erros++;
      if (erros <= 5) {
        console.log(`❌ Erro checklist ${linha[0]}: ${err.message}`);
      }
    }
  }
  
  console.log(`✅ Checklists: ${sucessos} sucessos, ${erros} erros`);
}

async function migrarCompleto() {
  try {
    await client.connect();
    console.log('🔗 Conectado ao PostgreSQL Railway\n');
    
    const backupPath = path.join(__dirname, 'dados_completos_local.sql');
    
    if (!fs.existsSync(backupPath)) {
      console.error('❌ Arquivo dados_completos_local.sql não encontrado!');
      return;
    }
    
    const conteudoSQL = fs.readFileSync(backupPath, 'utf8');
    console.log('📄 Arquivo SQL carregado\n');
    
    // Migrar por ordem de dependência
    const dadosUsuario = extrairDadosDoBackup('usuario', conteudoSQL);
    if (dadosUsuario.length > 0) {
      await migrarUsuarios(dadosUsuario);
    }
    
    const dadosAgenda = extrairDadosDoBackup('agenda', conteudoSQL);
    if (dadosAgenda.length > 0) {
      await migrarAgenda(dadosAgenda);
    }
    
    const dadosChecklist = extrairDadosDoBackup('checklist', conteudoSQL);
    if (dadosChecklist.length > 0) {
      await migrarChecklists(dadosChecklist);
    }
    
    // Verificar totais finais
    console.log('\n📊 Contagem final após migração completa:');
    const tabelas = ['usuario', 'equipe', 'checklist', 'agenda', 'presenca', 'reflexao', 'notificacao', 'tipo_circulo'];
    
    for (const tabela of tabelas) {
      try {
        const result = await client.query(`SELECT COUNT(*) as total FROM ${tabela}`);
        console.log(`   ${tabela}: ${result.rows[0].total} registros`);
      } catch (err) {
        console.log(`   ${tabela}: erro - ${err.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro na migração completa:', error.message);
  } finally {
    await client.end();
  }
}

migrarCompleto();
