// Script para criar as tabelas no PostgreSQL
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
  host: 'shortline.proxy.rlwy.net',
  port: 10160,
  user: 'postgres',
  password: 'vjIkxfKggxIaeAfcTQWLeOnDuSZgRQhg',
  database: 'railway',
  ssl: false
});

async function createTables() {
  try {
    await client.connect();
    console.log('✅ Conectado ao PostgreSQL!');
    
    // Ler o arquivo SQL
    const sqlContent = fs.readFileSync(path.join(__dirname, 'eac-postgresql.sql'), 'utf8');
    
    // Executar o SQL
    await client.query(sqlContent);
    
    console.log('✅ Tabelas criadas com sucesso!');
    
    // Verificar se as tabelas foram criadas
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('📋 Tabelas criadas:');
    result.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
  } catch (err) {
    console.error('❌ Erro:', err.message);
  } finally {
    await client.end();
  }
}

createTables();
