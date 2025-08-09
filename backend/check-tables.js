const db = require('./db');

console.log('🔍 Verificando se tabela usuario existe...');

// Primeiro, listar todas as tabelas
db.query(`
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename
`, (err, result) => {
  if (err) {
    console.error('❌ Erro:', err);
  } else {
    console.log('📋 Tabelas existentes:');
    if (result.rows && result.rows.length > 0) {
      result.rows.forEach(row => {
        console.log(`- ${row.tablename}`);
      });
    } else {
      console.log('Nenhuma tabela encontrada');
    }
  }
  
  // Tentar selecionar da tabela usuario
  db.query('SELECT * FROM usuario LIMIT 1', (err2, result2) => {
    if (err2) {
      console.error('❌ Erro ao consultar usuario:', err2.message);
    } else {
      console.log('\n✅ Tabela usuario existe e tem', result2.rows ? result2.rows.length : 0, 'registros');
      if (result2.rows && result2.rows.length > 0) {
        console.log('📋 Primeiro registro:', result2.rows[0]);
      }
    }
    process.exit(0);
  });
});
