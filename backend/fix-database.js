const { Pool } = require('pg');

const pool = new Pool({
  host: 'shortline.proxy.rlwy.net',
  port: 10160,
  database: 'railway',
  user: 'postgres',
  password: 'vjIkxfKggxIaeAfcTQWLeOnDuSZgRQhg',
  ssl: false
});

async function fixDatabase() {
  try {
    console.log('🔧 Aplicando correções na estrutura do banco...');
    
    // 1. Adicionar colunas faltantes na tabela agenda
    console.log('📋 Adicionando colunas na tabela agenda...');
    
    try {
      await pool.query(`ALTER TABLE agenda ADD COLUMN IF NOT EXISTS presenca_ativa BOOLEAN DEFAULT true`);
      console.log('✓ Coluna presenca_ativa adicionada');
    } catch (e) {
      console.log('- Coluna presenca_ativa já existe');
    }
    
    try {
      await pool.query(`ALTER TABLE agenda ADD COLUMN IF NOT EXISTS anexo VARCHAR(255)`);
      console.log('✓ Coluna anexo adicionada');
    } catch (e) {
      console.log('- Coluna anexo já existe');
    }

    // 2. Criar tabela agenda_equipes (relação many-to-many)
    console.log('📋 Criando tabela agenda_equipes...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS agenda_equipes (
        id SERIAL PRIMARY KEY,
        agenda_id INT NOT NULL,
        equipe_id INT NOT NULL,
        FOREIGN KEY (agenda_id) REFERENCES agenda(id) ON DELETE CASCADE,
        FOREIGN KEY (equipe_id) REFERENCES equipe(id) ON DELETE CASCADE,
        UNIQUE(agenda_id, equipe_id)
      )
    `);
    console.log('✓ Tabela agenda_equipes criada');

    // 3. Criar tabela reflexao_equipe (relação many-to-many)
    console.log('📋 Criando tabela reflexao_equipe...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reflexao_equipe (
        id SERIAL PRIMARY KEY,
        reflexao_id INT NOT NULL,
        equipe_id INT NOT NULL,
        FOREIGN KEY (reflexao_id) REFERENCES reflexao(id) ON DELETE CASCADE,
        FOREIGN KEY (equipe_id) REFERENCES equipe(id) ON DELETE CASCADE,
        UNIQUE(reflexao_id, equipe_id)
      )
    `);
    console.log('✓ Tabela reflexao_equipe criada');

    // 4. Adicionar coluna anexo na tabela reflexao
    console.log('📋 Adicionando coluna anexo na tabela reflexao...');
    
    try {
      await pool.query(`ALTER TABLE reflexao ADD COLUMN IF NOT EXISTS anexo VARCHAR(255)`);
      console.log('✓ Coluna anexo adicionada na reflexao');
    } catch (e) {
      console.log('- Coluna anexo já existe na reflexao');
    }

    // 5. Adicionar coluna tipo na tabela checklist
    console.log('📋 Adicionando coluna tipo na tabela checklist...');
    
    try {
      await pool.query(`ALTER TABLE checklist ADD COLUMN IF NOT EXISTS tipo VARCHAR(50) DEFAULT 'geral'`);
      console.log('✓ Coluna tipo adicionada na checklist');
    } catch (e) {
      console.log('- Coluna tipo já existe na checklist');
    }

    // 6. Verificar estruturas finais
    console.log('\n📊 Verificando estruturas...');
    
    const agendaCols = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'agenda' 
      ORDER BY ordinal_position
    `);
    console.log('Colunas da agenda:', agendaCols.rows.map(r => r.column_name));

    const checklistCols = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'checklist' 
      ORDER BY ordinal_position
    `);
    console.log('Colunas do checklist:', checklistCols.rows.map(r => r.column_name));

    const reflexaoCols = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'reflexao' 
      ORDER BY ordinal_position
    `);
    console.log('Colunas da reflexao:', reflexaoCols.rows.map(r => r.column_name));

    // Verificar se as tabelas de relação existem
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name IN ('agenda_equipes', 'reflexao_equipe')
      ORDER BY table_name
    `);
    console.log('Tabelas de relação:', tables.rows.map(r => r.table_name));

    await pool.end();
    console.log('\n✅ Correções aplicadas com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao aplicar correções:', error);
    await pool.end();
  }
}

fixDatabase();
