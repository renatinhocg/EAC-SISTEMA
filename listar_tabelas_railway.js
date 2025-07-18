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

async function listarTabelas() {
  try {
    await client.connect();
    console.log('🔍 Listando todas as tabelas no PostgreSQL Railway...\n');

    // Listar todas as tabelas
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log('📋 Tabelas encontradas:');
    result.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.table_name}`);
    });

    console.log('\n🔍 Verificando dados em cada tabela:');
    for (const row of result.rows) {
      const tableName = row.table_name;
      try {
        const countResult = await client.query(`SELECT COUNT(*) as total FROM ${tableName}`);
        console.log(`📊 ${tableName}: ${countResult.rows[0].total} registros`);
      } catch (err) {
        console.log(`❌ ${tableName}: erro - ${err.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await client.end();
  }
}

listarTabelas();
