const axios = require('axios');

async function testarAPIPostgreSQL() {
  try {
    console.log('🧪 Testando API do backend com PostgreSQL...');
    
    // Test 1: Status da API
    const response = await axios.get('http://localhost:3000');
    console.log('✅ API respondendo:', response.status);
    
    // Test 2: Listar equipes
    console.log('\n📋 Testando listagem de equipes...');
    try {
      const equipesResponse = await axios.get('http://localhost:3000/equipes');
      console.log('✅ Equipes carregadas:', equipesResponse.data.length, 'equipes');
      if (equipesResponse.data.length > 0) {
        console.log('📋 Primeira equipe:', equipesResponse.data[0]);
      }
    } catch (equipesError) {
      console.log('⚠️ Erro nas equipes:', equipesError.response?.data || equipesError.message);
    }
    
    // Test 3: Listar tipo círculo
    console.log('\n🔵 Testando listagem de tipo círculo...');
    try {
      const tipoResponse = await axios.get('http://localhost:3000/tipo_circulo');
      console.log('✅ Tipos carregados:', tipoResponse.data.length, 'tipos');
      if (tipoResponse.data.length > 0) {
        console.log('📋 Primeiro tipo:', tipoResponse.data[0]);
      }
    } catch (tipoError) {
      console.log('⚠️ Erro nos tipos:', tipoError.response?.data || tipoError.message);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Aguardar alguns segundos para o backend inicializar
setTimeout(testarAPIPostgreSQL, 3000);
