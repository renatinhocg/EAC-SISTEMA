const db = require('./db');

// Primeiro, vamos ver se conseguimos encontrar a constraint
db.query(`
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conname = 'usuario_tipo_usuario_check'
`, (err, result) => {
  if (err) {
    console.error('❌ Erro:', err);
  } else if (result.rows && result.rows.length > 0) {
    console.log('📋 Constraint encontrada:', result.rows[0].pg_get_constraintdef);
  } else {
    console.log('❌ Constraint não encontrada');
  }
  
  // Vamos também tentar ver o que funciona tentando valores diferentes
  console.log('\n🧪 Testando valores diferentes para tipo_usuario...');
  
  const testValues = ['admin', 'integrante', 'coordenador', 'facilitador', 'participante'];
  let testIndex = 0;
  
  function testNext() {
    if (testIndex >= testValues.length) {
      console.log('🏁 Testes concluídos');
      process.exit(0);
      return;
    }
    
    const value = testValues[testIndex];
    console.log(`🔬 Testando "${value}"...`);
    
    db.query(`
      INSERT INTO usuario (nome, email, tipo_usuario, senha) 
      VALUES ('Teste ${value}', 'teste${testIndex}@exemplo.com', $1, 'hash123')
    `, [value], (err, result) => {
      if (err) {
        console.log(`   ❌ "${value}" falhou: ${err.message}`);
      } else {
        console.log(`   ✅ "${value}" funcionou!`);
      }
      
      testIndex++;
      testNext();
    });
  }
  
  testNext();
});
