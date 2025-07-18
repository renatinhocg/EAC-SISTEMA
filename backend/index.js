require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Client } = require('pg');
const path = require('path');

const app = express();

// Configuração CORS específica
app.use(cors({
  origin: [
    'https://eac-app-production.up.railway.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
// Servir uploads como estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Servir arquivos estáticos do frontend e PWA
app.use('/admin', express.static(path.join(__dirname, '../frontend/dist')));
app.use(express.static(path.join(__dirname, '../pwa/dist')));

// Rota de teste para verificar se está funcionando
app.get('/test', (req, res) => {
  const fs = require('fs');
  const frontendPath = path.join(__dirname, '../frontend/dist');
  const pwaPath = path.join(__dirname, '../pwa/dist');
  
  res.json({ 
    message: 'Servidor funcionando!', 
    timestamp: new Date().toISOString(),
    paths: {
      frontend: frontendPath,
      pwa: pwaPath,
      frontendExists: fs.existsSync(frontendPath),
      pwaExists: fs.existsSync(pwaPath),
      frontendFiles: fs.existsSync(frontendPath) ? fs.readdirSync(frontendPath) : 'Path not found',
      pwaFiles: fs.existsSync(pwaPath) ? fs.readdirSync(pwaPath) : 'Path not found'
    }
  });
});

// Conexão com o PostgreSQL
const db = new Client({
  host: process.env.PGHOST || process.env.DATABASE_HOST || 'localhost',
  user: process.env.PGUSER || process.env.DATABASE_USER || 'postgres',
  password: process.env.PGPASSWORD || process.env.DATABASE_PASSWORD || '',
  database: process.env.PGDATABASE || process.env.DATABASE_NAME || 'railway',
  port: process.env.PGPORT || process.env.DATABASE_PORT || 5432,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

db.connect()
  .then(() => {
    console.log('Conectado ao PostgreSQL (db.js)!');
  })
  .catch(err => {
    console.error('Erro ao conectar ao PostgreSQL:', err.message);
  });

// Importar rotas
const usuariosRouter = require('./routes/usuarios');
const equipesRouter = require('./routes/equipes');
const notificacoesRouter = require('./routes/notificacoes');
const agendasRouter = require('./routes/agendas');
const checklistsRouter = require('./routes/checklists');
const reflexoesRouter = require('./routes/reflexoes');
const presencasRouter = require('./routes/presencas');
const usuariosFotoRouter = require('./routes/usuarios_foto');
const tipoCirculoRouter = require('./routes/tipo_circulo');

// Configurar todas as rotas de API ANTES dos arquivos estáticos
app.use('/api/usuarios', usuariosFotoRouter);
app.use('/api/usuarios', usuariosRouter);
app.use('/api/equipes', equipesRouter);
app.use('/api/notificacoes', notificacoesRouter);
app.use('/api/agendas', (req, res, next) => {
  console.log(`[agendas] ${req.method} ${req.url} - body:`, req.body);
  next();
});
app.use('/api/agendas', agendasRouter);
app.use('/api/checklists', checklistsRouter);
app.use('/api/reflexoes', reflexoesRouter);
app.use('/api/presencas', presencasRouter);
app.use('/api/tipo_circulo', tipoCirculoRouter);

// Configurar SPA routing para o frontend admin
app.get('/admin/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// Configurar SPA routing para o PWA (catch-all) - DEVE SER A ÚLTIMA ROTA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../pwa/dist/index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor Full Stack rodando na porta ${PORT}`);
});
