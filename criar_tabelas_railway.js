// Script para criar tabelas direto no Railway via Node.js
const mysql = require('mysql2/promise');

async function criarTabelasRailway() {
  console.log('🚀 Criando tabelas no Railway...');
  
  const dbConfig = {
    host: 'switchback.proxy.rlwy.net',
    user: 'root',
    password: 'horRLfvpDAJfdVmPdSYiNQiTiaitkKpz',
    database: 'railway',
    port: 59624
  };
    database: process.env.MYSQL_DATABASE || process.env.DB_NAME,
    port: process.env.MYSQL_PORT || process.env.DB_PORT || 3306,
    connectTimeout: 60000,
    multipleStatements: true
  };

  if (!dbConfig.host) {
    console.log('❌ Execute: railway run node criar_tabelas_railway.js');
    return;
  }

  console.log('📋 Configuração do banco:');
  console.log(`   Host: ${dbConfig.host}`);
  console.log(`   Database: ${dbConfig.database}`);

  let connection;
  try {
    console.log('🔌 Conectando...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado ao Railway MySQL!');

    // SQL para criar tabelas
    const sqlCriarTabelas = `
      CREATE TABLE IF NOT EXISTS tipo_circulo (
          id INT AUTO_INCREMENT PRIMARY KEY,
          nome VARCHAR(100) NOT NULL UNIQUE
      );

      CREATE TABLE IF NOT EXISTS usuario (
          id INT AUTO_INCREMENT PRIMARY KEY,
          nome VARCHAR(100) NOT NULL,
          email VARCHAR(100) NOT NULL UNIQUE,
          senha VARCHAR(255) NOT NULL,
          tipo_usuario ENUM('admin','coordenador','integrante') DEFAULT 'integrante',
          telefone VARCHAR(20),
          tipo_circulo_id INT,
          equipe_id INT
      );

      CREATE TABLE IF NOT EXISTS equipe (
          id INT AUTO_INCREMENT PRIMARY KEY,
          nome VARCHAR(100) NOT NULL,
          descricao TEXT
      );
    `;

    console.log('🏗️ Criando tabelas...');
    await connection.execute(sqlCriarTabelas);
    console.log('✅ Tabelas criadas!');

    // Inserir dados básicos
    console.log('📝 Inserindo dados básicos...');
    
    const sqlDados = `
      INSERT IGNORE INTO tipo_circulo (id, nome) VALUES 
      (1, 'Renato e Bruna'),
      (2, 'Rodrigo e Bárbara'),
      (3, 'Fabricio e Jessica'),
      (4, 'Jose e Maycon');

      INSERT IGNORE INTO usuario (id, nome, email, senha, tipo_usuario) VALUES 
      (1, 'Renato', 'renato@gmail.com', '12345', 'admin'),
      (2, 'Bruna', 'bruna@gmail.com', '12345', 'admin'),
      (3, 'João', 'joao@email.com', '123456', 'admin'),
      (4, 'Teste', 'teste@tecom.br', '123456', 'integrante');

      INSERT IGNORE INTO equipe (id, nome, descricao) VALUES
      (1, 'Equipe Alpha', 'Equipe principal'),
      (2, 'Equipe Beta', 'Segunda equipe');
    `;

    await connection.execute(sqlDados);
    console.log('✅ Dados inseridos!');

    // Verificar
    const [usuarios] = await connection.execute('SELECT COUNT(*) as total FROM usuario');
    const [equipes] = await connection.execute('SELECT COUNT(*) as total FROM equipe');

    console.log('\n📊 Resultado:');
    console.log(`   👥 Usuários: ${usuarios[0].total}`);
    console.log(`   🏢 Equipes: ${equipes[0].total}`);
    
    console.log('\n🔑 Credenciais para teste:');
    console.log('   📧 renato@gmail.com / 12345');
    console.log('   📧 bruna@gmail.com / 12345');
    console.log('   📧 joao@email.com / 123456');

    console.log('\n🎉 PRONTO! Teste o login agora!');

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

criarTabelasRailway();
