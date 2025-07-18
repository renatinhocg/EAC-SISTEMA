// Script para popular o banco MySQL do Railway via linha de comando
const mysql = require('mysql2/promise');
const fs = require('fs');

async function popularBancoRailway() {
  console.log('🚀 Iniciando população do banco Railway...');
  
  // Configuração usando variáveis do Railway
  const dbConfig = {
    host: process.env.MYSQL_HOST || process.env.DB_HOST,
    user: process.env.MYSQL_USER || process.env.DB_USER,
    password: process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD,
    database: process.env.MYSQL_DATABASE || process.env.DB_NAME,
    port: process.env.MYSQL_PORT || process.env.DB_PORT || 3306,
    connectTimeout: 60000,
    acquireTimeout: 60000,
    timeout: 60000
  };

  console.log('🔌 Configuração:', {
    host: dbConfig.host ? 'configurado' : 'NÃO CONFIGURADO',
    user: dbConfig.user ? 'configurado' : 'NÃO CONFIGURADO',
    database: dbConfig.database ? 'configurado' : 'NÃO CONFIGURADO',
    port: dbConfig.port
  });

  if (!dbConfig.host || !dbConfig.user || !dbConfig.password || !dbConfig.database) {
    console.log('❌ Variáveis de ambiente não configuradas.');
    console.log('Execute: railway run node popular_railway.js');
    return;
  }

  let connection;
  try {
    console.log('📡 Conectando ao banco...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado ao MySQL Railway!');

    // Dados para inserir
    const dados = {
      usuarios: [
        [1, 'Administrador do Sistema', 'admin@eac.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 1],
        [2, 'João Silva', 'joao@eac.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 1],
        [3, 'Maria Santos', 'maria@eac.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 1],
        [4, 'Pedro Costa', 'pedro@eac.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 1]
      ],
      equipes: [
        [1, 'Equipe Alpha', 'Equipe de desenvolvimento principal', 1],
        [2, 'Equipe Beta', 'Equipe de testes e qualidade', 1],
        [3, 'Equipe Gamma', 'Equipe de suporte e operações', 1],
        [4, 'Equipe Delta', 'Equipe de pesquisa e inovação', 1]
      ],
      tipo_circulo: [
        [1, 'Círculo de Melhoria', 'Foco em melhorias contínuas'],
        [2, 'Círculo de Inovação', 'Foco em inovação e criatividade'],
        [3, 'Círculo de Qualidade', 'Foco em qualidade e processos'],
        [4, 'Círculo de Segurança', 'Foco em segurança e bem-estar']
      ],
      checklists: [
        [1, 'Checklist de Preparação', 'Itens para preparar reuniões', 1, 1, 1],
        [2, 'Checklist de Inovação', 'Itens para sessões criativas', 2, 1, 1],
        [3, 'Checklist de Qualidade', 'Itens para revisão de processos', 3, 1, 1]
      ],
      checklist_equipes: [
        [5, 1, 2],
        [6, 2, 2],
        [7, 3, 4]
      ]
    };

    // Inserir dados
    console.log('👥 Inserindo usuários...');
    for (const usuario of dados.usuarios) {
      await connection.execute(
        'INSERT IGNORE INTO usuarios (id, nome, email, senha, tipo, ativo, data_criacao) VALUES (?, ?, ?, ?, ?, ?, NOW())',
        usuario
      );
    }

    console.log('🏢 Inserindo equipes...');
    for (const equipe of dados.equipes) {
      await connection.execute(
        'INSERT IGNORE INTO equipes (id, nome, descricao, ativo, data_criacao) VALUES (?, ?, ?, ?, NOW())',
        equipe
      );
    }

    console.log('🔄 Inserindo tipos de círculo...');
    for (const tipo of dados.tipo_circulo) {
      await connection.execute(
        'INSERT IGNORE INTO tipo_circulo (id, nome, descricao) VALUES (?, ?, ?)',
        tipo
      );
    }

    console.log('📋 Inserindo checklists...');
    for (const checklist of dados.checklists) {
      await connection.execute(
        'INSERT IGNORE INTO checklists (id, titulo, descricao, tipo_circulo_id, usuario_criador_id, ativo, data_criacao) VALUES (?, ?, ?, ?, ?, ?, NOW())',
        checklist
      );
    }

    console.log('🔗 Inserindo checklist_equipes...');
    for (const ce of dados.checklist_equipes) {
      await connection.execute(
        'INSERT IGNORE INTO checklist_equipes (id, checklist_id, equipe_id) VALUES (?, ?, ?)',
        ce
      );
    }

    // Verificar se foi inserido
    const [usuarios] = await connection.execute('SELECT COUNT(*) as total FROM usuarios');
    const [equipes] = await connection.execute('SELECT COUNT(*) as total FROM equipes');
    const [checklists] = await connection.execute('SELECT COUNT(*) as total FROM checklists');

    console.log('📊 Resultados:');
    console.log(`   👥 Usuários: ${usuarios[0].total}`);
    console.log(`   🏢 Equipes: ${equipes[0].total}`);
    console.log(`   📋 Checklists: ${checklists[0].total}`);

    console.log('🎉 Banco populado com sucesso!');
    console.log('🔑 Credenciais de teste:');
    console.log('   Admin: admin@eac.com / password');
    console.log('   Usuário: joao@eac.com / password');

  } catch (error) {
    console.error('❌ Erro ao popular banco:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

popularBancoRailway();
