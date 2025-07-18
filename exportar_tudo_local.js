const mysql = require('mysql2');
const fs = require('fs');

// Conecta ao banco LOCAL para exportar TODOS os dados
// ALTERE AQUI AS CREDENCIAIS DO SEU BANCO LOCAL:
const localDb = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Bu@130978', // ⚠️ COLOQUE SUA SENHA DO MYSQL LOCAL
  database: 'novo'
});

async function exportarTodosBancoLocal() {
  console.log('📦 Exportando TODOS os dados do banco local...');
  
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

  let sqlCompleto = '';
  
  try {
    await new Promise((resolve, reject) => {
      localDb.connect((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    console.log('✅ Conectado ao banco local');

    for (const tabela of tabelas) {
      console.log(`📋 Exportando tabela: ${tabela}`);
      
      try {
        const dados = await new Promise((resolve, reject) => {
          localDb.query(`SELECT * FROM ${tabela}`, (err, results) => {
            if (err) reject(err);
            else resolve(results);
          });
        });

        if (dados.length > 0) {
          console.log(`   ✅ ${dados.length} registros encontrados`);
          
          // Gerar INSERTs
          for (const registro of dados) {
            const campos = Object.keys(registro);
            const valores = campos.map(campo => {
              const valor = registro[campo];
              if (valor === null) return 'NULL';
              if (typeof valor === 'string') return `'${valor.replace(/'/g, "\\'")}'`;
              if (valor instanceof Date) return `'${valor.toISOString().slice(0, 19).replace('T', ' ')}'`;
              return valor;
            });
            
            sqlCompleto += `INSERT INTO ${tabela} (${campos.join(', ')}) VALUES (${valores.join(', ')});\n`;
          }
          sqlCompleto += '\n';
        } else {
          console.log(`   ⚠️ Tabela ${tabela} vazia`);
        }
      } catch (error) {
        console.log(`   ❌ Erro ao exportar ${tabela}:`, error.message);
      }
    }

    // Salvar arquivo
    const nomeArquivo = 'dados_completos_local.sql';
    fs.writeFileSync(nomeArquivo, sqlCompleto);
    console.log(`\n💾 Dados exportados para: ${nomeArquivo}`);
    console.log(`📊 Tamanho do arquivo: ${Math.round(fs.statSync(nomeArquivo).size / 1024)} KB`);

    // Mostrar resumo
    const linhas = sqlCompleto.split('\n').filter(l => l.trim().startsWith('INSERT')).length;
    console.log(`📈 Total de INSERTs gerados: ${linhas}`);

  } catch (error) {
    console.error('❌ Erro na exportação:', error);
  } finally {
    localDb.end();
  }
}

exportarTodosBancoLocal();
