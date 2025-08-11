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

// LOGIN - ROTA ESSENCIAL
app.post('/api/usuarios/login', async (req, res) => {
  console.log('🔐 POST /api/usuarios/login');
  const { email, senha } = req.body;
  
  if (!email || !senha) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }
  
  try {
    db.query(
      `SELECT u.*, e.id as e_id, e.nome as equipe_nome 
       FROM usuario u 
       LEFT JOIN equipe e ON u.equipe_id = e.id 
       WHERE u.email = $1`,
      [email],
      async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        
        const usuarios = Array.isArray(results) ? results : results.rows || [];
        if (usuarios.length === 0) return res.status(401).json({ error: 'Usuário não encontrado' });
        
        const user = usuarios[0];
        
        // Verificar senha com bcrypt
        try {
          const isValidPassword = await bcrypt.compare(senha, user.senha);
          if (!isValidPassword) {
            return res.status(401).json({ error: 'Senha incorreta' });
          }
        } catch (error) {
          return res.status(500).json({ error: 'Erro ao verificar senha' });
        }
        
        const token = jwt.sign(
          { id: user.id, email: user.email, nome: user.nome, tipo_usuario: user.tipo_usuario },
          process.env.JWT_SECRET || 'secret-key',
          { expiresIn: '24h' }
        );
        
        console.log('✅ Login realizado:', user.nome, user.tipo_usuario);
        
        res.json({
          token,
          user: {
            id: user.id,
            nome: user.nome,
            email: user.email,
            tipo_usuario: user.tipo_usuario,
            foto: user.foto,
            equipe: user.equipe_nome ? {
              id: user.e_id,
              nome: user.equipe_nome
            } : null
          }
        });
      }
    );
  } catch (error) {
    console.error('❌ Erro interno no login:', error);
    res.status(500).json({ error: error.message });
  }
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

// Servir uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

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
