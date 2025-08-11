require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// CORS ANTES DE TUDO
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// ===== ROTAS DA API - PRIMEIRA PRIORIDADE =====
const db = require('./db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Importar routers das outras APIs
const usuariosRouter = require('./routes/usuarios');
const equipesRouter = require('./routes/equipes');
const notificacoesRouter = require('./routes/notificacoes');
const agendasRouter = require('./routes/agendas');
const checklistsRouter = require('./routes/checklists');
const reflexoesRouter = require('./routes/reflexoes');
const presencasRouter = require('./routes/presencas');
const usuariosFotoRouter = require('./routes/usuarios_foto');
const tipoCirculoRouter = require('./routes/tipo_circulo');

console.log('🔥 CONFIGURANDO TODAS AS ROTAS DA API...');

// Configurar todas as rotas das outras seções
app.use('/api/usuarios', usuariosRouter);
app.use('/api/usuarios', usuariosFotoRouter);
app.use('/api/equipes', equipesRouter);
app.use('/api/notificacoes', notificacoesRouter);
app.use('/api/agendas', agendasRouter);
app.use('/api/checklists', checklistsRouter);
app.use('/api/reflexoes', reflexoesRouter);
app.use('/api/presencas', presencasRouter);
app.use('/api/tipo_circulo', tipoCirculoRouter);

// Health check
app.get('/api/health', (req, res) => {
  console.log('💚 Health check called');
  res.json({ 
    message: 'API FUNCIONANDO!', 
    version: 'COMPLETE-VERSION-2025-08-11',
    timestamp: new Date().toISOString()
  });
});

// Pagamentos usuarios
app.get('/api/pagamentos/usuarios', async (req, res) => {
  console.log('� GET /api/pagamentos/usuarios');
  
  try {
    const query = `
      SELECT 
        u.id as usuario_id,
        u.nome,
        u.email,
        u.telefone,
        u.foto,
        u.tipo_usuario,
        p.id,
        p.comprovante,
        p.valor,
        p.status,
        p.data_envio,
        p.data_aprovacao,
        p.observacoes,
        p.created_at,
        p.updated_at,
        u.equipe_id,
        e.nome as equipe_nome
      FROM usuario u
      LEFT JOIN pagamento p ON u.id = p.usuario_id
      LEFT JOIN equipe e ON u.equipe_id = e.id
      ORDER BY u.nome ASC
    `;
    
    db.query(query, (err, result) => {
      if (err) {
        console.error('❌ Erro ao buscar usuários:', err);
        return res.status(500).json({ error: err.message });
      }
      
      const usuarios = Array.isArray(result) ? result : result.rows || [];
      
      const usuariosProcessados = usuarios.map(usuario => ({
        ...usuario,
        status_pagamento: usuario.status || 'sem_pagamento',
        equipe_nome: usuario.equipe_nome || 'Não informado'
      }));
      
      console.log(`✅ Encontrados ${usuarios.length} usuários`);
      res.json(usuariosProcessados);
    });
  } catch (error) {
    console.error('❌ Erro interno:', error);
    res.status(500).json({ error: error.message });
  }
});

// Estatísticas de pagamentos
app.get('/api/pagamentos/estatisticas', async (req, res) => {
  console.log('� GET /api/pagamentos/estatisticas');
  
  try {
    const query = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'aprovado' THEN 1 END) as aprovados,
        COUNT(CASE WHEN status = 'pendente' THEN 1 END) as pendentes,
        COUNT(CASE WHEN status = 'aguardando_aprovacao' THEN 1 END) as aguardando_aprovacao,
        COUNT(CASE WHEN status = 'rejeitado' THEN 1 END) as rejeitados
      FROM pagamento
    `;
    
    db.query(query, (err, result) => {
      if (err) {
        console.error('❌ Erro ao buscar estatísticas:', err);
        return res.status(500).json({ error: err.message });
      }
      
      const stats = Array.isArray(result) ? result[0] : result.rows?.[0] || {};
      const total = parseInt(stats.total || 0);
      const aprovados = parseInt(stats.aprovados || 0);
      const percentual_pagos = total > 0 ? ((aprovados / total) * 100).toFixed(2) : '0.00';
      
      const estatisticas = {
        total: stats.total || '0',
        aprovados: stats.aprovados || '0',
        pendentes: stats.pendentes || '0',
        aguardando_aprovacao: stats.aguardando_aprovacao || '0',
        rejeitados: stats.rejeitados || '0',
        percentual_pagos
      };
      
      console.log('✅ Estatísticas:', estatisticas);
      res.json(estatisticas);
    });
  } catch (error) {
    console.error('❌ Erro interno:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== ARQUIVOS ESTÁTICOS - ÚLTIMA PRIORIDADE =====
console.log('📁 CONFIGURANDO ARQUIVOS ESTÁTICOS...');

// Servir uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

// Admin
app.use('/admin', express.static(path.join(__dirname, '../frontend/dist')));

// PWA Assets - ANTES do catch-all
app.use('/assets', express.static(path.join(__dirname, '../pwa/dist/assets')));
app.use('/favicon.svg', express.static(path.join(__dirname, '../pwa/dist/favicon.svg')));
app.use('/manifest.json', express.static(path.join(__dirname, '../pwa/dist/manifest.json')));
app.use('/icon-192.svg', express.static(path.join(__dirname, '../pwa/dist/icon-192.svg')));
app.use('/icon-512.svg', express.static(path.join(__dirname, '../pwa/dist/icon-512.svg')));
app.use('/logo-eac.svg', express.static(path.join(__dirname, '../pwa/dist/logo-eac.svg')));
app.use('/logo-splash.png', express.static(path.join(__dirname, '../pwa/dist/logo-splash.png')));

// SPA Routing
app.get('/admin/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// PWA - Rotas específicas ao invés de catch-all
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../pwa/dist/index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../pwa/dist/index.html'));
});

app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, '../pwa/dist/index.html'));
});

app.get('/pagamento-taxa', (req, res) => {
  res.sendFile(path.join(__dirname, '../pwa/dist/index.html'));
});

// Catch-all final só para rotas não encontradas
app.get('*', (req, res) => {
  // Se a rota começa com /api, retorna 404
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // Para outras rotas PWA, serve o index.html
  res.sendFile(path.join(__dirname, '../pwa/dist/index.html'));
});

const PORT = process.env.PORT || 3001;
console.log('🚀 INICIANDO SERVIDOR LIMPO NA PORTA', PORT);
app.listen(PORT, () => {
  console.log(`🌟 SERVIDOR LIMPO RODANDO NA PORTA ${PORT} - VERSION: CLEAN-2025-08-11`);
});
