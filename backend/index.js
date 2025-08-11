require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

// Middleware de autenticação
const authenticateToken = require('./middleware/authenticateToken');

const app = express();

// Configurar multer para upload de fotos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Salva tanto na pasta local quanto na pasta public da PWA
    const uploadDir = path.join(__dirname, 'uploads/usuarios/');
    const pwaDir = path.join(__dirname, '../pwa/public/uploads/usuarios/');
    
    // Cria as pastas se não existirem
    const fs = require('fs');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    if (!fs.existsSync(pwaDir)) {
      fs.mkdirSync(pwaDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    cb(null, timestamp + extension);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos de imagem são permitidos!'));
    }
  }
});

// Configuração CORS específica
app.use(cors({
  origin: [
    'https://eac-app-production.up.railway.app',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Log de todas as requisições para debug
app.use((req, res, next) => {
  console.log(`🌐 ${new Date().toISOString()} - ${req.method} ${req.url}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('   Body:', req.body);
  }
  next();
});

// Importar rotas (conexão com DB é feita pelo db.js) - PRIMEIRO IMPORTAR
const usuariosRouter = require('./routes/usuarios');
const equipesRouter = require('./routes/equipes');
const notificacoesRouter = require('./routes/notificacoes');
const agendasRouter = require('./routes/agendas');
const checklistsRouter = require('./routes/checklists');
const reflexoesRouter = require('./routes/reflexoes');
const presencasRouter = require('./routes/presencas');
const usuariosFotoRouter = require('./routes/usuarios_foto');
const tipoCirculoRouter = require('./routes/tipo_circulo');

// ==================== ROTAS DE PAGAMENTOS ====================
const db = require('./db');



// ROTAS DE API - AGORA PODEMOS USAR OS ROUTERS IMPORTADOS
app.use('/api/usuarios', usuariosRouter);
app.use('/api/usuarios', usuariosFotoRouter);
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

// GET /api/pagamentos/usuarios - Listar usuários com status de pagamento (incluindo equipe)
app.get('/api/pagamentos/usuarios', async (req, res) => {
  console.log('👥 GET /api/pagamentos/usuarios - Listando usuários com status de pagamento');
  
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
      
      // Processa os dados para garantir que status_pagamento seja mapeado corretamente
      const usuariosProcessados = usuarios.map(usuario => ({
        ...usuario,
        status_pagamento: usuario.status || 'sem_pagamento',
        equipe_nome: usuario.equipe_nome || 'Não informado'
      }));
      
      console.log(`✅ Encontrados ${usuarios.length} usuários`);
      console.log('🔍 [DEBUG] Primeiro usuário RAW:', usuarios[0]);
      console.log('🔍 [DEBUG] Primeiro usuário PROCESSADO:', usuariosProcessados[0]);
      console.log('🔍 [DEBUG] Campos disponíveis:', usuarios[0] ? Object.keys(usuarios[0]) : 'Nenhum usuário');
      
      res.json(usuariosProcessados);
    });
  } catch (error) {
    console.error('❌ Erro interno:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/pagamentos/estatisticas - Estatísticas dos pagamentos
app.get('/api/pagamentos/estatisticas', async (req, res) => {
  console.log('📊 GET /api/pagamentos/estatisticas - Buscando estatísticas');
  
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

// GET /api/pagamentos/usuario/:id - Buscar pagamento de um usuário específico
app.get('/api/pagamentos/usuario/:id', async (req, res) => {
  const { id } = req.params;
  console.log(`👤 GET /api/pagamentos/usuario/${id} - Buscando pagamento do usuário`);
  
  try {
    const query = `
      SELECT 
        p.id,
        p.usuario_id,
        p.valor,
        p.status,
        p.comprovante,
        p.data_envio,
        p.data_aprovacao,
        p.observacoes,
        p.created_at,
        p.updated_at
      FROM pagamento p
      WHERE p.usuario_id = $1
    `;
    
    db.query(query, [id], (err, result) => {
      if (err) {
        console.error('❌ Erro ao buscar pagamento do usuário:', err);
        return res.status(500).json({ error: err.message });
      }
      
      const pagamento = Array.isArray(result) ? result[0] : result.rows?.[0];
      
      if (!pagamento) {
        console.log(`⚠️ Pagamento não encontrado para usuário ${id}`);
        return res.status(404).json({ error: 'Pagamento não encontrado para este usuário' });
      }
      
      console.log(`✅ Pagamento encontrado para usuário ${id}:`, pagamento.status);
      res.json(pagamento);
    });
  } catch (error) {
    console.error('❌ Erro interno:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/pagamentos - Enviar comprovante de pagamento
app.post('/api/pagamentos', authenticateToken, (req, res) => {
  console.log('📤 POST /api/pagamentos - Enviando comprovante');
  
  // Configure multer for payment receipts
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(__dirname, 'uploads', 'comprovantes');
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const timestamp = Date.now();
      const ext = path.extname(file.originalname);
      cb(null, `comprovante-${timestamp}${ext}`);
    }
  });

  const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Tipo de arquivo não permitido. Use apenas JPG, PNG ou PDF.'));
      }
    }
  }).single('comprovante');

  upload(req, res, (err) => {
    if (err) {
      console.error('❌ Erro no upload:', err);
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const userId = req.user.id;
    const comprovanteUrl = `uploads/comprovantes/${req.file.filename}`;

    console.log(`📤 Usuário ${userId} enviando comprovante: ${comprovanteUrl}`);

    // Update payment with receipt
    const query = `
      UPDATE pagamento 
      SET comprovante = $1, status = 'aguardando_aprovacao', data_envio = NOW(), updated_at = NOW()
      WHERE usuario_id = $2
    `;

    db.query(query, [comprovanteUrl, userId], (dbErr, result) => {
      if (dbErr) {
        console.error('❌ Erro ao salvar comprovante:', dbErr);
        return res.status(500).json({ error: 'Erro ao salvar comprovante' });
      }

      console.log('✅ Comprovante salvo com sucesso');
      res.json({ 
        message: 'Comprovante enviado com sucesso! Aguarde a aprovação.',
        comprovante: comprovanteUrl
      });
    });
  });
});

// PUT /api/pagamentos/usuario/:id/aprovar - Aprovar pagamento
app.put('/api/pagamentos/usuario/:id/aprovar', async (req, res) => {
  const { id } = req.params;
  console.log(`✅ PUT /api/pagamentos/usuario/${id}/aprovar - Aprovando pagamento`);
  
  try {
    const query = `
      UPDATE pagamento 
      SET status = 'aprovado', data_aprovacao = NOW(), updated_at = NOW()
      WHERE usuario_id = $1
    `;
    
    console.log(`🔍 Executando query: ${query} com ID: ${id}`);
    
    db.query(query, [id], (err, result) => {
      if (err) {
        console.error('❌ Erro ao aprovar pagamento:', err);
        return res.status(500).json({ error: err.message });
      }
      
      console.log('🔍 Resultado da query:', result);
      console.log(`🔍 Linhas afetadas: ${result.rowCount || result.length}`);
      
      // Para PostgreSQL, verificar se rowCount existe ou se o array está vazio
      const rowsAffected = result.rowCount !== undefined ? result.rowCount : result.length;
      
      if (rowsAffected === 0) {
        console.log('⚠️ Nenhuma linha foi atualizada - verifique se o usuario_id existe');
        return res.status(404).json({ error: 'Pagamento não encontrado para este usuário' });
      }
      
      console.log('✅ Pagamento aprovado com sucesso');
      res.json({ message: 'Pagamento aprovado com sucesso' });
    });
  } catch (error) {
    console.error('❌ Erro interno:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/pagamentos/usuario/:id/rejeitar - Rejeitar pagamento
app.put('/api/pagamentos/usuario/:id/rejeitar', async (req, res) => {
  const { id } = req.params;
  const { observacoes } = req.body;
  console.log(`❌ PUT /api/pagamentos/usuario/${id}/rejeitar - Rejeitando pagamento`);
  
  try {
    const query = `
      UPDATE pagamento 
      SET status = 'rejeitado', observacoes = $2, updated_at = NOW()
      WHERE usuario_id = $1
    `;
    
    console.log(`🔍 Executando query: ${query} com ID: ${id}`);
    
    db.query(query, [id, observacoes || ''], (err, result) => {
      if (err) {
        console.error('❌ Erro ao rejeitar pagamento:', err);
        return res.status(500).json({ error: err.message });
      }
      
      console.log('🔍 Resultado da query:', result);
      console.log(`🔍 Linhas afetadas: ${result.rowCount || result.length}`);
      
      // Para PostgreSQL, verificar se rowCount existe ou se o array está vazio
      const rowsAffected = result.rowCount !== undefined ? result.rowCount : result.length;
      
      if (rowsAffected === 0) {
        console.log('⚠️ Nenhuma linha foi atualizada - verifique se o usuario_id existe');
        return res.status(404).json({ error: 'Pagamento não encontrado para este usuário' });
      }
      
      console.log('✅ Pagamento rejeitado');
      res.json({ message: 'Pagamento rejeitado' });
    });
  } catch (error) {
    console.error('❌ Erro interno:', error);
    res.status(500).json({ error: error.message });
  }
});

// Servir uploads como estáticos dentro do prefixo /api
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

// Servir uploads também diretamente (para compatibilidade com frontend)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

// Endpoint específico para testar upload de foto
app.post('/test-upload', upload.single('foto'), (req, res) => {
  console.log('🧪 TEST UPLOAD - Body:', req.body);
  console.log('🧪 TEST UPLOAD - File:', req.file);
  res.json({
    message: 'Upload test successful',
    body: req.body,
    file: req.file ? {
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size
    } : null
  });
});

// Configurar todas as rotas de API ANTES dos arquivos estáticos
// Tornar upload disponível globalmente
app.locals.upload = upload;

// NOVA ROTA: Criar usuário com foto em um único passo
app.post('/api/usuarios-com-foto', upload.single('foto'), (req, res) => {
  console.log('📝🎯 POST /api/usuarios-com-foto - Dados:', req.body);
  console.log('📷🎯 Arquivo de foto:', req.file);
  
  const { nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, senha } = req.body;
  
  // Processar foto
  let fotoPath = null;
  if (req.file) {
    fotoPath = req.file.filename;
    console.log('📷🎯 Foto salva:', fotoPath);
  }
  
  // Mapear tipo_usuario
  const tipoUsuarioMap = {
    'Admin': 'admin',
    'admin': 'admin', 
    'Coordenador': 'coordenador',
    'coordenador': 'coordenador',
    'Integrante': 'integrante',
    'integrante': 'integrante'
  };
  
  const tipoUsuarioCorreto = tipoUsuarioMap[tipo_usuario] || 'integrante';
  const bcrypt = require('bcrypt');
  const hashedSenha = senha ? bcrypt.hashSync(senha, 8) : bcrypt.hashSync('123456', 8);
  
  // Inserir no banco
  const db = require('./db');
  db.query(
    `INSERT INTO usuario (nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
    [nome, telefone, email, instagram, tipoUsuarioCorreto, tipo_circulo_id, eac_que_fez, fotoPath, hashedSenha],
    (err, result) => {
      if (err) {
        console.error('❌🎯 Erro ao criar usuário:', err);
        return res.status(500).json({ error: err.message || err });
      }
      
      const userId = Array.isArray(result) ? result[0]?.id : result.rows?.[0]?.id;
      console.log('✅🎯 Usuário criado com foto! ID:', userId);
      
      res.status(201).json({
        id: userId,
        message: 'Usuário criado com foto com sucesso!',
        foto: fotoPath,
        ...req.body
      });
    }
  );
});

// ==================== ARQUIVOS ESTÁTICOS ====================
// Servir arquivos estáticos do frontend e PWA
app.use('/admin', express.static(path.join(__dirname, '../frontend/dist')));
app.use(express.static(path.join(__dirname, '../pwa/dist')));

// ==================== SPA ROUTING ====================
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
