const { Client } = require('pg');
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

async function verificarDados() {
  try {
    await client.connect();
    console.log('🔍 Verificando dados no PostgreSQL Railway...\n');

    // Verificar cada tabela
    const tabelas = [
      'usuarios', 'equipes', 'checklists', 'agenda', 
      'presenca', 'reflexoes', 'notificacoes', 'notificacoes_lidas',
      'checklist_equipe', 'tipo_circulo'
    ];

    for (const tabela of tabelas) {
      try {
        const result = await client.query(`SELECT COUNT(*) as total FROM ${tabela}`);
        console.log(`📊 ${tabela}: ${result.rows[0].total} registros`);
      } catch (err) {
        console.log(`❌ ${tabela}: erro - ${err.message}`);
      }
    }

    // Verificar alguns dados específicos
    console.log('\n🔍 Dados específicos:');
    
    try {
      const equipes = await client.query('SELECT id, nome FROM equipes LIMIT 5');
      console.log('👥 Equipes (primeiras 5):');
      equipes.rows.forEach(eq => console.log(`   - ${eq.id}: ${eq.nome}`));
    } catch (err) {
      console.log('❌ Erro ao consultar equipes:', err.message);
    }

    try {
      const usuarios = await client.query('SELECT id, nome, email FROM usuarios LIMIT 5');
      console.log('👤 Usuários (primeiros 5):');
      usuarios.rows.forEach(user => console.log(`   - ${user.id}: ${user.nome} (${user.email})`));
    } catch (err) {
      console.log('❌ Erro ao consultar usuários:', err.message);
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await client.end();
  }
}

verificarDados();
