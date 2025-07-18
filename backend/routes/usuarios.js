const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Listar todos os usuários com equipe
router.get('/', (req, res) => {
  const sql = `
    SELECT u.*, e.id AS equipe_id, e.nome AS equipe_nome
    FROM usuario u
    LEFT JOIN equipe e ON u.equipe_id = e.id
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// Buscar usuário por ID (inclui equipe)
router.get('/:id', (req, res) => {
  const sql = `
    SELECT u.*, e.id AS equipe_id, e.nome AS equipe_nome
    FROM usuario u
    LEFT JOIN equipe e ON u.equipe_id = e.id
    WHERE u.id = ?`;
  db.query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json(results[0]);
  });
});

// Criar novo usuário
router.post('/', (req, res) => {
  const { nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id } = req.body;
  db.query(
    `INSERT INTO usuario (nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, equipe_id, senha)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto || null, equipe_id || null, senha],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.status(201).json({ id: result.insertId, ...req.body });
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
    'SELECT u.*, e.id AS equipe_id, e.nome AS equipe_nome FROM usuario u LEFT JOIN equipe e ON u.equipe_id = e.id WHERE u.email = ?',
    [email],
    (err, results) => {
      if (err) return res.status(500).json({ error: err });
      if (results.length === 0) return res.status(401).json({ error: 'Usuário não encontrado' });
      const user = results[0];
      if (user.senha !== senha) {
        return res.status(401).json({ error: 'Senha incorreta' });
      }
      const token = jwt.sign(
        { id: user.id, email: user.email, nome: user.nome, tipo_usuario: user.tipo_usuario },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      // Include equipe info in response
      res.json({
        token,
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          tipo_usuario: user.tipo_usuario,
          foto: user.foto,
          equipe: user.equipe_id ? { id: user.equipe_id, nome: user.equipe_nome } : null
        }
      });
    }
  );
});

// Atualizar equipe do usuário
router.put('/:id/equipe', (req, res) => {
  console.log(`PUT /usuarios/${req.params.id}/equipe`, req.body);
  const { equipe_id } = req.body;
  db.query(
    'UPDATE usuario SET equipe_id = ? WHERE id = ?',
    [equipe_id, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err });
      // Retornar nova equipe vinculada
      db.query(
        'SELECT e.id, e.nome FROM equipe e JOIN usuario u ON u.equipe_id = e.id WHERE u.id = ?',
        [req.params.id],
        (err2, results) => {
          if (err2) return res.status(500).json({ error: err2 });
          res.json({ equipe: results[0] || null });
        }
      );
    }
  );
});

// Editar usuário (genérico)
router.put('/:id', (req, res) => {
  console.log(`PUT /usuarios/${req.params.id}`, req.body);
  const { nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id } = req.body;
  db.query(
    `UPDATE usuario SET nome=?, telefone=?, email=?, instagram=?, tipo_usuario=?, tipo_circulo_id=?, eac_que_fez=?, foto=?, equipe_id=?, senha=? WHERE id=?`,
    [nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto || null, equipe_id || null, senha, req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ id: req.params.id, ...req.body });
    }
  );
});

// Deletar usuário
router.delete('/:id', (req, res) => {
  db.query('DELETE FROM usuario WHERE id = ?', [req.params.id], (err, result) => {
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
  // Campos esperados: nome, telefone, email, tipo_usuario, equipe_id, senha
  const values = usuarios.map(u => [
    u.nome,
    u.telefone || null,
    u.email,
    u.instagram || null,
    u.tipo_usuario || 'integrante',
    u.tipo_circulo_id || null,
    u.eac_que_fez || null,
    u.foto || null,
    u.equipe_id || null,
    bcrypt.hashSync(u.senha || '123456', 8)
  ]);
  db.query(
    `INSERT INTO usuario (nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, equipe_id, senha)
     VALUES ?`,
    [values],
    (err, result) => {
      if (err) {
        console.error('Erro MySQL ao importar usuários:', err.sqlMessage || err.message || err);
        return res.status(500).json({ error: err.sqlMessage || err.message || err });
      }
      res.json({ success: true, count: result.affectedRows });
    }
  );
});

module.exports = router;
