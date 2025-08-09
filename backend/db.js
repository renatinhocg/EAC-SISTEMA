// Configurar dotenv apenas se não estiver no Railway
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const { Client } = require('pg');
const { URL } = require('url');

// Configuração do banco - Railway PostgreSQL em produção, local em desenvolvimento
let dbConfig;

// Usar DATABASE_PUBLIC_URL do novo banco ou vars individuais se PGHOST for o proxy externo
const connectionUrl = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;
const useExternalVars = process.env.PGHOST && process.env.PGHOST.includes('proxy.rlwy.net');

// Se estamos em produção no Railway, usar vars internas (mais eficiente)
if (process.env.NODE_ENV === 'production' && process.env.PGHOST && !useExternalVars) {
  // FORÇAR USO DO NOVO BANCO EM PRODUÇÃO - SEMPRE USE ESTE BANCO
  dbConfig = {
    host: 'shortline.proxy.rlwy.net',
    port: 10160,
    user: 'postgres',
    password: 'vjIkxfKggxIaeAfcTQWLeOnDuSZgRQhg',
    database: 'railway',
    ssl: false,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
    query_timeout: 30000
  };
} else if (useExternalVars) {
  // SEMPRE USAR O NOVO BANCO
  dbConfig = {
    host: 'shortline.proxy.rlwy.net',
    port: 10160,
    user: 'postgres',
    password: 'vjIkxfKggxIaeAfcTQWLeOnDuSZgRQhg',
    database: 'railway',
    ssl: false,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
    query_timeout: 30000
  };
} else {
  // Configuração local usando URL externa do PostgreSQL (novo banco)
  const newPostgresUrl = 'postgresql://postgres:vjIkxfKggxIaeAfcTQWLeOnDuSZgRQhg@shortline.proxy.rlwy.net:10160/railway';
  const dbUrl = new URL(newPostgresUrl);
  
  dbConfig = {
    host: dbUrl.hostname,
    port: parseInt(dbUrl.port),
    user: dbUrl.username,
    password: dbUrl.password,
    database: dbUrl.pathname.slice(1),
    ssl: false,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
    query_timeout: 30000
  };
}

console.log('🔌 Variáveis de ambiente PostgreSQL:', {
  PGHOST: process.env.PGHOST,
  PGPORT: process.env.PGPORT,
  PGUSER: process.env.PGUSER,
  PGDATABASE: process.env.PGDATABASE,
  PGPASSWORD: process.env.PGPASSWORD ? '***definida***' : 'NÃO DEFINIDA',
  DATABASE_URL: process.env.DATABASE_URL ? '***url_interna_definida***' : 'NÃO DEFINIDA',
  USANDO_NOVO_BANCO: 'SIM - PostgreSQL limpo'
});

console.log('🔌 Configuração do banco PostgreSQL:', {
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  database: dbConfig.database,
  ssl: dbConfig.ssl ? 'habilitado' : 'desabilitado'
});

let dbClient;

// efetua a conexão com retry
const connectWithRetry = async () => {
  const maxRetries = 3;
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      // Criar novo client a cada tentativa
      if (dbClient) {
        try {
          await dbClient.end();
        } catch (e) {
          // Ignorar erro de fechamento
        }
      }
      
      dbClient = new Client(dbConfig);
      await dbClient.connect();
      console.log('✅ Conectado ao PostgreSQL (db.js)!');
      return true;
    } catch (err) {
      retries++;
      console.error(`❌ Tentativa ${retries} falhou - Erro ao conectar ao PostgreSQL (db.js):`, err.message);
      
      if (retries < maxRetries) {
        console.log(`🔄 Tentando novamente em 2 segundos...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        console.error('🚫 Esgotaram-se as tentativas de conexão com DATABASE_URL');
        
        // Se falhar, tentar com configuração sem SSL
        if (dbConfig && dbConfig.host) {
          console.log('🔄 Tentando sem SSL como último recurso...');
          const noSslConfig = {
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password,
            database: dbConfig.database,
            port: dbConfig.port,
            ssl: false
          };
          
          try {
            if (dbClient) {
              try {
                await dbClient.end();
              } catch (e) {
                // Ignorar erro de fechamento
              }
            }
            
            dbClient = new Client(noSslConfig);
            await dbClient.connect();
            console.log('✅ Conectado ao PostgreSQL sem SSL!');
            return true;
          } catch (noSslErr) {
            console.error('❌ Falha também sem SSL:', noSslErr.message);
            
            // Como último recurso, tentar criar o client sem conexão inicial
            dbClient = new Client(dbConfig);
            console.log('⚠️ Client criado mas sem conexão estabelecida');
            return false;
          }
        }
      }
    }
  }
  return false;
};

connectWithRetry();

// Wrapper para manter compatibilidade com MySQL
const db = {
  query: async (sql, params, callback) => {
    // Se não tem callback, params é o callback
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }
    
    // Verificar se o client está conectado
    if (!dbClient || dbClient._ending || dbClient._ended) {
      console.log('🔄 Cliente desconectado, tentando reconectar...');
      const reconnected = await connectWithRetry();
      if (!reconnected) {
        return callback(new Error('Falha ao conectar ao banco de dados'), null);
      }
    }
    
    // Converter placeholders MySQL (?) para PostgreSQL ($1, $2, etc)
    let sqlPostgreSQL = sql;
    let paramIndex = 1;
    while (sqlPostgreSQL.includes('?')) {
      sqlPostgreSQL = sqlPostgreSQL.replace('?', `$${paramIndex}`);
      paramIndex++;
    }
    
    try {
      const result = await dbClient.query(sqlPostgreSQL, params);
      // Simular formato MySQL
      callback(null, result.rows);
    } catch (err) {
      console.error('❌ Erro na query:', err.message);
      
      // Se erro de conexão, tentar reconectar uma vez
      if (err.message.includes('connection') || err.message.includes('SSL') || err.code === 'ENOTFOUND') {
        console.log('🔄 Erro de conexão detectado, tentando reconectar...');
        const reconnected = await connectWithRetry();
        if (reconnected) {
          try {
            const retryResult = await dbClient.query(sqlPostgreSQL, params);
            callback(null, retryResult.rows);
            return;
          } catch (retryErr) {
            console.error('❌ Falha também na segunda tentativa:', retryErr.message);
          }
        }
      }
      
      callback(err, null);
    }
  }
};

module.exports = db;
