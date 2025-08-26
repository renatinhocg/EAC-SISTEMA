// Script para atualizar campo foto dos usuários para URL do S3
require('dotenv').config();
const db = require('./db');

const S3_BASE_URL = `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/usuarios/`;

async function migrarFotos() {
  try {
    // Buscar todos usuários que têm foto
  db.query("SELECT id, foto FROM usuario WHERE foto IS NOT NULL AND foto != ''", [], (err, rows) => {
      if (err) {
        console.error('Erro ao buscar usuários:', err);
        process.exit(1);
      }
      if (!rows || rows.length === 0) {
        console.log('Nenhum usuário com foto para migrar.');
        process.exit(0);
      }
      let atualizados = 0;
      rows.forEach(user => {
        // Se já está no S3, ignora
        if (user.foto.startsWith('http')) return;
        const novaUrl = S3_BASE_URL + user.foto;
        db.query('UPDATE usuario SET foto = $1 WHERE id = $2', [novaUrl, user.id], (err2) => {
          if (err2) {
            console.error(`Erro ao atualizar usuário ${user.id}:`, err2);
          } else {
            atualizados++;
            console.log(`Usuário ${user.id} atualizado: ${novaUrl}`);
          }
        });
      });
      setTimeout(() => {
        console.log(`Migração concluída. Total atualizados: ${atualizados}`);
        process.exit(0);
      }, 2000);
    });
  } catch (err) {
    console.error('Erro geral:', err);
    process.exit(1);
  }
}

migrarFotos();
