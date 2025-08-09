const axios = require('axios');

async function simularFrontend() {
  try {
    console.log('=== SIMULANDO LÓGICA DO FRONTEND ===\n');
    
    const agendaId = 6; // Agenda que tem presença
    console.log(`Agenda ID: ${agendaId}`);
    
    // 1. Buscar equipes (como o frontend faz)
    const res = await axios.get('http://localhost:3000/api/equipes');
    console.log(`Equipes encontradas: ${res.data.length}`);
    
    if (!Array.isArray(res.data) || res.data.length === 0) {
      console.log('❌ Nenhuma equipe encontrada');
      return;
    }
    
    // 2. Para cada equipe, calcular presença (como o frontend faz)
    console.log('\nProcessando equipes...\n');
    
    const equipesComPresenca = await Promise.all(res.data.map(async eq => {
      try {
        console.log(`--- EQUIPE: ${eq.nome} (ID: ${eq.id}) ---`);
        
        // Buscar usuários da equipe
        const usuariosRes = await axios.get(`http://localhost:3000/api/equipes/${eq.id}/usuarios`);
        const total = usuariosRes.data.length;
        console.log(`Total de usuários: ${total}`);
        
        if (total === 0) {
          console.log(`Resultado: 0% (sem usuários)\n`);
          return {
            id: eq.id,
            nome: eq.nome,
            funcao: eq.funcao || eq.tipo || '',
            presenca: 0
          };
        }
        
        // Buscar presenças
        const presencasRes = await axios.get(`http://localhost:3000/api/presencas/evento/${agendaId}/equipe/${eq.id}`);
        console.log(`Presenças encontradas: ${presencasRes.data.length}`);
        
        // Filtrar presentes (p.presente === 1)
        const presentes = presencasRes.data.filter(p => {
          console.log(`  Usuário ${p.nome}: presente = ${p.presente} (tipo: ${typeof p.presente})`);
          return p.presente === 1;
        });
        
        console.log(`Presentes (presente === 1): ${presentes.length}`);
        
        // Calcular porcentagem
        const percent = total > 0 ? Math.round((presentes.length / total) * 100) : 0;
        console.log(`Porcentagem calculada: ${percent}%\n`);
        
        return {
          id: eq.id,
          nome: eq.nome,
          funcao: eq.funcao || eq.tipo || '',
          presenca: percent
        };
        
      } catch (error) {
        console.log(`❌ Erro ao processar equipe ${eq.nome}:`, error.message);
        return {
          id: eq.id,
          nome: eq.nome,
          funcao: eq.funcao || eq.tipo || '',
          presenca: 0
        };
      }
    }));
    
    console.log('=== RESULTADO FINAL ===');
    equipesComPresenca.forEach(eq => {
      console.log(`${eq.nome}: ${eq.presenca}%`);
    });
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

simularFrontend();
