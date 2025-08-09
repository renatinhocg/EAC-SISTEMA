const db = require('./db');

console.log('🔍 Verificando constraints da tabela usuario...');

db.query(`
SELECT 
    conname AS constraint_name,
    contype AS constraint_type,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint 
WHERE conrelid = 'usuario'::regclass
`, (err, result) => {
  if (err) {
    console.error('❌ Erro:', err);
  } else {
    console.log('📋 Constraints encontradas:');
    if (result.rows && result.rows.length > 0) {
      result.rows.forEach(row => {
        console.log(`- ${row.constraint_name}: ${row.constraint_definition}`);
      });
    } else {
      console.log('Nenhuma constraint encontrada');
    }
  }
  
  // Verificar também a definição da tabela
  db.query(`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns 
    WHERE table_name = 'usuario'
    ORDER BY ordinal_position
  `, (err2, result2) => {
    if (err2) {
      console.error('❌ Erro ao verificar colunas:', err2);
    } else {
      console.log('\n📋 Colunas da tabela usuario:');
      if (result2.rows && result2.rows.length > 0) {
        result2.rows.forEach(col => {
          console.log(`- ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable}) default: ${col.column_default}`);
        });
      } else {
        console.log('Nenhuma coluna encontrada');
      }
    }
    process.exit(0);
  });
});
