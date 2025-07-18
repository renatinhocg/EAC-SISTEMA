// Script para popular o banco via API do backend já implantado
const axios = require('axios');

const API_URL = 'https://loving-heart-production.up.railway.app';

// Dados para popular
const dadosIniciais = {
  usuarios: [
    {
      nome: 'Administrador do Sistema',
      email: 'admin@eac.com',
      senha: 'password',
      tipo: 'admin'
    },
    {
      nome: 'João Silva',
      email: 'joao@eac.com',
      senha: 'password',
      tipo: 'user'
    },
    {
      nome: 'Maria Santos',
      email: 'maria@eac.com',
      senha: 'password',
      tipo: 'user'
    }
  ],
  equipes: [
    {
      nome: 'Equipe Alpha',
      descricao: 'Equipe de desenvolvimento principal'
    },
    {
      nome: 'Equipe Beta',
      descricao: 'Equipe de testes e qualidade'
    },
    {
      nome: 'Equipe Gamma',
      descricao: 'Equipe de suporte e operações'
    }
  ]
};

async function popularViaAPI() {
  console.log('🌐 Populando banco via API...');
  
  try {
    // Fazer login como admin primeiro
    console.log('🔐 Fazendo login...');
    const loginResponse = await axios.post(`${API_URL}/api/usuarios/login`, {
      email: 'admin@eac.com',
      senha: 'password'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso');
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // Popular usuários
    console.log('👥 Criando usuários...');
    for (const usuario of dadosIniciais.usuarios) {
      try {
        await axios.post(`${API_URL}/api/usuarios`, usuario, { headers });
        console.log(`✅ Usuário ${usuario.nome} criado`);
      } catch (error) {
        if (error.response?.status === 400 && error.response.data.message?.includes('já existe')) {
          console.log(`⚠️ Usuário ${usuario.nome} já existe`);
        } else {
          console.log(`❌ Erro ao criar ${usuario.nome}:`, error.response?.data?.message || error.message);
        }
      }
    }
    
    // Popular equipes
    console.log('🏢 Criando equipes...');
    for (const equipe of dadosIniciais.equipes) {
      try {
        await axios.post(`${API_URL}/api/equipes`, equipe, { headers });
        console.log(`✅ Equipe ${equipe.nome} criada`);
      } catch (error) {
        if (error.response?.status === 400 && error.response.data.message?.includes('já existe')) {
          console.log(`⚠️ Equipe ${equipe.nome} já existe`);
        } else {
          console.log(`❌ Erro ao criar ${equipe.nome}:`, error.response?.data?.message || error.message);
        }
      }
    }
    
    console.log('\n🎉 População via API concluída!');
    console.log('\n📋 Credenciais de teste:');
    console.log('🔑 admin@eac.com / password (administrador)');
    console.log('🔑 joao@eac.com / password (usuário)');
    console.log('🔑 maria@eac.com / password (usuário)');
    
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('❌ Não foi possível fazer login. Verifique se o usuário admin já existe.');
      console.log('💡 Tente criar o usuário admin manualmente primeiro.');
    } else {
      console.error('❌ Erro na população via API:', error.response?.data || error.message);
    }
  }
}

popularViaAPI();
