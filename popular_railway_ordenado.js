const mysql = require('mysql2/promise');

const config = {
  host: 'switchback.proxy.rlwy.net',
  port: 59624,
  user: 'root',
  password: 'horRLfvpDAJfdVmPdSYiNQiTiaitkKpz',
  database: 'railway'
};

// Ordem correta para inserção (tabelas pai primeiro)
const tabelasOrdem = [
  'tipo_circulo',
  'equipe', 
  'usuario',
  'agenda',
  'checklist',
  'checklist_equipes',
  'notificacao',
  'notificacao_lida',
  'presenca',
  'reflexao'
];

const dadosTabelas = {
  tipo_circulo: [
    { id: 1, nome: 'EAC' }
  ],
  equipe: [
    { id: 1, nome: 'Garçom', sobre: 'Serve os adolescentes e tios' },
    { id: 2, nome: 'Ordem e Montagem', sobre: 'A Equipe Ordem e Montagem é formada por dois casais coordenadores: um adulto e um adolescente e por um grupo de apoio, de acordo com a necessidade.' },
    { id: 3, nome: 'Banda', sobre: '' },
    { id: 4, nome: 'Sala', sobre: '' },
    { id: 5, nome: 'Mini-bar', sobre: '' },
    { id: 6, nome: 'Vigília', sobre: '' },
    { id: 7, nome: 'Meditação', sobre: '' },
    { id: 8, nome: 'Doutrina', sobre: '' },
    { id: 9, nome: 'Cozinha', sobre: '' },
    { id: 10, nome: 'Secretaria', sobre: '' },
    { id: 11, nome: 'Evangelização Infantil', sobre: '' },
    { id: 12, nome: 'Portaria', sobre: '' },
    { id: 13, nome: 'Visitação', sobre: '' }
  ]
};

async function popularRailway() {
  let connection;
  
  try {
    console.log('🚀 Populando Railway com dados ordenados...');
    
    connection = await mysql.createConnection(config);
    console.log('✅ Conectado ao Railway MySQL');

    // Limpar todas as tabelas primeiro (em ordem reversa)
    console.log('🧹 Limpando dados existentes...');
    const tabelasReversas = [...tabelasOrdem].reverse();
    
    for (const tabela of tabelasReversas) {
      try {
        await connection.execute(`DELETE FROM ${tabela}`);
        await connection.execute(`ALTER TABLE ${tabela} AUTO_INCREMENT = 1`);
        console.log(`🧹 Tabela ${tabela} limpa`);
      } catch (error) {
        console.log(`⚠️ Erro ao limpar ${tabela}: ${error.message}`);
      }
    }

    // Inserir dados da tabela tipo_circulo primeiro
    console.log('📊 Inserindo tipo_circulo...');
    for (const registro of dadosTabelas.tipo_circulo) {
      const sql = `INSERT INTO tipo_circulo (id, nome) VALUES (?, ?)`;
      await connection.execute(sql, [registro.id, registro.nome]);
    }
    console.log('✅ tipo_circulo inserido');

    // Inserir dados da tabela equipe
    console.log('📊 Inserindo equipes...');
    for (const registro of dadosTabelas.equipe) {
      const sql = `INSERT INTO equipe (id, nome, sobre) VALUES (?, ?, ?)`;
      await connection.execute(sql, [registro.id, registro.nome, registro.sobre]);
    }
    console.log('✅ equipes inseridas');

    // Agora ler os dados exportados do local e inserir na ordem correta
    const fs = require('fs');
    const dadosCompletos = fs.readFileSync('dados_completos_local.sql', 'utf8');
    const linhas = dadosCompletos.split('\n').filter(linha => linha.trim().startsWith('INSERT'));

    console.log(`📊 Total de comandos INSERT encontrados: ${linhas.length}`);

    // Separar INSERTs por tabela
    const insertsPorTabela = {};
    
    for (const linha of linhas) {
      for (const tabela of tabelasOrdem) {
        if (linha.includes(`INSERT INTO ${tabela}`)) {
          if (!insertsPorTabela[tabela]) {
            insertsPorTabela[tabela] = [];
          }
          insertsPorTabela[tabela].push(linha);
          break;
        }
      }
    }

    let totalSucessos = 2; // tipo_circulo + equipe que já inserimos
    let totalErros = 0;

    // Executar inserções na ordem correta
    for (const tabela of tabelasOrdem) {
      if (tabela === 'tipo_circulo' || tabela === 'equipe') {
        continue; // Já inserimos acima
      }

      if (insertsPorTabela[tabela]) {
        console.log(`📊 Inserindo ${insertsPorTabela[tabela].length} registros em ${tabela}...`);
        
        for (const comando of insertsPorTabela[tabela]) {
          try {
            await connection.execute(comando);
            totalSucessos++;
          } catch (error) {
            console.log(`⚠️ Erro em ${tabela}: ${error.message.substring(0, 100)}...`);
            totalErros++;
          }
        }
        console.log(`✅ ${tabela} processada`);
      }
    }

    console.log('\n🎉 Importação concluída!');
    console.log(`✅ Sucessos: ${totalSucessos}`);
    console.log(`❌ Erros: ${totalErros}`);

    // Verificar resultados
    console.log('\n📊 Verificando dados inseridos:');
    for (const tabela of tabelasOrdem) {
      try {
        const [rows] = await connection.execute(`SELECT COUNT(*) as total FROM ${tabela}`);
        console.log(`📋 ${tabela}: ${rows[0].total} registros`);
      } catch (error) {
        console.log(`❌ Erro ao contar ${tabela}: ${error.message}`);
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

popularRailway();
