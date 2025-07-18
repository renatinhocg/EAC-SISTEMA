// Script para popular o banco via requisições HTTP diretas ao backend
const axios = require('axios');

const API_URL = 'https://loving-heart-production.up.railway.app';

async function criarTabelasViaAPI() {
  console.log('🛠️ Criando tabelas via API...');
  
  try {
    // Primeiro vamos tentar criar um usuário admin diretamente
    const response = await axios.post(`${API_URL}/api/usuarios`, {
      nome: 'Administrador Sistema',
      email: 'admin@eac.com',
      senha: '12345',
      tipo_usuario: 'admin'
    });
    
    console.log('✅ Usuário admin criado:', response.data);
    
  } catch (error) {
    console.log('Status:', error.response?.status);
    console.log('Erro:', error.response?.data);
    
    if (error.response?.data?.error?.code === 'ER_NO_SUCH_TABLE') {
      console.log('\n❌ CONFIRMADO: Tabelas não existem no Railway!');
      console.log('\n🔧 SOLUÇÃO:');
      console.log('1. No Railway, clique em "Connect" (botão azul)');
      console.log('2. Isso abrirá o terminal/query editor');
      console.log('3. Cole o conteúdo do arquivo apenas_tabelas.sql');
      console.log('4. Execute para criar as tabelas');
      console.log('5. Depois execute PRODUCAO_COMPLETA_RAILWAY.sql para os dados');
    }
  }
}

criarTabelasViaAPI();
