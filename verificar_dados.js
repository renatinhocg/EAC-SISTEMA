const axios = require('axios');

async function verificarDados() {
  try {
    console.log('=== VERIFICAÇÃO DE DADOS BÁSICOS ===\n');
    
    // 1. Testar agendas
    console.log('1. Testando agendas...');
    try {
      const agendaRes = await axios.get('http://localhost:3000/api/agenda');
      console.log(`✅ Agendas encontradas: ${agendaRes.data.length}`);
      if (agendaRes.data.length > 0) {
        console.log('Primeira agenda:', agendaRes.data[0]);
      }
    } catch (err) {
      console.log('❌ Erro ao buscar agendas:', err.message);
    }
    
    // 2. Testar equipes  
    console.log('\n2. Testando equipes...');
    try {
      const equipesRes = await axios.get('http://localhost:3000/api/equipes');
      console.log(`✅ Equipes encontradas: ${equipesRes.data.length}`);
      if (equipesRes.data.length > 0) {
        console.log('Primeira equipe:', equipesRes.data[0]);
      }
    } catch (err) {
      console.log('❌ Erro ao buscar equipes:', err.message);
    }
    
    // 3. Testar usuários de uma equipe
    console.log('\n3. Testando usuários da equipe 6...');
    try {
      const usuariosRes = await axios.get('http://localhost:3000/api/equipes/6/usuarios');
      console.log(`✅ Usuários encontrados: ${usuariosRes.data.length}`);
      if (usuariosRes.data.length > 0) {
        console.log('Primeiro usuário:', usuariosRes.data[0]);
      }
    } catch (err) {
      console.log('❌ Erro ao buscar usuários:', err.response?.status, err.message);
    }
    
    // 4. Testar presenças (se existir agenda)
    console.log('\n4. Testando presenças...');
    try {
      const presencasRes = await axios.get('http://localhost:3000/api/presencas/evento/1/equipe/6');
      console.log(`✅ Presenças encontradas: ${presencasRes.data.length}`);
      if (presencasRes.data.length > 0) {
        console.log('Primeira presença:', presencasRes.data[0]);
      }
    } catch (err) {
      console.log('❌ Erro ao buscar presenças:', err.response?.status, err.message);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

verificarDados();
