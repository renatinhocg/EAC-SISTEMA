// Corrige URLs duplicadas 'usuarios/usuarios/' no campo foto dos usuários
require('dotenv').config();
const db = require('./db');

const S3_BASE_URL = `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/usuarios/`;

async function corrigirFotosDuplicadas() {
  db.query("SELECT id, foto FROM usuario WHERE foto LIKE '%usuarios/usuarios/%'", [], (err, rows) => {
    if (err) {
      console.error('Erro ao buscar usuários:', err);
      process.exit(1);
    }
    if (!rows || rows.length === 0) {
      console.log('Nenhum usuário com foto duplicada para corrigir.');
      process.exit(0);
    }
    let atualizados = 0;
    rows.forEach(user => {
      const { id, foto } = user;
      // Remove o prefixo duplicado
      const novaFoto = foto.replace('usuarios/usuarios/', 'usuarios/');
      db.query('UPDATE usuario SET foto = $1 WHERE id = $2', [novaFoto, id], (err2) => {
        if (err2) {
          console.error(`Erro ao atualizar usuário ${id}:`, err2);
        } else {
          atualizados++;
          console.log(`Usuário ${id} atualizado: ${novaFoto}`);
        }
      });
    });
    setTimeout(() => {
      console.log(`Correção concluída. Total atualizados: ${atualizados}`);
      process.exit(0);
    }, 2000);
  });
}

corrigirFotosDuplicadas();
