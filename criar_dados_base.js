const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
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

async function limparDados() {
  console.log('🧹 Limpando dados existentes...');
  
  // Ordem para evitar problemas com foreign keys
  const tabelas = ['checklist_equipes', 'notificacao_lidos', 'notificacao', 'reflexao', 'presenca', 'agenda', 'checklist', 'usuario'];
  
  for (const tabela of tabelas) {
    try {
      await client.query(`DELETE FROM ${tabela}`);
      console.log(`   ✅ ${tabela} limpo`);
    } catch (err) {
      console.log(`   ❌ Erro ao limpar ${tabela}: ${err.message}`);
    }
  }
}

async function migrarUsuarios() {
  console.log('\n👤 Migrando usuários...');
  
  // Extrair dados do backup - exemplo de um usuário
  const usuarios = [
    { nome: 'Renato', email: 'renato@gmail.com', senha: '12345', telefone: '(21) 99711-3839', tipo_usuario: 'admin', equipe_id: null },
    { nome: 'Bruna', email: 'bruna@gmail.com', senha: '12345', telefone: '(21) 91416-8496', tipo_usuario: 'admin', equipe_id: 1 },
    { nome: 'teste', email: 'teste@tecom.br', senha: '123456', telefone: '(21) 98198-4919', tipo_usuario: 'integrante', equipe_id: null },
    { nome: 'Joao', email: 'joao@email.com', senha: '123456', telefone: '(23) 13213-1312', tipo_usuario: 'admin', equipe_id: 2 }
  ];
  
  let sucessos = 0;
  for (const user of usuarios) {
    try {
      await client.query(`
        INSERT INTO usuario (nome, email, senha, telefone, tipo_usuario, equipe_id) 
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [user.nome, user.email, user.senha, user.telefone, user.tipo_usuario, user.equipe_id]);
      sucessos++;
    } catch (err) {
      console.log(`   ❌ Erro ao inserir ${user.nome}: ${err.message}`);
    }
  }
  
  console.log(`   ✅ ${sucessos} usuários inseridos`);
}

async function migrarAgenda() {
  console.log('\n📅 Migrando agenda...');
  
  const agendas = [
    { titulo: 'Reunião de Planejamento', descricao: 'Planejamento mensal', data_evento: '2025-01-20 14:00:00', local_evento: 'Sala 1', tipo_circulo_id: 1 },
    { titulo: 'Workshop', descricao: 'Workshop de capacitação', data_evento: '2025-01-25 09:00:00', local_evento: 'Auditório', tipo_circulo_id: 2 }
  ];
  
  let sucessos = 0;
  for (const agenda of agendas) {
    try {
      await client.query(`
        INSERT INTO agenda (titulo, descricao, data_evento, local_evento, tipo_circulo_id) 
        VALUES ($1, $2, $3, $4, $5)
      `, [agenda.titulo, agenda.descricao, agenda.data_evento, agenda.local_evento, agenda.tipo_circulo_id]);
      sucessos++;
    } catch (err) {
      console.log(`   ❌ Erro ao inserir ${agenda.titulo}: ${err.message}`);
    }
  }
  
  console.log(`   ✅ ${sucessos} eventos inseridos`);
}

async function migrarChecklists() {
  console.log('\n📋 Migrando checklists...');
  
  const checklists = [
    { titulo: 'Preparação Pré-Encontro', descricao: 'Lista de verificação antes do encontro' },
    { titulo: 'Durante o Encontro', descricao: 'Verificações durante o evento' },
    { titulo: 'Pós-Encontro', descricao: 'Tarefas após o encontro' }
  ];
  
  let sucessos = 0;
  for (const checklist of checklists) {
    try {
      await client.query(`
        INSERT INTO checklist (titulo, descricao) 
        VALUES ($1, $2)
      `, [checklist.titulo, checklist.descricao]);
      sucessos++;
    } catch (err) {
      console.log(`   ❌ Erro ao inserir ${checklist.titulo}: ${err.message}`);
    }
  }
  
  console.log(`   ✅ ${sucessos} checklists inseridos`);
}

async function migrarNotificacoes() {
  console.log('\n🔔 Migrando notificações...');
  
  const notificacoes = [
    { titulo: 'Bem-vindo!', mensagem: 'Bem-vindo ao sistema EAC!', equipe_id: null },
    { titulo: 'Reunião Amanhã', mensagem: 'Lembrete: reunião amanhã às 14h', equipe_id: 1 }
  ];
  
  let sucessos = 0;
  for (const notif of notificacoes) {
    try {
      await client.query(`
        INSERT INTO notificacao (titulo, mensagem, equipe_id) 
        VALUES ($1, $2, $3)
      `, [notif.titulo, notif.mensagem, notif.equipe_id]);
      sucessos++;
    } catch (err) {
      console.log(`   ❌ Erro ao inserir ${notif.titulo}: ${err.message}`);
    }
  }
  
  console.log(`   ✅ ${sucessos} notificações inseridas`);
}

async function migrarReflexoes() {
  console.log('\n💭 Migrando reflexões...');
  
  const reflexoes = [
    { titulo: 'Primeira Reflexão', conteudo: 'Esta é uma reflexão de teste sobre o EAC', usuario_id: 1, equipe_id: 1 },
    { titulo: 'Aprendizados', conteudo: 'Reflexão sobre os aprendizados do encontro', usuario_id: 2, equipe_id: 1 }
  ];
  
  let sucessos = 0;
  for (const ref of reflexoes) {
    try {
      await client.query(`
        INSERT INTO reflexao (titulo, conteudo, usuario_id, equipe_id) 
        VALUES ($1, $2, $3, $4)
      `, [ref.titulo, ref.conteudo, ref.usuario_id, ref.equipe_id]);
      sucessos++;
    } catch (err) {
      console.log(`   ❌ Erro ao inserir ${ref.titulo}: ${err.message}`);
    }
  }
  
  console.log(`   ✅ ${sucessos} reflexões inseridas`);
}

async function criarDadosBase() {
  try {
    await client.connect();
    console.log('🔗 Conectado ao PostgreSQL Railway\n');
    
    await limparDados();
    await migrarUsuarios();
    await migrarChecklists();
    await migrarAgenda();
    await migrarNotificacoes();
    await migrarReflexoes();
    
    console.log('\n🎉 Dados base criados com sucesso!');
    
    // Verificar totais finais
    console.log('\n📊 Contagem final:');
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

criarDadosBase();
