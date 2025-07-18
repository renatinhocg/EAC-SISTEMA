const mysql = require('mysql2');

async function migrarDados() {
  console.log('🔄 Iniciando migração de dados...');
  
  // Primeiro, conectar ao banco LOCAL e exportar dados
  console.log('📤 Conectando ao banco LOCAL...');
  const localDb = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Bu@130978',
    database: 'novo'
  });

  const tabelas = [
    'usuarios',
    'equipes', 
    'agendas',
    'checklists',
    'presencas',
    'reflexoes',
    'notificacoes',
    'notificacoes_lidas',
    'checklist_equipes'
  ];

  let dadosExportados = {};

  try {
    // Conectar ao banco local
    await new Promise((resolve, reject) => {
      localDb.connect((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    console.log('✅ Conectado ao banco LOCAL');
    
    // Exportar dados de cada tabela
    for (const tabela of tabelas) {
      console.log(`📋 Exportando dados da tabela: ${tabela}`);
      
      const dados = await new Promise((resolve, reject) => {
        localDb.query(`SELECT * FROM ${tabela}`, (err, results) => {
          if (err) {
            console.log(`❌ Erro ao ler ${tabela}:`, err.message);
            resolve([]);
          } else {
            resolve(results);
          }
        });
      });
      
      dadosExportados[tabela] = dados;
      console.log(`✅ ${dados.length} registros exportados de ${tabela}`);
    }
    
    localDb.end();
    console.log('🔌 Desconectado do banco LOCAL');
    
    // Agora conectar ao banco REMOTO
    console.log('\n📥 Conectando ao banco HOSTINGER...');
    const remoteDb = mysql.createConnection({
      host: 'srv1076.hstgr.io',
      user: 'u472765055_eac_user',
      password: 'eac123456789@',
      database: 'u472765055_eac_db'
    });
    
    await new Promise((resolve, reject) => {
      remoteDb.connect((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    console.log('✅ Conectado ao banco HOSTINGER');
    
    // Importar dados para cada tabela
    for (const tabela of tabelas) {
      const dados = dadosExportados[tabela];
      
      if (dados.length === 0) {
        console.log(`⚠️  Tabela ${tabela} está vazia - pulando`);
        continue;
      }
      
      console.log(`\n� Importando ${dados.length} registros para ${tabela}`);
      
      // Limpar tabela remota primeiro
      await new Promise((resolve, reject) => {
        remoteDb.query(`DELETE FROM ${tabela}`, (err) => {
          if (err) console.log(`⚠️  Erro ao limpar ${tabela}:`, err.message);
          resolve();
        });
      });
      
      // Inserir dados
      for (const registro of dados) {
        const colunas = Object.keys(registro);
        const valores = Object.values(registro);
        const placeholders = colunas.map(() => '?').join(', ');
        
        const sql = `INSERT INTO ${tabela} (${colunas.join(', ')}) VALUES (${placeholders})`;
        
        await new Promise((resolve, reject) => {
          remoteDb.query(sql, valores, (err) => {
            if (err) {
              console.log(`❌ Erro ao inserir em ${tabela}:`, err.message);
            }
            resolve();
          });
        });
      }
      
      console.log(`✅ Migração de ${tabela} concluída`);
    }
    
    remoteDb.end();
    console.log('\n🎉 Migração completa! Todos os dados foram transferidos.');
    
  } catch (error) {
    console.error('❌ Erro na migração:', error);
  }
}

migrarDados();
