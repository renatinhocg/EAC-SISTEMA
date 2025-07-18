const mysql = require('mysql2/promise');

const config = {
  host: 'switchback.proxy.rlwy.net',
  port: 59624,
  user: 'root',
  password: 'horRLfvpDAJfdVmPdSYiNQiTiaitkKpz',
  database: 'railway'
};

async function testarLogin() {
  let connection;
  
  try {
    console.log('🔍 Testando funcionalidade de login com dados do Railway...');
    
    connection = await mysql.createConnection(config);
    console.log('✅ Conectado ao Railway MySQL');

    // Listar alguns usuários para teste
    const [usuarios] = await connection.execute(`
      SELECT id, nome, email, senha, tipo_usuario 
      FROM usuario 
      WHERE email IS NOT NULL AND email != '' 
      LIMIT 5
    `);

    console.log('\n📋 Usuários disponíveis para teste de login:');
    usuarios.forEach(user => {
      console.log(`🔑 ID: ${user.id} | Nome: ${user.nome} | Email: ${user.email} | Tipo: ${user.tipo_usuario}`);
    });

    // Testar query específica de login
    if (usuarios.length > 0) {
      const emailTeste = usuarios[0].email;
      console.log(`\n🧪 Testando login com email: ${emailTeste}`);
      
      const [resultado] = await connection.execute(
        'SELECT id, nome, email, tipo_usuario FROM usuario WHERE email = ? LIMIT 1',
        [emailTeste]
      );
      
      if (resultado.length > 0) {
        console.log('✅ Query de login funcionando!');
        console.log(`📝 Usuário encontrado: ${resultado[0].nome} (${resultado[0].tipo_usuario})`);
      }
    }

    // Verificar algumas estatísticas
    console.log('\n📊 Estatísticas do banco:');
    
    const queries = [
      { nome: 'Total usuários', sql: 'SELECT COUNT(*) as total FROM usuario' },
      { nome: 'Total equipes', sql: 'SELECT COUNT(*) as total FROM equipe' },
      { nome: 'Total presenças', sql: 'SELECT COUNT(*) as total FROM presenca' },
      { nome: 'Total agendas', sql: 'SELECT COUNT(*) as total FROM agenda' }
    ];

    for (const query of queries) {
      try {
        const [rows] = await connection.execute(query.sql);
        console.log(`📈 ${query.nome}: ${rows[0].total}`);
      } catch (error) {
        console.log(`❌ Erro em ${query.nome}: ${error.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Erro durante teste:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testarLogin();
