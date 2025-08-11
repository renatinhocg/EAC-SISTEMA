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

console.log('🔥 CONFIGURANDO ROTAS DA API...');

// Health check
app.get('/api/health', (req, res) => {
  console.log('💚 Health check called');
  res.json({ 
    message: 'API FUNCIONANDO!', 
    version: 'CLEAN-VERSION-2025-08-11',
    timestamp: new Date().toISOString()
  });
});

// Pagamentos usuarios
app.get('/api/pagamentos/usuarios', async (req, res) => {
  console.log('👥 GET /api/pagamentos/usuarios - NOVA VERSÃO');
  
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

// ===== ARQUIVOS ESTÁTICOS - ÚLTIMA PRIORIDADE =====
console.log('📁 CONFIGURANDO ARQUIVOS ESTÁTICOS...');

// Admin
app.use('/admin', express.static(path.join(__dirname, '../frontend/dist')));

// SPA Routing
app.get('/admin/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// PWA (catch-all) - ÚLTIMA ROTA
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, '../pwa/dist/index.html'));
});

const PORT = process.env.PORT || 3001;
console.log('🚀 INICIANDO SERVIDOR LIMPO NA PORTA', PORT);
app.listen(PORT, () => {
  console.log(`🌟 SERVIDOR LIMPO RODANDO NA PORTA ${PORT} - VERSION: CLEAN-2025-08-11`);
});
