// Teste de login via Node.js
const axios = require('axios');

async function testarLogin() {
  console.log('🔐 Testando login na aplicação...');
  
  try {
    const response = await axios.post('https://loving-heart-production.up.railway.app/api/usuarios/login', {
      email: 'renato@gmail.com',
      senha: '12345'
    });
    
    console.log('✅ LOGIN FUNCIONANDO!');
    console.log('Token recebido:', response.data.token ? 'SIM' : 'NÃO');
    console.log('Usuário:', response.data.usuario ? response.data.usuario.nome : 'N/A');
    
  } catch (error) {
    console.log('❌ Erro no login:', error.response?.data || error.message);
  }
}

testarLogin();
