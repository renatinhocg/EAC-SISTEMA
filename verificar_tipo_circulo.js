const mysql = require('mysql2/promise');

const config = {
  host: 'switchback.proxy.rlwy.net',
  port: 59624,
  user: 'root',
  password: 'horRLfvpDAJfdVmPdSYiNQiTiaitkKpz',
  database: 'railway'
};

async function verificarEstrutura() {
  let connection;
  
  try {
    connection = await mysql.createConnection(config);
    console.log('✅ Conectado ao Railway MySQL');

    const [rows] = await connection.execute('DESCRIBE tipo_circulo');
    console.log('📋 Estrutura da tabela tipo_circulo:');
    rows.forEach(row => {
      console.log(`  - ${row.Field}: ${row.Type} ${row.Null} ${row.Key} ${row.Default}`);
    });

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

verificarEstrutura();
