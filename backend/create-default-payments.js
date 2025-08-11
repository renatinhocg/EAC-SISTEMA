// Script para criar registros de pagamento padrão para usuários sem pagamento
const { Client } = require('pg');

const client = new Client({
  host: 'shortline.proxy.rlwy.net',
  port: 10160,
  user: 'postgres',
  password: 'vjIkxfKggxIaeAfcTQWLeOnDuSZgRQhg',
  database: 'railway',
  ssl: false
});

async function createDefaultPayments() {
  try {
    await client.connect();
    console.log('✅ Conectado ao PostgreSQL!');
    
    // Buscar usuários que não têm registro de pagamento
    const usuariosSemPagamento = await client.query(`
      SELECT u.id, u.nome 
      FROM usuario u 
      LEFT JOIN pagamento p ON u.id = p.usuario_id 
      WHERE p.id IS NULL
    `);
    
    console.log(`📋 Encontrados ${usuariosSemPagamento.rows.length} usuários sem pagamento:`);
    
    for (const usuario of usuariosSemPagamento.rows) {
      console.log(`  - ${usuario.nome} (ID: ${usuario.id})`);
      
      // Criar registro de pagamento padrão
      await client.query(`
        INSERT INTO pagamento (usuario_id, valor, status) 
        VALUES ($1, 25.00, 'pendente')
      `, [usuario.id]);
      
      console.log(`    ✅ Registro de pagamento criado para ${usuario.nome}`);
    }
    
    // Verificar resultados
    const totalPagamentos = await client.query('SELECT COUNT(*) as total FROM pagamento');
    console.log(`\n📊 Total de registros de pagamento: ${totalPagamentos.rows[0].total}`);
    
  } catch (err) {
    console.error('❌ Erro:', err.message);
    console.error(err);
  } finally {
    await client.end();
  }
}

createDefaultPayments();
