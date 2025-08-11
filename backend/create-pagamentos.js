// Script para criar a tabela de pagamentos
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
  host: 'shortline.proxy.rlwy.net',
  port: 10160,
  user: 'postgres',
  password: 'vjIkxfKggxIaeAfcTQWLeOnDuSZgRQhg',
  database: 'railway',
  ssl: false
});

async function createPagamentosTable() {
  try {
    await client.connect();
    console.log('✅ Conectado ao PostgreSQL!');
    
    // Verificar se a tabela já existe
    const checkTable = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'pagamento'
      );
    `);
    
    if (checkTable.rows[0].exists) {
      console.log('⚠️ Tabela "pagamento" já existe!');
    } else {
      console.log('🔨 Criando tabela "pagamento"...');
      
      // Ler o arquivo SQL
      const sqlContent = fs.readFileSync(path.join(__dirname, 'create-pagamentos-table.sql'), 'utf8');
      
      // Executar o SQL
      await client.query(sqlContent);
      
      console.log('✅ Tabela "pagamento" criada com sucesso!');
    }
    
    // Verificar estrutura da tabela
    const structure = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'pagamento' 
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 Estrutura da tabela "pagamento":');
    structure.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });
    
  } catch (err) {
    console.error('❌ Erro:', err.message);
    console.error(err);
  } finally {
    await client.end();
  }
}

createPagamentosTable();
