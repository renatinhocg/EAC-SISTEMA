const mysql = require('mysql2/promise');

const configLocal = {
  host: 'localhost',
  user: 'Bu',
  password: '130978',
  database: 'novo'
};

const configRailway = {
  host: 'switchback.proxy.rlwy.net',
  port: 59624,
  user: 'root',
  password: 'horRLfvpDAJfdVmPdSYiNQiTiaitkKpz',
  database: 'railway'
};

async function compararEquipes() {
  let connectionLocal, connectionRailway;
  
  try {
    console.log('🔍 Comparando equipes Local vs Railway...');
    
    connectionLocal = await mysql.createConnection(configLocal);
    connectionRailway = await mysql.createConnection(configRailway);
    
    // Equipes no local
    const [equipesLocal] = await connectionLocal.execute('SELECT id, nome FROM equipe ORDER BY id');
    console.log('\n📋 Equipes no Local:');
    equipesLocal.forEach(equipe => {
      console.log(`  ${equipe.id}: ${equipe.nome}`);
    });
    
    // Equipes no Railway
    const [equipesRailway] = await connectionRailway.execute('SELECT id, nome FROM equipe ORDER BY id');
    console.log('\n📋 Equipes no Railway:');
    equipesRailway.forEach(equipe => {
      console.log(`  ${equipe.id}: ${equipe.nome}`);
    });
    
    // IDs de equipes no arquivo de dados
    const fs = require('fs');
    const dadosCompletos = fs.readFileSync('dados_completos_local.sql', 'utf8');
    const equipesUsadas = new Set();
    
    // Buscar por equipe_id nos INSERTs
    const regexEquipeId = /equipe_id['"]*\s*(?:,\s*|\(\s*)['"]*(\d+)['"]*\)/g;
    let match;
    while ((match = regexEquipeId.exec(dadosCompletos)) !== null) {
      equipesUsadas.add(parseInt(match[1]));
    }
    
    console.log('\n📋 IDs de equipes usados nos dados:');
    console.log([...equipesUsadas].sort((a, b) => a - b));
    
    console.log('\n🔍 IDs de equipes que estão nos dados mas não no Railway:');
    const idsRailway = new Set(equipesRailway.map(e => e.id));
    const idsFaltando = [...equipesUsadas].filter(id => !idsRailway.has(id));
    console.log(idsFaltando);
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    if (connectionLocal) await connectionLocal.end();
    if (connectionRailway) await connectionRailway.end();
  }
}

compararEquipes();
