const mysql = require('mysql2/promise');

const config = {
  host: 'switchback.proxy.rlwy.net',
  port: 59624,
  user: 'root',
  password: 'horRLfvpDAJfdVmPdSYiNQiTiaitkKpz',
  database: 'railway',
  connectTimeout: 60000, // 60 segundos
  acquireTimeout: 60000,
  timeout: 60000
};

async function testarConexaoComTimeout() {
  console.log('🔍 Testando conexão MySQL com timeout maior...');
  
  let tentativas = 0;
  const maxTentativas = 5;
  
  while (tentativas < maxTentativas) {
    tentativas++;
    console.log(`\n🔄 Tentativa ${tentativas}/${maxTentativas}...`);
    
    try {
      const connection = await mysql.createConnection(config);
      console.log('✅ Conectado ao Railway MySQL!');
      
      const [rows] = await connection.execute('SELECT 1 as test');
      console.log('✅ Query de teste funcionou:', rows);
      
      await connection.end();
      console.log('🎉 MySQL está operacional!');
      return true;
    } catch (error) {
      console.log(`❌ Tentativa ${tentativas} falhou:`, error.code);
      
      if (tentativas < maxTentativas) {
        console.log('⏳ Aguardando 15 segundos antes da próxima tentativa...');
        await new Promise(resolve => setTimeout(resolve, 15000));
      }
    }
  }
  
  console.log('\n💥 MySQL não conseguiu se conectar após 5 tentativas');
  console.log('📋 Opções:');
  console.log('1. Criar novo MySQL no Railway');
  console.log('2. Usar PostgreSQL ao invés de MySQL');
  console.log('3. Aguardar mais tempo');
  
  return false;
}

testarConexaoComTimeout();
