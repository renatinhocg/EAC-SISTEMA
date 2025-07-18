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

const criarTabelas = `
-- Tabela tipo_circulo
CREATE TABLE IF NOT EXISTS tipo_circulo (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) UNIQUE NOT NULL
);

-- Tabela equipe
CREATE TABLE IF NOT EXISTS equipe (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  sobre TEXT,
  funcao VARCHAR(100)
);

-- Tabela usuario
CREATE TABLE IF NOT EXISTS usuario (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE,
  senha VARCHAR(255),
  telefone VARCHAR(20),
  sobre TEXT,
  foto VARCHAR(255),
  tipo_usuario VARCHAR(50) DEFAULT 'integrante',
  equipe_id INTEGER REFERENCES equipe(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela agenda
CREATE TABLE IF NOT EXISTS agenda (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(200) NOT NULL,
  descricao TEXT,
  data_evento TIMESTAMP NOT NULL,
  local_evento VARCHAR(200),
  tipo_circulo_id INTEGER REFERENCES tipo_circulo(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela checklist
CREATE TABLE IF NOT EXISTS checklist (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(200) NOT NULL,
  descricao TEXT,
  agenda_id INTEGER REFERENCES agenda(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela checklist_equipes
CREATE TABLE IF NOT EXISTS checklist_equipes (
  id SERIAL PRIMARY KEY,
  checklist_id INTEGER REFERENCES checklist(id) ON DELETE CASCADE,
  equipe_id INTEGER REFERENCES equipe(id) ON DELETE CASCADE,
  concluido BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela notificacao
CREATE TABLE IF NOT EXISTS notificacao (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(200) NOT NULL,
  mensagem TEXT NOT NULL,
  equipe_id INTEGER REFERENCES equipe(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela notificacao_lidos (equivalente a notificacao_lida)
CREATE TABLE IF NOT EXISTS notificacao_lidos (
  id SERIAL PRIMARY KEY,
  notificacao_id INTEGER REFERENCES notificacao(id) ON DELETE CASCADE,
  usuario_id INTEGER REFERENCES usuario(id) ON DELETE CASCADE,
  data_lida TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela presenca
CREATE TABLE IF NOT EXISTS presenca (
  id SERIAL PRIMARY KEY,
  agenda_id INTEGER REFERENCES agenda(id) ON DELETE CASCADE,
  equipe_id INTEGER REFERENCES equipe(id) ON DELETE CASCADE,
  usuario_id INTEGER REFERENCES usuario(id) ON DELETE CASCADE,
  presente BOOLEAN DEFAULT FALSE,
  observacao TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela reflexao
CREATE TABLE IF NOT EXISTS reflexao (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(200) NOT NULL,
  conteudo TEXT,
  arquivo VARCHAR(255),
  usuario_id INTEGER REFERENCES usuario(id),
  equipe_id INTEGER REFERENCES equipe(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

async function criarTabelasPostgreSQL() {
  const client = new Client(config);
  
  try {
    console.log('🔧 Criando tabelas no PostgreSQL Railway...');
    
    await client.connect();
    console.log('✅ Conectado ao PostgreSQL');
    
    // Executar criação das tabelas
    await client.query(criarTabelas);
    console.log('✅ Tabelas criadas com sucesso!');
    
    // Verificar tabelas criadas
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('📊 Tabelas criadas:');
    result.rows.forEach(row => {
      console.log(`  ✓ ${row.table_name}`);
    });
    
    console.log(`\n🎉 PostgreSQL configurado com ${result.rows.length} tabelas!`);
    
  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error.message);
  } finally {
    await client.end();
  }
}

criarTabelasPostgreSQL();
