const mysql = require('mysql2');

// Configuração do banco - usa as mesmas variáveis do Railway
const dbConfig = {
  host: process.env.MYSQL_HOST || process.env.DB_HOST,
  user: process.env.MYSQL_USER || process.env.DB_USER,
  password: process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD,
  database: process.env.MYSQL_DATABASE || process.env.DB_NAME,
  port: process.env.MYSQL_PORT || process.env.DB_PORT || 3306
};

console.log('🔌 Configuração do banco para popular:', {
  host: dbConfig.host ? 'configurado' : 'NÃO CONFIGURADO',
  user: dbConfig.user ? 'configurado' : 'NÃO CONFIGURADO',
  database: dbConfig.database ? 'configurado' : 'NÃO CONFIGURADO',
  port: dbConfig.port
});

// Para rodar localmente, vamos usar as variáveis do Railway
if (!dbConfig.host) {
  console.log('❌ Variáveis do Railway não encontradas localmente.');
  console.log('💡 Execute este script diretamente no Railway ou configure as variáveis MYSQL_* localmente.');
  process.exit(1);
}

// Usando as variáveis do Railway
const db = mysql.createConnection(dbConfig);

// Dados iniciais para popular o banco
const dadosIniciais = {
  usuarios: [
    {
      nome: 'Administrador',
      email: 'admin@eac.com',
      senha: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      tipo: 'admin',
      ativo: 1
    },
    {
      nome: 'Usuário Teste',
      email: 'user@eac.com', 
      senha: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      tipo: 'usuario',
      ativo: 1
    }
  ],
  equipes: [
    {
      nome: 'Equipe Alpha',
      descricao: 'Primeira equipe de desenvolvimento',
      ativo: 1
    },
    {
      nome: 'Equipe Beta', 
      descricao: 'Segunda equipe de desenvolvimento',
      ativo: 1
    }
  ]
};

async function popularBanco() {
  console.log('🌱 Iniciando população do banco de dados...');
  
  try {
    // Conectar
    await new Promise((resolve, reject) => {
      db.connect((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    console.log('✅ Conectado ao banco de dados');
    
    // Popular usuários
    console.log('👥 Inserindo usuários...');
    for (const usuario of dadosIniciais.usuarios) {
      try {
        await new Promise((resolve, reject) => {
          db.query(
            'INSERT INTO usuarios (nome, email, senha, tipo, ativo) VALUES (?, ?, ?, ?, ?)',
            [usuario.nome, usuario.email, usuario.senha, usuario.tipo, usuario.ativo],
            (err, result) => {
              if (err) reject(err);
              else resolve(result);
            }
          );
        });
        console.log(`✅ Usuário ${usuario.nome} inserido`);
      } catch (error) {
        console.log(`❌ Erro ao inserir ${usuario.nome}:`, error.message);
      }
    }
    
    // Popular equipes
    console.log('👥 Inserindo equipes...');
    for (const equipe of dadosIniciais.equipes) {
      try {
        await new Promise((resolve, reject) => {
          db.query(
            'INSERT INTO equipes (nome, descricao, ativo) VALUES (?, ?, ?)',
            [equipe.nome, equipe.descricao, equipe.ativo],
            (err, result) => {
              if (err) reject(err);
              else resolve(result);
            }
          );
        });
        console.log(`✅ Equipe ${equipe.nome} inserida`);
      } catch (error) {
        console.log(`❌ Erro ao inserir ${equipe.nome}:`, error.message);
      }
    }
    
    console.log('\n🎉 População do banco concluída!');
    console.log('\n📋 Dados de teste criados:');
    console.log('👤 Login: admin@eac.com / password');
    console.log('👤 Login: user@eac.com / password');
    
  } catch (error) {
    console.error('❌ Erro na população:', error);
  } finally {
    db.end();
  }
}

popularBanco();
