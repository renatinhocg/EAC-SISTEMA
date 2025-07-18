const mysql = require('mysql2');

// Teste com credenciais específicas do Railway
async function testarConexaoEspecifica() {
  console.log('🔍 Testando conexão com Railway MySQL (credenciais específicas)...');
  
  // Usar endpoint público para conectar externamente
  const config = {
    host: 'switchback.proxy.rlwy.net',
    user: 'root',
    password: 'horRLfvpDAJfdVmPdSYiNQiTiaitkKpz',
    database: 'railway',
    port: 59624
  };
  
  console.log('🔌 Configuração:', {
    host: config.host,
    user: config.user,
    database: config.database,
    port: config.port,
    password: '***'
  });
  
  const db = mysql.createConnection(config);
  
  try {
    await new Promise((resolve, reject) => {
      db.connect((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    console.log('✅ Conectado com sucesso ao Railway!');
    
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
    if (tabelas.length > 0) {
      tabelas.forEach(tabela => {
        console.log(`  - ${Object.values(tabela)[0]}`);
      });
    } else {
      console.log('📋 Banco vazio - pronto para popular!');
    }
    
  } catch (error) {
    console.error('❌ Erro na conexão:', error);
  } finally {
    db.end();
  }
}

testarConexaoEspecifica();
