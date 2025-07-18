// Configurar dotenv apenas se não estiver no Railway
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const mysql = require('mysql2');

// Configuração do banco - Railway em produção, local em desenvolvimento
const dbConfig = {
  host: process.env.MYSQL_HOST || process.env.DATABASE_HOST || 'localhost',
  user: process.env.MYSQL_USER || process.env.DATABASE_USER || 'root',
  password: process.env.MYSQL_PASSWORD || process.env.DATABASE_PASSWORD || 'Bu@130978',
  database: process.env.MYSQL_DATABASE || process.env.DATABASE_NAME || 'novo',
  port: process.env.MYSQL_PORT || process.env.DATABASE_PORT || 3306
};

console.log('🔌 Configuração do banco:', {
  host: dbConfig.host,
  user: dbConfig.user,
  database: dbConfig.database,
  port: dbConfig.port,
  password: dbConfig.password ? '***definida***' : 'NÃO DEFINIDA'
});

const db = mysql.createConnection(dbConfig);

// efetua a conexão
db.connect((err) => {
  if (err) console.error('Erro ao conectar ao MySQL (db.js):', err);
  else console.log('Conectado ao MySQL (db.js)!');
});

module.exports = db;
