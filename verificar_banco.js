// Script para verificar se os dados estão no banco Railway
const mysql = require('mysql2/promise');

async function verificarBancoRailway() {
  console.log('🔍 Verificando dados no banco Railway...');
  
  const dbConfig = {
    host: process.env.MYSQL_HOST || process.env.DB_HOST,
    user: process.env.MYSQL_USER || process.env.DB_USER,
    password: process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD,
    database: process.env.MYSQL_DATABASE || process.env.DB_NAME,
    port: process.env.MYSQL_PORT || process.env.DB_PORT || 3306,
    connectTimeout: 60000
  };

  if (!dbConfig.host) {
    console.log('❌ Execute: railway run node verificar_banco.js');
    return;
  }

  let connection;
  try {
    console.log('🔌 Conectando ao Railway...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado!');

    // Verificar se tabelas existem
    const [tabelas] = await connection.execute(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = ? 
      ORDER BY table_name
    `, [dbConfig.database]);

    if (tabelas.length === 0) {
      console.log('❌ NENHUMA TABELA ENCONTRADA!');
      console.log('💡 Você precisa executar o script PRODUCAO_COMPLETA_RAILWAY.sql no Railway');
      return;
    }

    console.log(`📋 Tabelas encontradas: ${tabelas.length}`);
    tabelas.forEach(t => console.log(`   - ${t.table_name}`));

    // Verificar dados
    const verificacoes = [
      'SELECT COUNT(*) as total FROM usuario',
      'SELECT COUNT(*) as total FROM equipe', 
      'SELECT COUNT(*) as total FROM tipo_circulo',
      'SELECT COUNT(*) as total FROM checklist'
    ];

    console.log('\n📊 Contagem de registros:');
    for (const sql of verificacoes) {
      try {
        const [result] = await connection.execute(sql);
        const tabela = sql.match(/FROM (\w+)/)[1];
        console.log(`   ${tabela}: ${result[0].total} registros`);
      } catch (err) {
        console.log(`   ❌ Erro ao verificar: ${err.message}`);
      }
    }

    // Verificar usuários admin
    try {
      const [admins] = await connection.execute(`
        SELECT nome, email, tipo_usuario 
        FROM usuario 
        WHERE tipo_usuario = 'admin' 
        LIMIT 5
      `);
      
      if (admins.length > 0) {
        console.log('\n👤 Usuários admin encontrados:');
        admins.forEach(u => console.log(`   - ${u.email} (${u.nome})`));
      } else {
        console.log('\n❌ NENHUM USUÁRIO ADMIN ENCONTRADO!');
      }
    } catch (err) {
      console.log('\n❌ Erro ao buscar admins:', err.message);
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

verificarBancoRailway();
