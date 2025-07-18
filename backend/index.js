require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
// Servir uploads como estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Conexão com o MySQL
const db = mysql.createConnection({
  host: process.env.MYSQL_HOST || process.env.DATABASE_HOST || 'localhost',
  user: process.env.MYSQL_USER || process.env.DATABASE_USER || 'root',
  password: process.env.MYSQL_PASSWORD || process.env.DATABASE_PASSWORD || 'Bu@130978',
  database: process.env.MYSQL_DATABASE || process.env.DATABASE_NAME || 'novo',
  port: process.env.MYSQL_PORT || process.env.DATABASE_PORT || 3306
});

db.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao MySQL:', err);
  } else {
    console.log('Conectado ao MySQL!');
  }
});

app.get('/', (req, res) => {
  res.send('API rodando!');
});

const usuariosRouter = require('./routes/usuarios');
const equipesRouter = require('./routes/equipes');
const notificacoesRouter = require('./routes/notificacoes');
const agendasRouter = require('./routes/agendas');
const checklistsRouter = require('./routes/checklists');
const reflexoesRouter = require('./routes/reflexoes');
const presencasRouter = require('./routes/presencas');
const usuariosFotoRouter = require('./routes/usuarios_foto');
const tipoCirculoRouter = require('./routes/tipo_circulo');

// Rota de upload de foto de usuário (antes das rotas principais)
app.use('/usuarios', usuariosFotoRouter);
// Rotas principais de usuários
app.use('/usuarios', usuariosRouter);
app.use('/equipes', equipesRouter);
app.use('/notificacoes', notificacoesRouter);
// Log de requisições para /agendas
app.use('/agendas', (req, res, next) => {
  console.log(`[agendas] ${req.method} ${req.url} - body:`, req.body);
  next();
});
app.use('/agendas', agendasRouter);
app.use('/checklists', checklistsRouter);
app.use('/reflexoes', reflexoesRouter);
app.use('/presencas', presencasRouter);
app.use('/tipo_circulo', tipoCirculoRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor backend rodando na porta ${PORT}`);
});
