const axios = require('axios');

async function verificarAgenda() {
  try {
    console.log('=== VERIFICAÇÃO DE AGENDA ===\n');
    
    const agendaRes = await axios.get('http://localhost:3000/api/agenda');
    console.log(`Total de agendas: ${agendaRes.data.length}`);
    
    // Mostrar primeiras 3 agendas
    for (let i = 0; i < Math.min(3, agendaRes.data.length); i++) {
      const agenda = agendaRes.data[i];
      console.log(`\nAgenda ${i + 1}:`, {
        id: agenda.id,
        nome: agenda.nome,
        data: agenda.data,
        ativa: agenda.ativa
      });
      
      // Testar presenças para esta agenda
      try {
        const presencasRes = await axios.get(`http://localhost:3000/api/presencas/evento/${agenda.id}/equipe/6`);
        console.log(`  ✅ Presenças encontradas: ${presencasRes.data.length}`);
        if (presencasRes.data.length > 0) {
          console.log(`  Primeira presença:`, presencasRes.data[0]);
        }
      } catch (err) {
        console.log(`  ❌ Sem presenças para agenda ${agenda.id}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

verificarAgenda();
