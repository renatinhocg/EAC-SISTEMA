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

async function verificarEstrutura() {
  try {
    await client.connect();
    console.log('🔍 Verificando estrutura das tabelas PostgreSQL...\n');

    // Lista de tabelas
    const tabelas = ['usuario', 'equipe', 'checklist', 'agenda', 'presenca', 'reflexao', 'notificacao', 'tipo_circulo'];
    
    for (const tabela of tabelas) {
      console.log(`📋 Tabela: ${tabela}`);
      
      try {
        const result = await client.query(`
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_name = '${tabela}' 
          ORDER BY ordinal_position;
        `);
        
        result.rows.forEach(col => {
          const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
          const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';
          console.log(`   - ${col.column_name}: ${col.data_type} ${nullable}${defaultVal}`);
        });
        
      } catch (err) {
        console.log(`   ❌ Erro: ${err.message}`);
      }
      
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await client.end();
  }
}

verificarEstrutura();
