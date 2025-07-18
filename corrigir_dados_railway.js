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

async function corrigirDados() {
  try {
    await client.connect();
    console.log('🔗 Conectado ao PostgreSQL Railway\n');
    
    // Criar alguns eventos de agenda manualmente (corrigindo formato de data)
    console.log('📅 Adicionando eventos de agenda...');
    
    const eventos = [
      {
        titulo: 'Pós-Montagem',
        descricao: 'Evento pós-montagem do EAC',
        data_evento: '2025-08-17 17:00:00',
        local_evento: 'Igreja Central',
        tipo_circulo_id: 1
      },
      {
        titulo: '1ª Preparatória',
        descricao: 'Primeira reunião preparatória',
        data_evento: '2025-08-24 17:00:00',
        local_evento: 'Sala de reuniões',
        tipo_circulo_id: 1
      },
      {
        titulo: '2ª Preparatória',
        descricao: 'Segunda reunião preparatória',
        data_evento: '2025-08-31 17:00:00',
        local_evento: 'Sala de reuniões',
        tipo_circulo_id: 2
      },
      {
        titulo: '3ª Preparatória',
        descricao: 'Terceira reunião preparatória',
        data_evento: '2025-09-07 17:00:00',
        local_evento: 'Sala de reuniões',
        tipo_circulo_id: 2
      },
      {
        titulo: 'EPAC',
        descricao: 'Encontro Paroquial de Adolescentes com Cristo',
        data_evento: '2025-09-25 19:00:00',
        local_evento: 'Igreja Principal',
        tipo_circulo_id: 3
      },
      {
        titulo: 'Reunião de Equipe - Garçom',
        descricao: 'Reunião da equipe de garçom',
        data_evento: '2025-08-10 15:00:00',
        local_evento: 'Cozinha da Igreja',
        tipo_circulo_id: 1
      },
      {
        titulo: 'Reunião de Equipe - Sala',
        descricao: 'Reunião da equipe de sala',
        data_evento: '2025-08-12 16:00:00',
        local_evento: 'Auditório',
        tipo_circulo_id: 2
      },
      {
        titulo: 'Reunião de Equipe - Banda',
        descricao: 'Ensaio da banda',
        data_evento: '2025-08-15 18:00:00',
        local_evento: 'Sala de música',
        tipo_circulo_id: 3
      },
      {
        titulo: 'Formação Espiritual',
        descricao: 'Sessão de formação espiritual para coordenadores',
        data_evento: '2025-08-20 19:30:00',
        local_evento: 'Capela',
        tipo_circulo_id: 4
      }
    ];
    
    let sucessosAgenda = 0;
    for (const evento of eventos) {
      try {
        await client.query(`
          INSERT INTO agenda (titulo, descricao, data_evento, local_evento, tipo_circulo_id) 
          VALUES ($1, $2, $3, $4, $5)
        `, [evento.titulo, evento.descricao, evento.data_evento, evento.local_evento, evento.tipo_circulo_id]);
        sucessosAgenda++;
      } catch (err) {
        console.log(`❌ Erro evento ${evento.titulo}: ${err.message}`);
      }
    }
    
    console.log(`✅ Agenda: ${sucessosAgenda} eventos adicionados`);
    
    // Criar algumas reflexões de teste
    console.log('\n💭 Adicionando reflexões...');
    
    const reflexoes = [
      {
        titulo: 'Reflexão sobre Servir',
        conteudo: 'Durante este encontro, aprendi muito sobre o verdadeiro significado de servir ao próximo. O EAC me mostrou que servir não é apenas uma ação, mas um estado de espírito.',
        usuario_id: 1,
        equipe_id: 1
      },
      {
        titulo: 'Experiência na Equipe de Garçom',
        conteudo: 'Trabalhar na equipe de garçom foi uma experiência transformadora. Cada gesto de cuidado com os participantes me ensinou sobre hospitalidade cristã.',
        usuario_id: 2,
        equipe_id: 1
      },
      {
        titulo: 'Aprendizado sobre Liderança',
        conteudo: 'Como coordenador, descobri que liderar é primeiro aprender a servir. O EAC me ensinou humildade e responsabilidade.',
        usuario_id: 4,
        equipe_id: 2
      },
      {
        titulo: 'O Poder da Música no EAC',
        conteudo: 'Participar da banda me fez entender como a música pode tocar corações e aproximar as pessoas de Deus. Cada canção teve um propósito especial.',
        usuario_id: 3,
        equipe_id: 3
      },
      {
        titulo: 'Reflexão Final do Encontro',
        conteudo: 'Ao final deste EAC, posso dizer que não só os participantes foram transformados, mas nós, da equipe, também crescemos espiritualmente. Gratidão define este momento.',
        usuario_id: 1,
        equipe_id: 1
      }
    ];
    
    let sucessosReflexao = 0;
    for (const reflexao of reflexoes) {
      try {
        await client.query(`
          INSERT INTO reflexao (titulo, conteudo, usuario_id, equipe_id) 
          VALUES ($1, $2, $3, $4)
        `, [reflexao.titulo, reflexao.conteudo, reflexao.usuario_id, reflexao.equipe_id]);
        sucessosReflexao++;
      } catch (err) {
        console.log(`❌ Erro reflexão ${reflexao.titulo}: ${err.message}`);
      }
    }
    
    console.log(`✅ Reflexões: ${sucessosReflexao} reflexões adicionadas`);
    
    // Adicionar algumas notificações relevantes
    console.log('\n🔔 Adicionando notificações...');
    
    const notificacoes = [
      {
        titulo: 'Bem-vindos ao EAC!',
        mensagem: 'Sejam bem-vindos ao sistema do EAC. Aqui vocês poderão acompanhar todas as atividades, eventos e compartilhar suas reflexões.',
        equipe_id: null
      },
      {
        titulo: 'Reunião da Equipe de Garçom',
        mensagem: 'Lembrete: Reunião da equipe de garçom no domingo às 15h na cozinha da igreja.',
        equipe_id: 1
      },
      {
        titulo: 'Ensaio da Banda',
        mensagem: 'Pessoal da banda, não esqueçam do ensaio de quinta-feira às 18h. Vamos preparar as músicas para o encontro.',
        equipe_id: 3
      },
      {
        titulo: 'Preparação da Sala',
        mensagem: 'Equipe de sala, precisamos chegar 2 horas antes para organizar tudo. Contamos com vocês!',
        equipe_id: 4
      }
    ];
    
    let sucessosNotif = 0;
    for (const notif of notificacoes) {
      try {
        await client.query(`
          INSERT INTO notificacao (titulo, mensagem, equipe_id) 
          VALUES ($1, $2, $3)
        `, [notif.titulo, notif.mensagem, notif.equipe_id]);
        sucessosNotif++;
      } catch (err) {
        console.log(`❌ Erro notificação ${notif.titulo}: ${err.message}`);
      }
    }
    
    console.log(`✅ Notificações: ${sucessosNotif} notificações adicionadas`);
    
    // Verificar totais finais
    console.log('\n📊 CONTAGEM FINAL APÓS CORREÇÕES:');
    const tabelas = ['usuario', 'equipe', 'checklist', 'agenda', 'presenca', 'reflexao', 'notificacao', 'tipo_circulo'];
    
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

corrigirDados();
