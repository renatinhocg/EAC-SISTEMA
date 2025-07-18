// Configurar dotenv apenas se não estiver no Railway
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const { Client } = require('pg');

// Configuração do banco - Railway PostgreSQL em produção, local em desenvolvimento
const dbConfig = {
  host: process.env.PGHOST || process.env.DATABASE_HOST || 'localhost',
  user: process.env.PGUSER || process.env.DATABASE_USER || 'postgres',
  password: process.env.PGPASSWORD || process.env.DATABASE_PASSWORD || '',
  database: process.env.PGDATABASE || process.env.DATABASE_NAME || 'railway',
  port: process.env.PGPORT || process.env.DATABASE_PORT || 5432,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

console.log('🔌 Configuração do banco PostgreSQL:', {
  host: dbConfig.host,
  user: dbConfig.user,
  database: dbConfig.database,
  port: dbConfig.port,
  password: dbConfig.password ? '***definida***' : 'NÃO DEFINIDA',
  ssl: dbConfig.ssl ? 'habilitado' : 'desabilitado'
});

const dbClient = new Client(dbConfig);

// efetua a conexão
dbClient.connect()
  .then(() => {
    console.log('Conectado ao PostgreSQL (db.js)!');
  })
  .catch(err => {
    console.error('Erro ao conectar ao PostgreSQL (db.js):', err.message);
  });

// Wrapper para manter compatibilidade com MySQL
const db = {
  query: (sql, params, callback) => {
    // Se não tem callback, params é o callback
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }
    
    // Converter placeholders MySQL (?) para PostgreSQL ($1, $2, etc)
    let sqlPostgreSQL = sql;
    let paramIndex = 1;
    while (sqlPostgreSQL.includes('?')) {
      sqlPostgreSQL = sqlPostgreSQL.replace('?', `$${paramIndex}`);
      paramIndex++;
    }
    
    dbClient.query(sqlPostgreSQL, params)
      .then(result => {
        // Simular formato MySQL
        callback(null, result.rows);
      })
      .catch(err => {
        callback(err, null);
      });
  }
};

module.exports = db;
