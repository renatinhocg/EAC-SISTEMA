const { Client } = require('pg');
require('dotenv').config({ path: './backend/.env' });

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false
  }
});

async function adicionarReflexoes() {
  try {
    await client.connect();
    console.log('🔗 Conectado ao PostgreSQL Railway\n');
    
    // Verificar IDs de usuários válidos
    const usuarios = await client.query('SELECT id, nome FROM usuario ORDER BY id LIMIT 10');
    console.log('👤 Primeiros usuários:');
    usuarios.rows.forEach(u => console.log(`   ID ${u.id}: ${u.nome}`));
    
    // Verificar IDs de equipes válidas
    const equipes = await client.query('SELECT id, nome FROM equipe ORDER BY id LIMIT 5');
    console.log('\n👥 Primeiras equipes:');
    equipes.rows.forEach(e => console.log(`   ID ${e.id}: ${e.nome}`));
    
    // Usar IDs reais para reflexões
    const primeiroUsuario = usuarios.rows[0]?.id;
    const segundoUsuario = usuarios.rows[1]?.id;
    const terceiroUsuario = usuarios.rows[2]?.id;
    
    const primeiraEquipe = equipes.rows[0]?.id;
    const segundaEquipe = equipes.rows[1]?.id;
    
    if (!primeiroUsuario || !primeiraEquipe) {
      console.log('❌ Não encontrei usuários ou equipes válidos');
      return;
    }
    
    console.log('\n💭 Adicionando reflexões com IDs corretos...');
    
    const reflexoes = [
      {
        titulo: 'Reflexão sobre Servir',
        conteudo: 'Durante este encontro, aprendi muito sobre o verdadeiro significado de servir ao próximo. O EAC me mostrou que servir não é apenas uma ação, mas um estado de espírito.',
        usuario_id: primeiroUsuario,
        equipe_id: primeiraEquipe
      },
      {
        titulo: 'Experiência na Equipe',
        conteudo: 'Trabalhar em equipe foi uma experiência transformadora. Cada gesto de cuidado com os participantes me ensinou sobre hospitalidade cristã.',
        usuario_id: segundoUsuario || primeiroUsuario,
        equipe_id: primeiraEquipe
      },
      {
        titulo: 'Aprendizado sobre Liderança',
        conteudo: 'Como participante do EAC, descobri que liderar é primeiro aprender a servir. Este encontro me ensinou humildade e responsabilidade.',
        usuario_id: terceiroUsuario || primeiroUsuario,
        equipe_id: segundaEquipe || primeiraEquipe
      }
    ];
    
    let sucessos = 0;
    for (const reflexao of reflexoes) {
      try {
        await client.query(`
          INSERT INTO reflexao (titulo, conteudo, usuario_id, equipe_id) 
          VALUES ($1, $2, $3, $4)
        `, [reflexao.titulo, reflexao.conteudo, reflexao.usuario_id, reflexao.equipe_id]);
        sucessos++;
        console.log(`   ✅ Reflexão "${reflexao.titulo}" adicionada`);
      } catch (err) {
        console.log(`   ❌ Erro: ${err.message}`);
      }
    }
    
    console.log(`\n✅ Total: ${sucessos} reflexões adicionadas`);
    
    // Contagem final
    console.log('\n📊 DADOS FINAIS PRONTOS PARA PRODUÇÃO:');
    const tabelas = ['usuario', 'equipe', 'checklist', 'agenda', 'reflexao', 'notificacao', 'tipo_circulo'];
    
    for (const tabela of tabelas) {
      try {
        const result = await client.query(`SELECT COUNT(*) as total FROM ${tabela}`);
        console.log(`   ${tabela}: ${result.rows[0].total} registros`);
      } catch (err) {
        console.log(`   ${tabela}: erro - ${err.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await client.end();
  }
}

adicionarReflexoes();
