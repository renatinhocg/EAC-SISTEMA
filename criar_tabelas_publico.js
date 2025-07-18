// Script para conectar ao Railway MySQL via host público
const mysql = require('mysql2/promise');

// Credenciais do Railway (públicas)
const dbConfig = {
  host: 'metro.proxy.rlwy.net', // Host público do Railway
  user: 'root',
  password: 'LwAlpweJhhXQJRMWLaToWrxFzjtagAkC',
  database: 'railway',
  port: 52078, // Porta TCP pública
  connectTimeout: 60000
};

async function criarTabelasRailway() {
  console.log('🚀 Conectando ao Railway MySQL via host público...');
  
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado ao Railway MySQL!');

    // Script SQL completo
    const sqlCommands = [
      // Limpar tabelas existentes
      'DROP TABLE IF EXISTS presenca',
      'DROP TABLE IF EXISTS reflexao', 
      'DROP TABLE IF EXISTS agenda',
      'DROP TABLE IF EXISTS notificacao_lidos',
      'DROP TABLE IF EXISTS notificacao',
      'DROP TABLE IF EXISTS checklist_equipes',
      'DROP TABLE IF EXISTS checklist',
      'DROP TABLE IF EXISTS equipe',
      'DROP TABLE IF EXISTS usuario',
      'DROP TABLE IF EXISTS tipo_circulo',
      
      // Criar tabelas
      `CREATE TABLE tipo_circulo (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(100) NOT NULL UNIQUE
      ) ENGINE=InnoDB`,
      
      `CREATE TABLE usuario (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        telefone VARCHAR(20),
        email VARCHAR(100) NOT NULL UNIQUE,
        instagram VARCHAR(100),
        tipo_usuario ENUM('admin','coordenador','integrante') NOT NULL DEFAULT 'integrante',
        tipo_circulo_id INT,
        eac_que_fez VARCHAR(100),
        foto VARCHAR(255),
        senha VARCHAR(255) NOT NULL,
        equipe_id INT,
        CONSTRAINT fk_usuario_tipo_circulo FOREIGN KEY (tipo_circulo_id)
          REFERENCES tipo_circulo(id) ON DELETE SET NULL
      ) ENGINE=InnoDB`,
      
      `CREATE TABLE equipe (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        descricao TEXT,
        sobre TEXT,
        funcao VARCHAR(100)
      ) ENGINE=InnoDB`,
      
      // Inserir dados básicos
      `INSERT INTO tipo_circulo (id, nome) VALUES 
        (1, 'Renato e Bruna'),
        (2, 'Rodrigo e Bárbara'),
        (3, 'Fabricio e Jessica'),
        (4, 'Jose e Maycon')`,
        
      `INSERT INTO usuario (id, nome, telefone, email, tipo_usuario, tipo_circulo_id, senha) VALUES 
        (1, 'Renato', '(21) 99711-3839', 'renato@gmail.com', 'admin', 1, '12345'),
        (2, 'Bruna', '(21) 91416-8496', 'bruna@gmail.com', 'admin', 1, '12345'),
        (3, 'teste', '(21) 98198-4919', 'teste@tecom.br', 'integrante', 4, '123456'),
        (4, 'Joao', '(23) 13213-1312', 'joao@email.com', 'admin', 4, '123456')`,
        
      `INSERT INTO equipe (id, nome, descricao) VALUES
        (1, 'Equipe Alpha', 'Equipe principal'),
        (2, 'Equipe Beta', 'Equipe de testes')`
    ];

    console.log('📝 Executando comandos SQL...');
    
    for (let i = 0; i < sqlCommands.length; i++) {
      const sql = sqlCommands[i];
      try {
        await connection.execute(sql);
        console.log(`✅ Comando ${i + 1}/${sqlCommands.length} executado`);
      } catch (error) {
        console.log(`❌ Erro no comando ${i + 1}:`, error.message);
        if (error.message.includes('already exists')) {
          console.log('   (Ignorando - já existe)');
        }
      }
    }

    // Verificar resultados
    const [usuarios] = await connection.execute('SELECT COUNT(*) as total FROM usuario');
    const [tipos] = await connection.execute('SELECT COUNT(*) as total FROM tipo_circulo');
    const [equipes] = await connection.execute('SELECT COUNT(*) as total FROM equipe');

    console.log('\n🎉 SUCESSO! Dados criados:');
    console.log(`👥 Usuários: ${usuarios[0].total}`);
    console.log(`🔄 Tipos de círculo: ${tipos[0].total}`);
    console.log(`🏢 Equipes: ${equipes[0].total}`);
    
    console.log('\n🔑 CREDENCIAIS PARA TESTE:');
    console.log('renato@gmail.com / 12345');
    console.log('bruna@gmail.com / 12345');
    console.log('teste@tecom.br / 123456');
    
    console.log('\n🌐 TESTE AGORA EM:');
    console.log('https://loving-heart-production.up.railway.app');

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

criarTabelasRailway();
