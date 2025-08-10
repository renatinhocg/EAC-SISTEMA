require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');

const app = express();

// Configurar multer para upload de fotos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads/usuarios/'));
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

// Servir uploads como estáticos dentro do prefixo /api
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

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

// Configurar SPA routing para o frontend admin
app.get('/admin/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// Configurar SPA routing para o PWA (catch-all) - DEVE SER A ÚLTIMA ROTA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../pwa/dist/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor Full Stack rodando na porta ${PORT}`);
});
