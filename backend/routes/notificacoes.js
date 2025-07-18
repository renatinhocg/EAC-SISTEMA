const express = require('express');
const router = express.Router();
const db = require('../db');

// Listar notificações (opcional filtro por equipe ou para_todos)
router.get('/', (req, res) => {
  const { equipe_id } = req.query;
  let sql = 'SELECT * FROM notificacao';
  const params = [];
  if (equipe_id) {
    sql += ' WHERE (para_todos = TRUE OR equipe_id = ?)';
    params.push(equipe_id);
  }
  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// Detalhar notificação
router.get('/:id', (req, res) => {
  db.query('SELECT * FROM notificacao WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) return res.status(404).json({ error: 'Notificação não encontrada' });
    res.json(results[0]);
  });
});

// Criar notificação
router.post('/', (req, res) => {
  const { titulo, descricao, para_todos, equipe_id } = req.body;
  db.query(
    'INSERT INTO notificacao (titulo, descricao, para_todos, equipe_id) VALUES (?,?,?,?)',
    [titulo, descricao, para_todos === 'true' || para_todos === true, equipe_id || null],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.status(201).json({ id: result.insertId, titulo, descricao, para_todos, equipe_id });
    }
  );
});

// Atualizar notificação
router.put('/:id', (req, res) => {
  const { titulo, descricao, para_todos, equipe_id } = req.body;
  db.query(
    'UPDATE notificacao SET titulo = ?, descricao = ?, para_todos = ?, equipe_id = ? WHERE id = ?',
    [titulo, descricao, para_todos === 'true' || para_todos === true, equipe_id || null, req.params.id],
    err => {
      if (err) return res.status(500).json({ error: err });
      res.json({ id: req.params.id, titulo, descricao, para_todos, equipe_id });
    }
  );
});

// Deletar notificação
router.delete('/:id', (req, res) => {
  db.query('DELETE FROM notificacao WHERE id = ?', [req.params.id], err => {
    if (err) return res.status(500).json({ error: err });
    res.json({ success: true });
  });
});

module.exports = router;
