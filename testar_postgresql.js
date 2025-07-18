const { Client } = require('pg');

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

async function testarPostgreSQL() {
  const client = new Client(config);
  
  try {
    console.log('🔍 Testando conexão com PostgreSQL Railway...');
    console.log('🔌 Configuração:', {
      host: config.host,
      port: config.port,
      user: config.user,
      database: config.database
    });
    
    await client.connect();
    console.log('✅ Conectado ao PostgreSQL Railway!');
    
    // Teste básico
    const result = await client.query('SELECT 1 as test');
    console.log('✅ Query de teste funcionou:', result.rows);
    
    // Verificar versão
    const version = await client.query('SELECT version()');
    console.log('📋 Versão PostgreSQL:', version.rows[0].version.substring(0, 50) + '...');
    
    // Listar tabelas existentes
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('📊 Tabelas existentes:', tables.rows.length);
    
    console.log('🎉 PostgreSQL está operacional e pronto para uso!');
    
  } catch (error) {
    console.error('❌ Erro ao conectar ao PostgreSQL:', error.message);
  } finally {
    await client.end();
  }
}

testarPostgreSQL();
