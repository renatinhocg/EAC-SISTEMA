const mysql = require('mysql2');
const fs = require('fs');

// Script para popular o banco Railway com todos os dados do backup
async function popularRailwayCompleto() {
  console.log('🚀 Populando Railway com dados completos...');
  
  // Ler o arquivo de backup
  const arquivoBackup = 'dados_completos_local.sql';
  
  if (!fs.existsSync(arquivoBackup)) {
    console.error('❌ Arquivo de backup não encontrado:', arquivoBackup);
    console.log('💡 Execute primeiro: node exportar_tudo_local.js');
    return;
  }
  
  const sqlCompleto = fs.readFileSync(arquivoBackup, 'utf8');
  const comandos = sqlCompleto.split('\n').filter(linha => linha.trim().startsWith('INSERT'));
  
  console.log(`📊 Total de comandos INSERT: ${comandos.length}`);
  
  // Configuração do Railway com credenciais específicas
  const railwayDb = mysql.createConnection({
    host: 'switchback.proxy.rlwy.net',
    user: 'root',
    password: 'horRLfvpDAJfdVmPdSYiNQiTiaitkKpz',
    database: 'railway',
    port: 59624
  });

  try {
    // Conectar
    await new Promise((resolve, reject) => {
      railwayDb.connect((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    console.log('✅ Conectado ao Railway MySQL');
    
    // Primeiro, criar todas as tabelas
    console.log('🔨 Criando tabelas...');
    
    const criarTabelas = [
      `CREATE TABLE IF NOT EXISTS tipo_circulo (
        id int NOT NULL AUTO_INCREMENT,
        nome varchar(100) NOT NULL,
        PRIMARY KEY (id)
      )`,
      
      `CREATE TABLE IF NOT EXISTS usuario (
        id int NOT NULL AUTO_INCREMENT,
        nome varchar(100) NOT NULL,
        email varchar(100) NOT NULL UNIQUE,
        senha varchar(255) NOT NULL,
        foto varchar(255) DEFAULT NULL,
        tipo_circulo_id int DEFAULT NULL,
        created_at timestamp DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY fk_usuario_tipo_circulo (tipo_circulo_id),
        CONSTRAINT fk_usuario_tipo_circulo FOREIGN KEY (tipo_circulo_id) REFERENCES tipo_circulo (id)
      )`,
      
      `CREATE TABLE IF NOT EXISTS equipe (
        id int NOT NULL AUTO_INCREMENT,
        nome varchar(100) NOT NULL,
        descricao text,
        tipo_circulo_id int DEFAULT NULL,
        created_at timestamp DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY fk_equipe_tipo_circulo (tipo_circulo_id),
        CONSTRAINT fk_equipe_tipo_circulo FOREIGN KEY (tipo_circulo_id) REFERENCES tipo_circulo (id)
      )`,
      
      `CREATE TABLE IF NOT EXISTS checklist (
        id int NOT NULL AUTO_INCREMENT,
        titulo varchar(200) NOT NULL,
        descricao text,
        tipo_circulo_id int DEFAULT NULL,
        created_at timestamp DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY fk_checklist_tipo_circulo (tipo_circulo_id),
        CONSTRAINT fk_checklist_tipo_circulo FOREIGN KEY (tipo_circulo_id) REFERENCES tipo_circulo (id)
      )`,
      
      `CREATE TABLE IF NOT EXISTS checklist_equipes (
        id int NOT NULL AUTO_INCREMENT,
        checklist_id int NOT NULL,
        equipe_id int NOT NULL,
        concluido tinyint(1) DEFAULT '0',
        data_conclusao timestamp NULL DEFAULT NULL,
        observacoes text,
        created_at timestamp DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY fk_checklist_equipes_checklist (checklist_id),
        KEY fk_checklist_equipes_equipe (equipe_id),
        CONSTRAINT fk_checklist_equipes_checklist FOREIGN KEY (checklist_id) REFERENCES checklist (id) ON DELETE CASCADE,
        CONSTRAINT fk_checklist_equipes_equipe FOREIGN KEY (equipe_id) REFERENCES equipe (id) ON DELETE CASCADE
      )`,
      
      `CREATE TABLE IF NOT EXISTS notificacao (
        id int NOT NULL AUTO_INCREMENT,
        titulo varchar(200) NOT NULL,
        mensagem text NOT NULL,
        tipo_circulo_id int DEFAULT NULL,
        created_at timestamp DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY fk_notificacao_tipo_circulo (tipo_circulo_id),
        CONSTRAINT fk_notificacao_tipo_circulo FOREIGN KEY (tipo_circulo_id) REFERENCES tipo_circulo (id)
      )`,
      
      `CREATE TABLE IF NOT EXISTS notificacao_lidos (
        id int NOT NULL AUTO_INCREMENT,
        notificacao_id int NOT NULL,
        usuario_id int NOT NULL,
        lida_em timestamp DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY fk_notificacao_lidos_notificacao (notificacao_id),
        KEY fk_notificacao_lidos_usuario (usuario_id),
        CONSTRAINT fk_notificacao_lidos_notificacao FOREIGN KEY (notificacao_id) REFERENCES notificacao (id) ON DELETE CASCADE,
        CONSTRAINT fk_notificacao_lidos_usuario FOREIGN KEY (usuario_id) REFERENCES usuario (id) ON DELETE CASCADE
      )`,
      
      `CREATE TABLE IF NOT EXISTS agenda (
        id int NOT NULL AUTO_INCREMENT,
        titulo varchar(200) NOT NULL,
        descricao text,
        data_evento datetime NOT NULL,
        local varchar(200) DEFAULT NULL,
        tipo_circulo_id int DEFAULT NULL,
        created_at timestamp DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY fk_agenda_tipo_circulo (tipo_circulo_id),
        CONSTRAINT fk_agenda_tipo_circulo FOREIGN KEY (tipo_circulo_id) REFERENCES tipo_circulo (id)
      )`,
      
      `CREATE TABLE IF NOT EXISTS reflexao (
        id int NOT NULL AUTO_INCREMENT,
        titulo varchar(200) NOT NULL,
        conteudo text,
        arquivo varchar(255) DEFAULT NULL,
        equipe_id int DEFAULT NULL,
        usuario_id int DEFAULT NULL,
        created_at timestamp DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY fk_reflexao_equipe (equipe_id),
        KEY fk_reflexao_usuario (usuario_id),
        CONSTRAINT fk_reflexao_equipe FOREIGN KEY (equipe_id) REFERENCES equipe (id),
        CONSTRAINT fk_reflexao_usuario FOREIGN KEY (usuario_id) REFERENCES usuario (id)
      )`,
      
      `CREATE TABLE IF NOT EXISTS presenca (
        id int NOT NULL AUTO_INCREMENT,
        agenda_id int NOT NULL,
        equipe_id int NOT NULL,
        presente tinyint(1) DEFAULT '0',
        observacoes text,
        created_at timestamp DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY fk_presenca_agenda (agenda_id),
        KEY fk_presenca_equipe (equipe_id),
        CONSTRAINT fk_presenca_agenda FOREIGN KEY (agenda_id) REFERENCES agenda (id) ON DELETE CASCADE,
        CONSTRAINT fk_presenca_equipe FOREIGN KEY (equipe_id) REFERENCES equipe (id) ON DELETE CASCADE
      )`
    ];
    
    // Criar tabelas
    for (let i = 0; i < criarTabelas.length; i++) {
      const sql = criarTabelas[i];
      const nomeTabela = sql.match(/CREATE TABLE.*?`?(\w+)`?/)[1];
      
      try {
        await new Promise((resolve, reject) => {
          railwayDb.query(sql, (err, result) => {
            if (err) reject(err);
            else resolve(result);
          });
        });
        console.log(`✅ Tabela '${nomeTabela}' criada`);
      } catch (error) {
        console.log(`❌ Erro ao criar '${nomeTabela}':`, error.message);
      }
    }
    
    console.log('🔨 Tabelas criadas! Agora populando...');
    
    // Executar comandos em lotes
    let sucesso = 0;
    let erro = 0;
    
    for (let i = 0; i < comandos.length; i++) {
      const comando = comandos[i].trim();
      if (!comando) continue;
      
      try {
        await new Promise((resolve, reject) => {
          railwayDb.query(comando, (err, result) => {
            if (err) reject(err);
            else resolve(result);
          });
        });
        sucesso++;
        
        if (sucesso % 50 === 0) {
          console.log(`📈 Processados: ${sucesso}/${comandos.length}`);
        }
      } catch (err) {
        erro++;
        console.log(`⚠️ Erro no comando ${i + 1}: ${err.message}`);
      }
    }
    
    console.log('\n🎉 Importação concluída!');
    console.log(`✅ Sucessos: ${sucesso}`);
    console.log(`❌ Erros: ${erro}`);
    
  } catch (error) {
    console.error('❌ Erro na importação:', error);
  } finally {
    railwayDb.end();
  }
}

popularRailwayCompleto();
