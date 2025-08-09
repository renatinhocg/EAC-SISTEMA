const { Client } = require('pg');
const bcrypt = require('bcrypt');

const client = new Client({
  host: 'shortline.proxy.rlwy.net',
  port: 10160,
  user: 'postgres',
  password: 'vjIkxfKggxIaeAfcTQWLeOnDuSZgRQhg',
  database: 'railway',
  ssl: false
});

async function fixPassword() {
  try {
    await client.connect();
    console.log('✅ Conectado ao PostgreSQL');
    
    const hashedPassword = bcrypt.hashSync('1234', 8);
    console.log('🔐 Hash gerado:', hashedPassword);
    
    const result = await client.query(
      'UPDATE usuario SET senha = $1 WHERE email = $2',
      [hashedPassword, 'garcom@email.com']
    );
    
    console.log('✅ Senha atualizada para:', result.rowCount, 'usuário(s)');
    
    // Verificar a atualização
    const checkResult = await client.query(
      'SELECT email, senha FROM usuario WHERE email = $1',
      ['garcom@email.com']
    );
    
    console.log('📋 Verificação:', checkResult.rows[0]);
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await client.end();
  }
}

fixPassword();
