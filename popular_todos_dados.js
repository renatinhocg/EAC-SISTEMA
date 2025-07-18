// Agora vamos popular com TODOS os dados reais do banco local
const mysql = require('mysql2/promise');
const fs = require('fs');

const dbConfig = {
  host: 'metro.proxy.rlwy.net',
  user: 'root', 
  password: 'LwAlpweJhhXQJRMWLaToWrxFzjtagAkC',
  database: 'railway',
  port: 52078,
  connectTimeout: 60000
};

async function popularTodosOsDados() {
  console.log('📦 Populando com TODOS os dados do banco local...');
  
  try {
    // Ler o arquivo de dados exportados
    const dadosSQL = fs.readFileSync('dados_completos_local.sql', 'utf8');
    const comandos = dadosSQL.split(';').filter(cmd => cmd.trim());
    
    console.log(`📝 ${comandos.length} comandos SQL para executar...`);
    
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado ao Railway!');
    
    let sucessos = 0;
    let erros = 0;
    
    for (let i = 0; i < comandos.length; i++) {
      const comando = comandos[i].trim();
      if (comando) {
        try {
          await connection.execute(comando);
          sucessos++;
          if (i % 50 === 0) {
            console.log(`📊 Progresso: ${i}/${comandos.length} (${Math.round(i/comandos.length*100)}%)`);
          }
        } catch (error) {
          erros++;
          if (error.message.includes('Duplicate entry')) {
            // Ignora duplicatas
          } else {
            console.log(`❌ Erro no comando ${i + 1}:`, error.message.substring(0, 100));
          }
        }
      }
    }
    
    // Verificar dados finais
    const [usuarios] = await connection.execute('SELECT COUNT(*) as total FROM usuario');
    const [equipes] = await connection.execute('SELECT COUNT(*) as total FROM equipe');
    const [presencas] = await connection.execute('SELECT COUNT(*) as total FROM presenca');
    
    console.log('\n🎉 POPULAÇÃO COMPLETA!');
    console.log(`✅ Comandos executados: ${sucessos}`);
    console.log(`❌ Erros: ${erros}`);
    console.log(`👥 Total usuários: ${usuarios[0].total}`);
    console.log(`🏢 Total equipes: ${equipes[0].total}`);  
    console.log(`📋 Total presenças: ${presencas[0].total}`);
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

popularTodosOsDados();
