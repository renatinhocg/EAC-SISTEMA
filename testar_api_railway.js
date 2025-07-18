const axios = require('axios');

async function testarAPI() {
  try {
    console.log('🧪 Testando API do backend conectada ao Railway...');
    
    // Test 1: Status da API
    const response = await axios.get('http://localhost:3000');
    console.log('✅ API respondendo:', response.status);
    
    // Test 2: Login (usando dados do Railway)
    const loginData = {
      email: 'almeida@email.com',
      senha: '123456' // Assumindo senha padrão
    };
    
    console.log('\n🔐 Testando login...');
    try {
      const loginResponse = await axios.post('http://localhost:3000/usuarios/login', loginData);
      console.log('✅ Login bem-sucedido!');
      console.log('📝 Dados do usuário:', loginResponse.data);
    } catch (loginError) {
      console.log('⚠️ Erro no login:', loginError.response?.data || loginError.message);
    }
    
    // Test 3: Listar equipes
    console.log('\n📋 Testando listagem de equipes...');
    try {
      const equipesResponse = await axios.get('http://localhost:3000/equipes');
      console.log('✅ Equipes carregadas:', equipesResponse.data.length, 'equipes');
      console.log('📋 Primeira equipe:', equipesResponse.data[0]);
    } catch (equipesError) {
      console.log('⚠️ Erro nas equipes:', equipesError.response?.data || equipesError.message);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Aguardar alguns segundos para o backend inicializar
setTimeout(testarAPI, 3000);
