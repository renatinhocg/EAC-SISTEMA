// Carregar variáveis de ambiente
require('dotenv').config({ path: './backend/.env.railway' });

const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import das rotas do backend
const usuariosRoutes = require('./backend/routes/usuarios');
const equipesRoutes = require('./backend/routes/equipes');
const agendaRoutes = require('./backend/routes/agendas');
const checklistRoutes = require('./backend/routes/checklists');
const notificacoesRoutes = require('./backend/routes/notificacoes');
const presencasRoutes = require('./backend/routes/presencas');
const reflexoesRoutes = require('./backend/routes/reflexoes');
const tipoCirculoRoutes = require('./backend/routes/tipo_circulo');
const usuariosFotoRoutes = require('./backend/routes/usuarios_foto');

// Servir arquivos estáticos do Frontend Admin em /admin
app.use('/admin', express.static(path.join(__dirname, 'frontend/dist')));

// Servir arquivos estáticos do PWA na raiz
app.use(express.static(path.join(__dirname, 'pwa/dist')));

// API Routes
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/equipes', equipesRoutes);
app.use('/api/agendas', agendaRoutes);
app.use('/api/checklists', checklistRoutes);
app.use('/api/notificacoes', notificacoesRoutes);
app.use('/api/presencas', presencasRoutes);
app.use('/api/reflexoes', reflexoesRoutes);
app.use('/api/tipo_circulo', tipoCirculoRoutes);
app.use('/api/usuarios_foto', usuariosFotoRoutes);

// Servir uploads
app.use('/uploads', express.static(path.join(__dirname, 'backend/uploads')));

// Rota de teste da API
app.get('/api', (req, res) => {
  res.send('API EAC rodando!');
});

// Rota de teste do banco de dados
app.get('/api/test-db', (req, res) => {
  const db = require('./backend/db');
  
  db.query('SELECT 1 as test', (err, results) => {
    if (err) {
      console.error('Erro no teste do banco:', err);
      return res.status(500).json({ 
        error: 'Erro de conexão com banco',
        details: err.message,
        code: err.code
      });
    }
    
    res.json({ 
      message: 'Conexão com banco funcionando!',
      test: results[0]
    });
  });
});

// Rota específica para o admin (SPA routing)
app.get('/admin/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
});

// Todas as outras rotas servem o PWA (SPA routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'pwa/dist/index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Servidor Full Stack rodando na porta ${PORT}`);
});
