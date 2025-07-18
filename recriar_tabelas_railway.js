const mysql = require('mysql2');

// Script para recriar tabelas Railway com estrutura correta do banco local
async function recriarTabelasRailway() {
  console.log('🔨 Recriando tabelas Railway com estrutura correta...');
  
  const config = {
    host: 'switchback.proxy.rlwy.net',
    user: 'root',
    password: 'horRLfvpDAJfdVmPdSYiNQiTiaitkKpz',
    database: 'railway',
    port: 59624
  };
  
  const db = mysql.createConnection(config);
  
  try {
    await new Promise((resolve, reject) => {
      db.connect((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    console.log('✅ Conectado ao Railway');
    
    // Primeiro, deletar todas as tabelas existentes (ordem inversa devido às chaves estrangeiras)
    const tabelasParaDeletar = [
      'presenca',
      'reflexao', 
      'notificacao_lidos',
      'checklist_equipes',
      'notificacao',
      'agenda',
      'checklist',
      'usuario',
      'equipe',
      'tipo_circulo'
    ];
    
    console.log('🗑️ Deletando tabelas antigas...');
    for (const tabela of tabelasParaDeletar) {
      try {
        await new Promise((resolve, reject) => {
          db.query(`DROP TABLE IF EXISTS ${tabela}`, (err, result) => {
            if (err) reject(err);
            else resolve(result);
          });
        });
        console.log(`✅ Tabela '${tabela}' deletada`);
      } catch (error) {
        console.log(`⚠️ Erro ao deletar '${tabela}':`, error.message);
      }
    }
    
    // Agora criar tabelas com estrutura correta
    const criarTabelas = [
      // tipo_circulo
      `CREATE TABLE tipo_circulo (
        id int NOT NULL AUTO_INCREMENT,
        nome varchar(100) NOT NULL UNIQUE,
        PRIMARY KEY (id)
      )`,
      
      // usuario  
      `CREATE TABLE usuario (
        id int NOT NULL AUTO_INCREMENT,
        nome varchar(100) NOT NULL,
        telefone varchar(20) NULL,
        email varchar(100) NOT NULL UNIQUE,
        instagram varchar(100) NULL,
        tipo_usuario enum('admin','coordenador','integrante') NOT NULL DEFAULT 'integrante',
        tipo_circulo_id int NULL,
        eac_que_fez varchar(100) NULL,
        foto varchar(255) NULL,
        senha varchar(255) NOT NULL,
        equipe_id int NULL,
        PRIMARY KEY (id),
        KEY fk_usuario_tipo_circulo (tipo_circulo_id),
        KEY fk_usuario_equipe (equipe_id),
        CONSTRAINT fk_usuario_tipo_circulo FOREIGN KEY (tipo_circulo_id) REFERENCES tipo_circulo (id)
      )`,
      
      // equipe
      `CREATE TABLE equipe (
        id int NOT NULL AUTO_INCREMENT,
        nome varchar(100) NOT NULL,
        descricao text NULL,
        sobre text NULL,
        funcao varchar(100) NULL,
        PRIMARY KEY (id)
      )`,
      
      // checklist
      `CREATE TABLE checklist (
        id int NOT NULL AUTO_INCREMENT,
        titulo varchar(100) NOT NULL,
        descricao text NULL,
        tipo enum('pré-encontro','durante o encontro','pós-encontro') NOT NULL DEFAULT 'pré-encontro',
        PRIMARY KEY (id)
      )`,
      
      // checklist_equipes
      `CREATE TABLE checklist_equipes (
        id int NOT NULL AUTO_INCREMENT,
        checklist_id int NOT NULL,
        equipe_id int NOT NULL,
        PRIMARY KEY (id),
        KEY fk_checklist_equipes_checklist (checklist_id),
        KEY fk_checklist_equipes_equipe (equipe_id),
        CONSTRAINT fk_checklist_equipes_checklist FOREIGN KEY (checklist_id) REFERENCES checklist (id) ON DELETE CASCADE,
        CONSTRAINT fk_checklist_equipes_equipe FOREIGN KEY (equipe_id) REFERENCES equipe (id) ON DELETE CASCADE
      )`,
      
      // notificacao
      `CREATE TABLE notificacao (
        id int NOT NULL AUTO_INCREMENT,
        titulo varchar(100) NOT NULL,
        descricao text NULL,
        para_todos tinyint(1) NULL DEFAULT 0,
        equipe_id int NULL,
        PRIMARY KEY (id),
        KEY fk_notificacao_equipe (equipe_id),
        CONSTRAINT fk_notificacao_equipe FOREIGN KEY (equipe_id) REFERENCES equipe (id)
      )`,
      
      // notificacao_lidos
      `CREATE TABLE notificacao_lidos (
        id int NOT NULL AUTO_INCREMENT,
        notificacao_id int NOT NULL,
        usuario_id int NOT NULL,
        data_lida datetime NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY fk_notificacao_lidos_notificacao (notificacao_id),
        KEY fk_notificacao_lidos_usuario (usuario_id),
        CONSTRAINT fk_notificacao_lidos_notificacao FOREIGN KEY (notificacao_id) REFERENCES notificacao (id) ON DELETE CASCADE,
        CONSTRAINT fk_notificacao_lidos_usuario FOREIGN KEY (usuario_id) REFERENCES usuario (id) ON DELETE CASCADE
      )`,
      
      // agenda
      `CREATE TABLE agenda (
        id int NOT NULL AUTO_INCREMENT,
        titulo varchar(100) NOT NULL,
        descricao text NULL,
        data date NULL,
        hora_inicio time NULL,
        hora_fim time NULL,
        local varchar(100) NULL,
        presenca_ativa tinyint(1) NOT NULL DEFAULT 0,
        PRIMARY KEY (id)
      )`,
      
      // reflexao
      `CREATE TABLE reflexao (
        id int NOT NULL AUTO_INCREMENT,
        texto text NOT NULL,
        usuario_id int NOT NULL,
        agenda_id int NULL,
        equipe_id int NULL,
        anexo varchar(255) NULL,
        data datetime NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY fk_reflexao_usuario (usuario_id),
        KEY fk_reflexao_agenda (agenda_id),
        KEY fk_reflexao_equipe (equipe_id),
        CONSTRAINT fk_reflexao_usuario FOREIGN KEY (usuario_id) REFERENCES usuario (id),
        CONSTRAINT fk_reflexao_agenda FOREIGN KEY (agenda_id) REFERENCES agenda (id),
        CONSTRAINT fk_reflexao_equipe FOREIGN KEY (equipe_id) REFERENCES equipe (id)
      )`,
      
      // presenca
      `CREATE TABLE presenca (
        id int NOT NULL AUTO_INCREMENT,
        equipe_id int NOT NULL,
        usuario_id int NOT NULL,
        data date NULL,
        presente tinyint(1) NULL DEFAULT 0,
        PRIMARY KEY (id),
        KEY fk_presenca_equipe (equipe_id),
        KEY fk_presenca_usuario (usuario_id),
        CONSTRAINT fk_presenca_equipe FOREIGN KEY (equipe_id) REFERENCES equipe (id) ON DELETE CASCADE,
        CONSTRAINT fk_presenca_usuario FOREIGN KEY (usuario_id) REFERENCES usuario (id) ON DELETE CASCADE
      )`
    ];
    
    console.log('🔨 Criando tabelas com estrutura correta...');
    
    // Criar tabelas
    for (let i = 0; i < criarTabelas.length; i++) {
      const sql = criarTabelas[i];
      const nomeTabela = sql.match(/CREATE TABLE (\w+)/)[1];
      
      try {
        await new Promise((resolve, reject) => {
          db.query(sql, (err, result) => {
            if (err) reject(err);
            else resolve(result);
          });
        });
        console.log(`✅ Tabela '${nomeTabela}' criada com estrutura correta`);
      } catch (error) {
        console.log(`❌ Erro ao criar '${nomeTabela}':`, error.message);
      }
    }
    
    // Verificar tabelas criadas
    const tabelas = await new Promise((resolve, reject) => {
      db.query('SHOW TABLES', (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
    
    console.log(`\n🎉 Total de tabelas criadas: ${tabelas.length}`);
    tabelas.forEach(tabela => {
      console.log(`  📋 ${Object.values(tabela)[0]}`);
    });
    
    console.log('\n✅ Tabelas recriadas com estrutura correta! Agora pode popular os dados.');
    
  } catch (error) {
    console.error('❌ Erro na recriação das tabelas:', error);
  } finally {
    db.end();
  }
}

recriarTabelasRailway();
