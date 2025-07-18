const mysql = require('mysql2');

// Script para verificar a estrutura das tabelas do banco local
async function verificarEstruturaLocal() {
  console.log('🔍 Verificando estrutura do banco local...');
  
  const localDb = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Bu@130978',
    database: 'novo'
  });

  try {
    await new Promise((resolve, reject) => {
      localDb.connect((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    console.log('✅ Conectado ao banco local');
    
    const tabelas = [
      'tipo_circulo',
      'usuario', 
      'equipe',
      'checklist',
      'checklist_equipes',
      'notificacao',
      'notificacao_lidos',
      'agenda',
      'reflexao',
      'presenca'
    ];
    
    for (const tabela of tabelas) {
      console.log(`\n📋 Estrutura da tabela: ${tabela}`);
      
      try {
        const estrutura = await new Promise((resolve, reject) => {
          localDb.query(`DESCRIBE ${tabela}`, (err, results) => {
            if (err) reject(err);
            else resolve(results);
          });
        });
        
        estrutura.forEach(coluna => {
          console.log(`  - ${coluna.Field}: ${coluna.Type} ${coluna.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${coluna.Key ? `(${coluna.Key})` : ''} ${coluna.Default !== null ? `DEFAULT ${coluna.Default}` : ''}`);
        });
        
      } catch (error) {
        console.log(`❌ Erro ao verificar ${tabela}:`, error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    localDb.end();
  }
}

verificarEstruturaLocal();
