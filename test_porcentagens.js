const axios = require('axios');

async function testarPorcentagens() {
  try {
    console.log('=== TESTE DE PORCENTAGENS ===\n');
    
    // 1. Buscar equipes
    console.log('1. Buscando equipes...');
    const equipesRes = await axios.get('http://localhost:3000/api/equipes');
    console.log(`Encontradas ${equipesRes.data.length} equipes`);
    
    if (equipesRes.data.length === 0) {
      console.log('❌ Nenhuma equipe encontrada!');
      return;
    }
    
    // 2. Buscar agenda (vamos usar ID 1)
    const agendaId = 1;
    console.log(`\n2. Testando para agenda ID: ${agendaId}`);
    
    // 3. Para cada equipe, calcular porcentagem
    for (const equipe of equipesRes.data.slice(0, 3)) { // Só as 3 primeiras
      console.log(`\n--- EQUIPE: ${equipe.nome} (ID: ${equipe.id}) ---`);
      
      try {
        // Buscar usuários da equipe
        const usuariosRes = await axios.get(`http://localhost:3000/api/equipes/${equipe.id}/usuarios`);
        const totalUsuarios = usuariosRes.data.length;
        console.log(`Total de usuários: ${totalUsuarios}`);
        
        if (totalUsuarios === 0) {
          console.log('⚠️ Nenhum usuário nesta equipe');
          continue;
        }
        
        // Buscar presenças
        const presencasRes = await axios.get(`http://localhost:3000/api/presencas/evento/${agendaId}/equipe/${equipe.id}`);
        console.log(`Presenças encontradas: ${presencasRes.data.length}`);
        console.log('Dados das presenças:', presencasRes.data.map(p => ({
          usuario_id: p.usuario_id,
          nome: p.nome,
          presente: p.presente,
          tipo: typeof p.presente
        })));
        
        // Calcular porcentagem
        const presentes = presencasRes.data.filter(p => p.presente === 1).length;
        const porcentagem = totalUsuarios > 0 ? Math.round((presentes / totalUsuarios) * 100) : 0;
        
        console.log(`Presentes (presente === 1): ${presentes}`);
        console.log(`Porcentagem calculada: ${porcentagem}%`);
        
      } catch (err) {
        console.log(`❌ Erro ao processar equipe ${equipe.nome}:`, err.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testarPorcentagens();
