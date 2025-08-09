const axios = require('axios');

async function testarComRotaCorreta() {
  try {
    console.log('=== TESTE COM ROTA CORRETA ===\n');
    
    // 1. Testar agendas (CORRIGIDO: /api/agendas)
    console.log('1. Testando agendas...');
    const agendaRes = await axios.get('http://localhost:3000/api/agendas');
    console.log(`✅ Agendas encontradas: ${agendaRes.data.length}`);
    
    if (agendaRes.data.length > 0) {
      const primeiraAgenda = agendaRes.data[0];
      console.log('Primeira agenda:', primeiraAgenda);
      
      // 2. Testar presenças com agenda real
      console.log(`\n2. Testando presenças para agenda ${primeiraAgenda.id}...`);
      try {
        const presencasRes = await axios.get(`http://localhost:3000/api/presencas/evento/${primeiraAgenda.id}/equipe/6`);
        console.log(`✅ Presenças encontradas: ${presencasRes.data.length}`);
        
        if (presencasRes.data.length > 0) {
          console.log('Dados das presenças:', presencasRes.data.map(p => ({
            usuario_id: p.usuario_id,
            nome: p.nome,
            presente: p.presente,
            tipo: typeof p.presente
          })));
          
          // 3. Calcular porcentagem
          const usuariosRes = await axios.get('http://localhost:3000/api/equipes/6/usuarios');
          const totalUsuarios = usuariosRes.data.length;
          const presentes = presencasRes.data.filter(p => p.presente === 1).length;
          const porcentagem = totalUsuarios > 0 ? Math.round((presentes / totalUsuarios) * 100) : 0;
          
          console.log(`\n3. CÁLCULO DE PORCENTAGEM:`);
          console.log(`Total de usuários: ${totalUsuarios}`);
          console.log(`Presentes (presente === 1): ${presentes}`);
          console.log(`Porcentagem: ${porcentagem}%`);
        }
        
      } catch (err) {
        console.log(`❌ Sem presenças para agenda ${primeiraAgenda.id}:`, err.response?.status);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testarComRotaCorreta();
