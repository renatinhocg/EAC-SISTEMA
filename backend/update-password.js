const bcrypt = require('bcrypt');
const db = require('./db');

async function updatePassword() {
  try {
    const hashSenha = bcrypt.hashSync('123456', 10);
    console.log('Hash da senha 123456: ' + hashSenha);

    await new Promise((resolve, reject) => {
      db.query('UPDATE usuario SET senha = $1 WHERE id = 37', [hashSenha], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    console.log('✅ Senha atualizada para o usuário ID 37 (João Dias)');
    console.log('📧 Email: joao@email.com');
    console.log('🔐 Senha: 123456');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro:', err);
    process.exit(1);
  }
}

updatePassword();
