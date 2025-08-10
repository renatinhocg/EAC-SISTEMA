const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');

// Configurar multer para upload de imagens de equipes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/equipes/'));
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    cb(null, timestamp + extension);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos de imagem são permitidos!'));
    }
  }
});

// Listar todas as equipes (com filtro por coordenador, se informado)
router.get('/', (req, res) => {
  const { coordenador_id } = req.query;
  if (coordenador_id) {
    // Busca equipes onde o usuário informado é coordenador
    const sql = `SELECT e.* FROM equipe e
      JOIN usuario u ON u.equipe_id = e.id
      WHERE u.id = ? AND u.tipo_usuario = 'Coordenador'`;
    db.query(sql, [coordenador_id], (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json(results);
    });
  } else {
    db.query('SELECT * FROM equipe', (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json(results);
    });
  }
});

// Buscar equipe por ID
router.get('/:id', (req, res) => {
  db.query('SELECT * FROM equipe WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) return res.status(404).json({ error: 'Equipe não encontrada' });
    res.json(results[0]);
  });
});

// Criar nova equipe
router.post('/', upload.single('imagem'), (req, res) => {
  const { nome, descricao, sobre, funcao } = req.body;
  const imagem = req.file ? req.file.filename : null;
  
  console.log('POST /equipes payload:', req.body);
  console.log('POST /equipes imagem:', imagem);
  
  db.query(
    'INSERT INTO equipe (nome, descricao, sobre, funcao, imagem) VALUES (?, ?, ?, ?, ?)',
    [nome, descricao, sobre, funcao, imagem],
    (err, result) => {
      if (err) {
        console.error('Erro ao inserir equipe:', err);
        return res.status(500).json({ error: err.sqlMessage || err });
      }
      console.log('Equipe criada com ID:', result.insertId);
      res.status(201).json({ id: result.insertId, nome, descricao, sobre, funcao, imagem });
    }
  );
});

// Editar equipe
router.put('/:id', upload.single('imagem'), (req, res) => {
  const { nome, descricao, sobre, funcao } = req.body;
  const imagem = req.file ? req.file.filename : null;
  
  console.log(`PUT /equipes/${req.params.id} payload:`, req.body);
  console.log(`PUT /equipes/${req.params.id} imagem:`, imagem);
  
  let sql, params;
  
  if (imagem) {
    // Se há nova imagem, atualizar tudo incluindo imagem
    sql = 'UPDATE equipe SET nome = ?, descricao = ?, sobre = ?, funcao = ?, imagem = ? WHERE id = ?';
    params = [nome, descricao, sobre, funcao, imagem, req.params.id];
  } else {
    // Se não há nova imagem, manter a existente
    sql = 'UPDATE equipe SET nome = ?, descricao = ?, sobre = ?, funcao = ? WHERE id = ?';
    params = [nome, descricao, sobre, funcao, req.params.id];
  }
  
  db.query(sql, params, (err, result) => {
    if (err) {
      console.error('Erro ao atualizar equipe:', err);
      return res.status(500).json({ error: err.sqlMessage || err });
    }
    console.log('Equipe atualizada ID:', req.params.id);
    res.json({ id: req.params.id, nome, descricao, sobre, funcao, imagem });
  });
});

// Deletar equipe
router.delete('/:id', (req, res) => {
  db.query('DELETE FROM equipe WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ success: true });
  });
});

// Listar usuários de uma equipe
router.get('/:id/usuarios', (req, res) => {
  console.log(`🔍 GET /equipes/${req.params.id}/usuarios - Buscando usuários da equipe`);
  db.query(
    'SELECT * FROM usuario WHERE equipe_id = ?',
    [req.params.id],
    (err, results) => {
      if (err) {
        console.error('❌ Erro ao buscar usuários da equipe:', err);
        return res.status(500).json({ error: err });
      }
      console.log(`✅ Encontrados ${results.length} usuários na equipe ${req.params.id}`);
      res.json(results);
    }
  );
});

// Buscar membros de uma equipeS
router.get('/:id/membros', (req, res) => {
  console.log(`🔍 Buscando membros da equipe ${req.params.id}`);
  const sql = `
    SELECT u.id, u.nome, u.foto, u.tipo_usuario, u.email, u.telefone
    FROM usuario u
    WHERE u.equipe_id = $1
    ORDER BY u.nome
  `;
  db.query(sql, [req.params.id], (err, results) => {
    if (err) {
      console.error('❌ Erro ao buscar membros:', err);
      return res.status(500).json({ error: err });
    }
    console.log(`✅ Membros encontrados para equipe ${req.params.id}:`, results);
    res.json(results);
  });
});

module.exports = router;
