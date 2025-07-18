const mysql = require('mysql2/promise');
const fs = require('fs');

const config = {
  host: 'switchback.proxy.rlwy.net',
  port: 59624,
  user: 'root',
  password: 'horRLfvpDAJfdVmPdSYiNQiTiaitkKpz',
  database: 'railway'
};

async function popularSemForeignKeys() {
  let connection;
  
  try {
    console.log('🚀 Populando Railway desabilitando foreign keys temporariamente...');
    
    connection = await mysql.createConnection(config);
    console.log('✅ Conectado ao Railway MySQL');

    // Desabilitar foreign key checks
    await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
    console.log('🔓 Foreign key checks desabilitadas');

    // Limpar todas as tabelas
    const tabelas = ['reflexao', 'presenca', 'notificacao_lidos', 'notificacao', 'checklist_equipes', 'checklist', 'agenda', 'usuario', 'equipe', 'tipo_circulo'];
    
    console.log('🧹 Limpando todas as tabelas...');
    for (const tabela of tabelas) {
      try {
        await connection.execute(`DELETE FROM ${tabela}`);
        await connection.execute(`ALTER TABLE ${tabela} AUTO_INCREMENT = 1`);
        console.log(`🧹 ${tabela} limpa`);
      } catch (error) {
        if (!error.message.includes("doesn't exist")) {
          console.log(`⚠️ Erro ao limpar ${tabela}: ${error.message}`);
        }
      }
    }

    // Ler todos os INSERTs
    console.log('📖 Lendo dados exportados...');
    const dadosCompletos = fs.readFileSync('dados_completos_local.sql', 'utf8');
    const linhas = dadosCompletos.split('\n').filter(linha => linha.trim().startsWith('INSERT'));

    console.log(`📊 Total de comandos INSERT: ${linhas.length}`);

    let sucessos = 0;
    let erros = 0;

    // Executar todos os INSERTs
    for (let i = 0; i < linhas.length; i++) {
      try {
        await connection.execute(linhas[i]);
        sucessos++;
        
        if ((i + 1) % 50 === 0) {
          console.log(`📈 Processados: ${i + 1}/${linhas.length}`);
        }
      } catch (error) {
        erros++;
        if (erros <= 10) { // Mostrar apenas os primeiros 10 erros
          console.log(`⚠️ Erro no comando ${i + 1}: ${error.message.substring(0, 100)}...`);
        }
      }
    }

    // Reabilitar foreign key checks
    await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
    console.log('🔒 Foreign key checks reabilitadas');

    console.log('\n🎉 Importação concluída!');
    console.log(`✅ Sucessos: ${sucessos}`);
    console.log(`❌ Erros: ${erros}`);

    // Verificar resultados
    console.log('\n📊 Verificando dados inseridos:');
    const tabelasVerificar = ['tipo_circulo', 'equipe', 'usuario', 'agenda', 'checklist', 'checklist_equipes', 'notificacao', 'presenca', 'reflexao'];
    
    for (const tabela of tabelasVerificar) {
      try {
        const [rows] = await connection.execute(`SELECT COUNT(*) as total FROM ${tabela}`);
        console.log(`📋 ${tabela}: ${rows[0].total} registros`);
      } catch (error) {
        if (!error.message.includes("doesn't exist")) {
          console.log(`❌ Erro ao contar ${tabela}: ${error.message}`);
        }
      }
    }

  } catch (error) {
    console.error('❌ Erro durante importação:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

popularSemForeignKeys();
