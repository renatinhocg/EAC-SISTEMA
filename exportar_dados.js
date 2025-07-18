const mysql = require('mysql2');
const fs = require('fs');

async function exportarDados() {
  console.log('🔄 Exportando dados do banco local...');
  
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
    
    console.log('✅ Conectado ao banco LOCAL');
    
    // Exportar checklist_equipes
    const dados = await new Promise((resolve, reject) => {
      localDb.query(`SELECT * FROM checklist_equipes`, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
    
    console.log(`📊 Encontrados ${dados.length} registros em checklist_equipes`);
    
    // Salvar em arquivo JSON
    fs.writeFileSync('dados_exportados.json', JSON.stringify(dados, null, 2));
    console.log('💾 Dados salvos em dados_exportados.json');
    
    // Gerar SQL de INSERT
    let sqlInserts = '';
    dados.forEach(registro => {
      const colunas = Object.keys(registro);
      const valores = Object.values(registro).map(v => 
        typeof v === 'string' ? `'${v.replace(/'/g, "''")}'` : v
      );
      sqlInserts += `INSERT INTO checklist_equipes (${colunas.join(', ')}) VALUES (${valores.join(', ')});\n`;
    });
    
    fs.writeFileSync('insert_dados.sql', sqlInserts);
    console.log('📜 SQL de INSERT salvo em insert_dados.sql');
    
    localDb.end();
    console.log('\n🎉 Exportação completa!');
    console.log('\n📋 Próximos passos:');
    console.log('1. Use o MySQL Workbench para conectar ao banco Hostinger');
    console.log('2. Execute o arquivo insert_dados.sql');
    console.log('   OU');
    console.log('3. Copie e cole o conteúdo do arquivo na query do Workbench');
    
  } catch (error) {
    console.error('❌ Erro na exportação:', error);
  }
}

exportarDados();
