const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  host: 'shortline.proxy.rlwy.net',
  port: 10160,
  database: 'railway',
  user: 'postgres',
  password: 'vjIkxfKggxIaeAfcTQWLeOnDuSZgRQhg',
  ssl: false
});

async function populateData() {
  try {
    console.log('=== POPULANDO DADOS CORRETAMENTE ===');
    
    // Hash da senha admin123
    const hashedPassword = await bcrypt.hash('admin123', 10);
    console.log('Senha hasheada gerada:', hashedPassword);
    
    // Atualizar senha do admin
    await pool.query(`
      UPDATE usuario 
      SET senha = $1 
      WHERE email = 'admin@eacpnssa.com.br'
    `, [hashedPassword]);
    
    console.log('✓ Senha do admin atualizada');
    
    // Adicionar mais usuários de exemplo
    const usuarios = [
      {
        nome: 'João Silva',
        email: 'joao@eacpnssa.com.br',
        senha: await bcrypt.hash('123456', 10),
        tipo_usuario: 'coordenador',
        tipo_circulo_id: 1
      },
      {
        nome: 'Maria Santos',
        email: 'maria@eacpnssa.com.br',
        senha: await bcrypt.hash('123456', 10),
        tipo_usuario: 'integrante',
        tipo_circulo_id: 2
      },
      {
        nome: 'Pedro Costa',
        email: 'pedro@eacpnssa.com.br',
        senha: await bcrypt.hash('123456', 10),
        tipo_usuario: 'integrante',
        tipo_circulo_id: 3
      }
    ];
    
    for (const usuario of usuarios) {
      // Verificar se já existe
      const existing = await pool.query('SELECT id FROM usuario WHERE email = $1', [usuario.email]);
      
      if (existing.rows.length === 0) {
        await pool.query(`
          INSERT INTO usuario (nome, email, senha, tipo_usuario, tipo_circulo_id)
          VALUES ($1, $2, $3, $4, $5)
        `, [usuario.nome, usuario.email, usuario.senha, usuario.tipo_usuario, usuario.tipo_circulo_id]);
        
        console.log(`✓ Usuário ${usuario.nome} adicionado`);
      } else {
        console.log(`- Usuário ${usuario.nome} já existe`);
      }
    }
    
    // Adicionar algumas agendas de exemplo
    const agendas = [
      {
        titulo: 'EAC de Janeiro',
        descricao: 'Primeiro EAC do ano',
        data: '2025-01-25',
        hora_inicio: '08:00:00',
        hora_fim: '18:00:00',
        local: 'Centro de Convenções'
      },
      {
        titulo: 'Palestra Motivacional',
        descricao: 'Palestra sobre liderança',
        data: '2025-02-15',
        hora_inicio: '19:00:00',
        hora_fim: '21:00:00',
        local: 'Auditório Principal'
      }
    ];
    
    for (const agenda of agendas) {
      const existing = await pool.query('SELECT id FROM agenda WHERE titulo = $1', [agenda.titulo]);
      
      if (existing.rows.length === 0) {
        await pool.query(`
          INSERT INTO agenda (titulo, descricao, data, hora_inicio, hora_fim, local)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [agenda.titulo, agenda.descricao, agenda.data, agenda.hora_inicio, agenda.hora_fim, agenda.local]);
        
        console.log(`✓ Agenda "${agenda.titulo}" adicionada`);
      } else {
        console.log(`- Agenda "${agenda.titulo}" já existe`);
      }
    }
    
    // Verificar dados finais
    const finalUsers = await pool.query('SELECT id, email, nome, tipo_usuario FROM usuario');
    const finalAgendas = await pool.query('SELECT id, titulo, data FROM agenda');
    
    console.log('\n=== DADOS FINAIS ===');
    console.log(`Usuários: ${finalUsers.rows.length}`);
    finalUsers.rows.forEach(u => console.log(`- ${u.email} (${u.nome})`));
    
    console.log(`\nAgendas: ${finalAgendas.rows.length}`);
    finalAgendas.rows.forEach(a => console.log(`- ${a.titulo} (${a.data})`));
    
    await pool.end();
    console.log('\n✓ População de dados concluída!');
    
  } catch (error) {
    console.error('Erro:', error.message);
    await pool.end();
  }
}

populateData();
