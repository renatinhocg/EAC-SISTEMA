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

// Lê o arquivo SQL e extrai dados
function extrairDadosSQL(nomeTabela, conteudoSQL) {
  const regex = new RegExp(`INSERT INTO \`${nomeTabela}\` VALUES ([^;]+);`, 'gi');
  const matches = conteudoSQL.match(regex);
  
  if (!matches) {
    console.log(`⚠️  Nenhum dado encontrado para tabela ${nomeTabela}`);
    return [];
  }

  const dados = [];
  matches.forEach(match => {
    const valuesMatch = match.match(/VALUES\s*(.+);$/i);
    if (valuesMatch) {
      const valuesStr = valuesMatch[1];
      
      // Divide os valores por ), ( para separar as linhas
      const linhas = valuesStr.split(/\),\s*\(/);
      
      linhas.forEach((linha, index) => {
        // Limpa a linha
        let linhaLimpa = linha.replace(/^\(/, '').replace(/\)$/, '');
        
        // Analisa os valores
        const valores = [];
        let atual = '';
        let dentroDeString = false;
        let caracterEscape = false;
        
        for (let i = 0; i < linhaLimpa.length; i++) {
          const char = linhaLimpa[i];
          
          if (caracterEscape) {
            atual += char;
            caracterEscape = false;
            continue;
          }
          
          if (char === '\\') {
            caracterEscape = true;
            atual += char;
            continue;
          }
          
          if (char === "'" && !caracterEscape) {
            dentroDeString = !dentroDeString;
            atual += char;
            continue;
          }
          
          if (char === ',' && !dentroDeString) {
            valores.push(atual.trim());
            atual = '';
            continue;
          }
          
          atual += char;
        }
        
        if (atual.trim()) {
          valores.push(atual.trim());
        }
        
        dados.push(valores);
      });
    }
  });
  
  return dados;
}

// Converte valor MySQL para PostgreSQL
function converterValor(valor) {
  if (valor === 'NULL' || valor === null || valor === undefined) {
    return null;
  }
  
  // Remove aspas simples do início e fim
  if (valor.startsWith("'") && valor.endsWith("'")) {
    valor = valor.slice(1, -1);
  }
  
  // Converte timestamps
  if (valor.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)) {
    return valor;
  }
  
  // Converte datas
  if (valor.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return valor;
  }
  
  return valor;
}

async function migrarTabelaCompleta(nomeTabela, colunas, dados) {
  if (dados.length === 0) {
    console.log(`⚠️  Nenhum dado para migrar na tabela ${nomeTabela}`);
    return;
  }

  console.log(`🔄 Migrando ${dados.length} registros para ${nomeTabela}...`);
  
  // Mapear nomes de tabelas do MySQL para PostgreSQL
  const mapeamentoTabelas = {
    'usuarios': 'usuario',
    'equipes': 'equipe',
    'checklists': 'checklist',
    'reflexoes': 'reflexao',
    'notificacoes': 'notificacao',
    'notificacoes_lidas': 'notificacao_lidos',
    'checklist_equipe': 'checklist_equipes'
  };
  
  const nomePostgreSQL = mapeamentoTabelas[nomeTabela] || nomeTabela;
  
  let sucessos = 0;
  let erros = 0;
  
  for (let i = 0; i < dados.length; i++) {
    const linha = dados[i];
    
    try {
      // Converte valores
      const valoresConvertidos = linha.map(converterValor);
      
      // Cria placeholders para prepared statement
      const placeholders = valoresConvertidos.map((_, index) => `$${index + 1}`).join(', ');
      
      // Query de inserção
      const query = `INSERT INTO ${nomePostgreSQL} (${colunas.join(', ')}) VALUES (${placeholders})`;
      
      await client.query(query, valoresConvertidos);
      sucessos++;
      
    } catch (err) {
      erros++;
      console.log(`❌ Erro na linha ${i + 1} da tabela ${nomeTabela}:`, err.message);
      
      // Mostra alguns detalhes do erro para debug
      if (erros <= 3) {
        console.log(`   Dados: ${linha.join(', ')}`);
      }
    }
  }
  
  console.log(`✅ ${nomeTabela}: ${sucessos} sucessos, ${erros} erros`);
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
    
    // Definir estrutura das tabelas (ordem de inserção importante por causa das FK)
    const tabelas = [
      {
        mysql: 'usuarios',
        postgresql: 'usuario',
        colunas: ['id', 'nome', 'email', 'senha', 'papel', 'equipe_id', 'ativo', 'criado_em', 'atualizado_em']
      },
      {
        mysql: 'checklists',
        postgresql: 'checklist',
        colunas: ['id', 'titulo', 'descricao', 'criado_por', 'criado_em', 'atualizado_em']
      },
      {
        mysql: 'agenda',
        postgresql: 'agenda',
        colunas: ['id', 'titulo', 'descricao', 'data_evento', 'hora_inicio', 'hora_fim', 'local', 'criado_por', 'criado_em', 'atualizado_em']
      },
      {
        mysql: 'presenca',
        postgresql: 'presenca',
        colunas: ['id', 'agenda_id', 'usuario_id', 'presente', 'observacoes', 'criado_em']
      },
      {
        mysql: 'reflexoes',
        postgresql: 'reflexao',
        colunas: ['id', 'titulo', 'conteudo', 'arquivo', 'equipe_id', 'criado_por', 'criado_em', 'atualizado_em']
      },
      {
        mysql: 'notificacoes',
        postgresql: 'notificacao',
        colunas: ['id', 'titulo', 'mensagem', 'tipo', 'usuario_id', 'lida', 'criado_em']
      },
      {
        mysql: 'notificacoes_lidas',
        postgresql: 'notificacao_lidos',
        colunas: ['id', 'notificacao_id', 'usuario_id', 'lida_em']
      },
      {
        mysql: 'checklist_equipe',
        postgresql: 'checklist_equipes',
        colunas: ['id', 'checklist_id', 'equipe_id', 'concluido', 'concluido_por', 'concluido_em', 'observacoes']
      }
    ];
    
    // Migrar cada tabela
    for (const tabela of tabelas) {
      console.log(`\n📋 Processando tabela ${tabela.mysql}...`);
      
      const dados = extrairDadosSQL(tabela.mysql, conteudoSQL);
      await migrarTabelaCompleta(tabela.mysql, tabela.colunas, dados);
    }
    
    console.log('\n🎉 Migração completa finalizada!');
    
    // Verificar totais finais
    console.log('\n📊 Totais finais:');
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
