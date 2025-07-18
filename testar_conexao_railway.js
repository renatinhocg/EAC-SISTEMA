const mysql = require('mysql2');

// Teste simples de conexão Railway
async function testarConexaoRailway() {
  console.log('🔍 Testando conexão com Railway MySQL...');
  
  const config = {
    host: process.env.MYSQL_HOST || process.env.DATABASE_HOST,
    user: process.env.MYSQL_USER || process.env.DATABASE_USER || 'root',
    password: process.env.MYSQL_PASSWORD || process.env.DATABASE_PASSWORD,
    database: process.env.MYSQL_DATABASE || process.env.DATABASE_NAME || 'railway',
    port: process.env.MYSQL_PORT || process.env.DATABASE_PORT || 3306
  };
  
  console.log('🔌 Configuração:', {
    host: config.host,
    user: config.user,
    database: config.database,
    port: config.port,
    password: config.password ? '***' : 'não definida'
  });
  
  const db = mysql.createConnection(config);
  
  try {
    await new Promise((resolve, reject) => {
      db.connect((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    console.log('✅ Conectado com sucesso!');
    
    // Testar uma query simples
    const result = await new Promise((resolve, reject) => {
      db.query('SELECT 1 as test', (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
    
    console.log('✅ Query de teste funcionou:', result);
    
    // Verificar tabelas existentes
    const tabelas = await new Promise((resolve, reject) => {
      db.query('SHOW TABLES', (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
    
    console.log('📋 Tabelas encontradas:', tabelas.length);
    tabelas.forEach(tabela => {
      console.log(`  - ${Object.values(tabela)[0]}`);
    });
    
  } catch (error) {
    console.error('❌ Erro na conexão:', error);
  } finally {
    db.end();
  }
}

testarConexaoRailway();
