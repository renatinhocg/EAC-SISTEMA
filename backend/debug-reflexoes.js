const db = require('./db');

console.log('🔍 Debugando reflexões e agendas...');

// Consulta as reflexões com suas agendas
const sqlQuery = `
  SELECT 
    r.id, 
    r.texto, 
    r.data as reflexao_data,
    r.agenda_id,
    a.titulo as agenda_nome,
    a.data as agenda_data
  FROM reflexao r
  LEFT JOIN agenda a ON r.agenda_id = a.id
  ORDER BY r.id DESC
  LIMIT 5
`;

db.query(sqlQuery, [], (err, results) => {
  if (err) {
    console.error('❌ Erro na query:', err);
    process.exit(1);
  }
  
  console.log('📊 Reflexões encontradas:', results.length);
  console.log('📝 Dados das reflexões:');
  
  results.forEach((reflexao, index) => {
    console.log(`\n${index + 1}. Reflexão ID: ${reflexao.id}`);
    console.log(`   Texto: ${reflexao.texto.substring(0, 50)}...`);
    console.log(`   Data da reflexão: ${reflexao.reflexao_data}`);
    console.log(`   Agenda ID: ${reflexao.agenda_id}`);
    console.log(`   Nome do evento: ${reflexao.agenda_nome || 'SEM EVENTO'}`);
    console.log(`   Data do evento: ${reflexao.agenda_data || 'SEM DATA'}`);
  });
  
  // Também verificar quantas reflexões têm agenda_id null
  db.query('SELECT COUNT(*) as total FROM reflexao WHERE agenda_id IS NULL', [], (err2, nullResults) => {
    if (!err2) {
      console.log(`\n📈 Reflexões SEM evento associado: ${nullResults[0].total}`);
    }
    
    db.query('SELECT COUNT(*) as total FROM reflexao WHERE agenda_id IS NOT NULL', [], (err3, withResults) => {
      if (!err3) {
        console.log(`📈 Reflexões COM evento associado: ${withResults[0].total}`);
      }
      process.exit(0);
    });
  });
});
