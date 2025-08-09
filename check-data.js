const { Pool } = require('pg');
const pool = new Pool({
  host: 'shortline.proxy.rlwy.net',
  port: 10160,
  database: 'railway',
  user: 'postgres',
  password: 'vjIkxfKggxIaeAfcTQWLeOnDuSZgRQhg',
  ssl: false
});

async function checkData() {
  try {
    console.log('=== VERIFICANDO DADOS EXISTENTES ===');
    
    // Verificar usuários
    const usuarios = await pool.query('SELECT id, email, nome, tipo_usuario FROM usuario');
    console.log('Usuários encontrados:', usuarios.rows.length);
    usuarios.rows.forEach(u => console.log(`- ${u.email} (${u.nome}) - Tipo: ${u.tipo_usuario}`));
    
    // Verificar equipes
    const equipes = await pool.query('SELECT id, nome FROM equipe');
    console.log('\nEquipes encontradas:', equipes.rows.length);
    equipes.rows.forEach(e => console.log(`- ${e.nome}`));
    
    // Verificar tipos de círculo
    const tipos = await pool.query('SELECT id, nome FROM tipo_circulo');
    console.log('\nTipos de círculo:', tipos.rows.length);
    tipos.rows.forEach(t => console.log(`- ${t.nome}`));
    
    await pool.end();
  } catch (error) {
    console.error('Erro:', error.message);
    await pool.end();
  }
}

checkData();
