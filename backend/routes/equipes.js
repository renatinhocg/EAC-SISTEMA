const express = require('express');
const router = express.Router();
const db = require('../db');

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
router.post('/', (req, res) => {
  const { nome, descricao, sobre, funcao } = req.body;
  console.log('POST /equipes payload:', req.body);
  db.query(
    'INSERT INTO equipe (nome, descricao, sobre, funcao) VALUES (?, ?, ?, ?)',
    [nome, descricao, sobre, funcao],
    (err, result) => {
      if (err) {
        console.error('Erro ao inserir equipe:', err);
        return res.status(500).json({ error: err.sqlMessage || err });
      }
      console.log('Equipe criada com ID:', result.insertId);
      res.status(201).json({ id: result.insertId, nome, descricao, sobre, funcao });
    }
  );
});

// Editar equipe
router.put('/:id', (req, res) => {
  const { nome, descricao, sobre, funcao } = req.body;
  console.log(`PUT /equipes/${req.params.id} payload:`, req.body);
  db.query(
    'UPDATE equipe SET nome = ?, descricao = ?, sobre = ?, funcao = ? WHERE id = ?',
    [nome, descricao, sobre, funcao, req.params.id],
    (err, result) => {
      if (err) {
        console.error('Erro ao atualizar equipe:', err);
        return res.status(500).json({ error: err.sqlMessage || err });
      }
      console.log('Equipe atualizada ID:', req.params.id);
      res.json({ id: req.params.id, nome, descricao, sobre, funcao });
    }
  );
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
  db.query(
    'SELECT * FROM usuario WHERE equipe_id = ?',
    [req.params.id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json(results);
    }
  );
});

module.exports = router;
