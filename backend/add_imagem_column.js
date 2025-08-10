const db = require('./db');

// Script para adicionar coluna imagem à tabela equipe
const addImagenColumn = () => {
  const sql = 'ALTER TABLE equipe ADD COLUMN imagem VARCHAR(255) NULL';
  
  db.query(sql, (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('✅ Coluna imagem já existe na tabela equipe');
      } else {
        console.error('❌ Erro ao adicionar coluna:', err);
      }
    } else {
      console.log('✅ Coluna imagem adicionada com sucesso à tabela equipe');
    }
    process.exit(0);
  });
};

addImagenColumn();
