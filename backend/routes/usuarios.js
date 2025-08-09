const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');

// Configurar multer para upload de fotos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/usuarios/'));
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

// Listar todos os usuários com nome da equipe
router.get('/', (req, res) => {
  console.log('📋 GET /usuarios - Listando usuários...');
  const sql = `
    SELECT u.*, u.equipe_id, e.nome AS equipe_nome
    FROM usuario u
    LEFT JOIN equipe e ON u.equipe_id = e.id
    ORDER BY u.id
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Erro ao listar usuários:', err);
      return res.status(500).json({ error: err });
    }
    console.log('✅ Resultado RAW do PostgreSQL:', results.length, 'usuários encontrados');
    
    // Fix: usar diretamente o results, pois nossa conexão customizada retorna o array direto
    const usuarios = results;
    
    res.json(usuarios);
  });
});

// Buscar usuário por ID
router.get('/:id', (req, res) => {
  console.log(`📋 GET /usuarios/${req.params.id} - Buscando usuário por ID...`);
  const sql = `SELECT * FROM usuario WHERE id = $1`;
  db.query(sql, [req.params.id], (err, results) => {
    if (err) {
      console.error('❌ Erro ao buscar usuário por ID:', err);
      return res.status(500).json({ error: err });
    }
    console.log('✅ Resultado da busca por ID:', results);
    if (results.length === 0) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json(results[0]);
  });
});

// Criar novo usuário
router.post('/', upload.single('foto'), (req, res) => {
  console.log('📝 POST /usuarios - Dados recebidos:', req.body);
  console.log('📷 Arquivo de foto:', req.file);

  // Função para garantir que campos opcionais não sejam undefined
  const safe = v => (v === undefined ? '' : v);
  const safeInt = v => (v === undefined || v === '' || v === null) ? null : parseInt(v);
  
  const nome = safe(req.body.nome);
  const telefone = safe(req.body.telefone);
  const email = safe(req.body.email);
  const instagram = safe(req.body.instagram);
  const tipo_usuario = safe(req.body.tipo_usuario);
  const tipo_circulo_id = safeInt(req.body.tipo_circulo_id);
  const equipe_id = safeInt(req.body.equipe_id);
  const eac_que_fez = safe(req.body.eac_que_fez);
  const senha = safe(req.body.senha);

  // Processar foto se foi enviada
  let fotoPath = null;
  if (req.file) {
    fotoPath = req.file.filename; // Apenas o nome do arquivo, não o caminho completo
    console.log('📷 Foto salva como:', fotoPath);
  }
  
  // Mapear tipo_usuario para valores aceitos pelo banco
  const tipoUsuarioMap = {
    'Admin': 'admin',
    'admin': 'admin',
    'Coordenador': 'coordenador',
    'coordenador': 'coordenador',
    'Integrante': 'integrante',
    'integrante': 'integrante'
  };
  
  const tipoUsuarioCorreto = tipoUsuarioMap[tipo_usuario] || 'integrante';
  console.log('📝 Mapeando tipo_usuario:', tipo_usuario, '->', tipoUsuarioCorreto);
  
  // Hash da senha se foi fornecida
  const hashedSenha = senha ? bcrypt.hashSync(senha, 8) : bcrypt.hashSync('123456', 8);
  
  console.log('📝 Executando INSERT com dados:', {
    nome, telefone, email, instagram, tipo_usuario: tipoUsuarioCorreto, tipo_circulo_id, eac_que_fez, foto: fotoPath, senha: 'HASH_OCULTO'
  });
  
  db.query(
    `INSERT INTO usuario (nome, telefone, email, instagram, tipo_usuario, equipe_id, tipo_circulo_id, eac_que_fez, foto, senha)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
    [nome, telefone, email, instagram, tipoUsuarioCorreto, equipe_id, tipo_circulo_id, eac_que_fez, fotoPath, hashedSenha],
    (err, result) => {
      if (err) {
        console.error('❌ Erro ao inserir usuário:', err);
        return res.status(500).json({ error: err.message || err });
      }
      
      console.log('✅ Resultado completo:', JSON.stringify(result, null, 2));
      
      // Extrair ID de forma mais robusta - testar todos os formatos possíveis
      let userId = null;
      try {
        if (result && result.rows && result.rows[0] && result.rows[0].id) {
          userId = result.rows[0].id;
          console.log('✅ ID extraído de result.rows[0].id:', userId);
        } else if (Array.isArray(result) && result[0] && result[0].id) {
          userId = result[0].id;
          console.log('✅ ID extraído de result[0].id:', userId);
        } else if (result.insertId) {
          userId = result.insertId;
          console.log('✅ ID extraído de result.insertId:', userId);
        } else {
          console.log('⚠️ Não foi possível extrair ID, mas usuário foi criado');
          userId = 'criado'; // Fallback
        }
      } catch (extractError) {
        console.error('❌ Erro ao extrair ID:', extractError);
        userId = 'criado';
      }
      
      const responseData = { 
        id: userId, 
        message: 'Usuário criado com sucesso',
        ...req.body 
      };
      
      console.log('✅ Enviando resposta:', JSON.stringify(responseData, null, 2));
      res.status(201).json(responseData);
    }
  );
});

// Login de usuário
router.post('/login', (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }
  db.query(
    `SELECT u.*, e.id as e_id, e.nome as equipe_nome 
     FROM usuario u 
     LEFT JOIN equipe e ON u.equipe_id = e.id 
     WHERE u.email = $1`,
    [email],
    async (err, results) => {
      if (err) return res.status(500).json({ error: err });
      if (results.length === 0) return res.status(401).json({ error: 'Usuário não encontrado' });
      
      const user = results[0];
      
      console.log('🔍 Dados do usuário no login - RAW:', JSON.stringify(user, null, 2));
      console.log('🔍 Tipo usuario específico:', user.tipo_usuario);
      console.log('🔍 Equipe específica:', user.equipe_nome, user.e_id);
      
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
});

// Editar usuário (genérico)
router.put('/:id', (req, res) => {
  console.log(`PUT /usuarios/${req.params.id}`, req.body);
  const { nome, telefone, email, instagram, tipo_usuario, equipe_id, tipo_circulo_id, eac_que_fez, foto, senha } = req.body;
  db.query(
    `UPDATE usuario SET nome=$1, telefone=$2, email=$3, instagram=$4, tipo_usuario=$5, equipe_id=$6, tipo_circulo_id=$7, eac_que_fez=$8, foto=$9, senha=$10 WHERE id=$11`,
    [nome, telefone, email, instagram, tipo_usuario, equipe_id, tipo_circulo_id, eac_que_fez, foto || null, senha, req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      // Buscar o usuário atualizado no banco
      db.query('SELECT * FROM usuario WHERE id = $1', [req.params.id], (err2, results) => {
        if (err2) return res.status(500).json({ error: err2 });
        if (!results || results.length === 0) return res.status(404).json({ error: 'Usuário não encontrado após update' });
        res.json(results[0]);
      });
    }
  );
});

// Upload de foto do usuário
router.post('/:id/foto', upload.single('foto'), (req, res) => {
  console.log(`📷 POST /usuarios/${req.params.id}/foto - Upload de foto`);
  console.log('📷 Arquivo recebido:', req.file);
  
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo foi enviado' });
  }
  
  const fotoPath = req.file.filename;
  const userId = req.params.id;
  
  console.log(`📷 Atualizando usuário ${userId} com foto: ${fotoPath}`);
  
  db.query(
    'UPDATE usuario SET foto = $1 WHERE id = $2',
    [fotoPath, userId],
    (err, result) => {
      if (err) {
        console.error('❌ Erro ao atualizar foto do usuário:', err);
        return res.status(500).json({ error: err });
      }
      
      console.log('✅ Foto atualizada com sucesso');
      res.json({ 
        success: true, 
        caminho: `/uploads/usuarios/${fotoPath}`,
        filename: fotoPath 
      });
    }
  );
});

// Servir fotos dos usuários
router.get('/foto/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '../uploads/usuarios/', filename);
  res.sendFile(filePath);
});

// Deletar usuário
router.delete('/:id', (req, res) => {
  db.query('DELETE FROM usuario WHERE id = $1', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ success: true });
  });
});

// Importação em lote de usuários via CSV
router.post('/import-csv', async (req, res) => {
  const { usuarios } = req.body;
  if (!Array.isArray(usuarios) || usuarios.length === 0) {
    return res.status(400).json({ error: 'Nenhum usuário enviado.' });
  }
  // Campos esperados: nome, telefone, email, tipo_usuario, senha (removido equipe_id)
  const values = usuarios.map(u => [
    u.nome,
    u.telefone || null,
    u.email,
    u.instagram || null,
    u.tipo_usuario || 'integrante',
    u.tipo_circulo_id || null,
    u.eac_que_fez || null,
    u.foto || null,
    bcrypt.hashSync(u.senha || '123456', 8)
  ]);
  
  // PostgreSQL bulk insert
  const placeholders = values.map((_, i) => {
    const offset = i * 9;
    return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9})`;
  }).join(', ');
  
  const flatValues = values.flat();
  
  db.query(
    `INSERT INTO usuario (nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha)
     VALUES ${placeholders}`,
    flatValues,
    (err, result) => {
      if (err) {
        console.error('Erro PostgreSQL ao importar usuários:', err.sqlMessage || err.message || err);
        return res.status(500).json({ error: err.sqlMessage || err.message || err });
      }
      res.json({ success: true, count: result.rowCount });
    }
  );
});

module.exports = router;
