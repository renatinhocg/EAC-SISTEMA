const axios = require('axios');

async function criarPresencaTeste() {
  try {
    console.log('=== CRIANDO PRESENÇA DE TESTE ===\n');
    
    // Pegar a primeira agenda
    const agendaRes = await axios.get('http://localhost:3000/api/agendas');
    const primeiraAgenda = agendaRes.data[0];
    console.log(`Usando agenda: ${primeiraAgenda.id} - ${primeiraAgenda.titulo}`);
    
    // Criar presença para usuário 1 na equipe 6 como "presente"
    console.log('\nCriando presença teste...');
    const resultado = await axios.post(
      `http://localhost:3000/api/presencas/evento/${primeiraAgenda.id}/equipe/6/usuario/1`,
      { status: 'ok' } // 'ok' = presente
    );
    
    console.log('✅ Presença criada:', resultado.data);
    
    // Verificar se foi salva
    console.log('\nVerificando presença salva...');
    const presencasRes = await axios.get(`http://localhost:3000/api/presencas/evento/${primeiraAgenda.id}/equipe/6`);
    console.log(`Presenças encontradas: ${presencasRes.data.length}`);
    
    if (presencasRes.data.length > 0) {
      console.log('Dados da presença:', presencasRes.data[0]);
      
      // Calcular porcentagem
      const usuariosRes = await axios.get('http://localhost:3000/api/equipes/6/usuarios');
      const totalUsuarios = usuariosRes.data.length;
      const presentes = presencasRes.data.filter(p => p.presente === 1).length;
      const porcentagem = totalUsuarios > 0 ? Math.round((presentes / totalUsuarios) * 100) : 0;
      
      console.log(`\nCÁLCULO FINAL:`);
      console.log(`Total de usuários: ${totalUsuarios}`);
      console.log(`Presentes (presente === 1): ${presentes}`);
      console.log(`Porcentagem: ${porcentagem}%`);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    }
  }
}

criarPresencaTeste();
