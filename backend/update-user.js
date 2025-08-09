const db = require('./db');

// Atualizar foto do usuário Brunas
const updateUserPhoto = () => {
  db.query(
    'UPDATE usuario SET foto = $1, nome = $2 WHERE id = $3 RETURNING *',
    ['1754680068068.png', 'Brunas', 35],
    (err, result) => {
      if (err) {
        console.error('❌ Erro ao atualizar usuário:', err);
        process.exit(1);
      }
      console.log('✅ Usuário atualizado:', result[0]);
      process.exit(0);
    }
  );
};

updateUserPhoto();
