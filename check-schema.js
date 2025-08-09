const { Pool } = require('pg');
const pool = new Pool({
  host: 'switchyard.proxy.rlwy.net',
  port: 55361,
  database: 'railway',
  user: 'postgres',
  password: 'ehBiGQVppSddtntNUUhLOQLSwYkgHsbp',
  ssl: false
});

async function checkSchema() {
  try {
    console.log('=== ESTRUTURA DA TABELA AGENDA ===');
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'agenda' 
      ORDER BY ordinal_position
    `);
    
    result.rows.forEach(row => console.log(`- ${row.column_name}: ${row.data_type}`));
    
    console.log('\n=== ESTRUTURA DA TABELA USUARIO ===');
    const userResult = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'usuario' 
      ORDER BY ordinal_position
    `);
    
    userResult.rows.forEach(row => console.log(`- ${row.column_name}: ${row.data_type}`));
    
    await pool.end();
  } catch (error) {
    console.error('Erro:', error.message);
    await pool.end();
  }
}

checkSchema();
