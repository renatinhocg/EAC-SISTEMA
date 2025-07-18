const express = require('express');
const router = express.Router();
const db = require('../db');

// Listar tipos de círculo
router.get('/', (req, res) => {
  db.query('SELECT * FROM tipo_circulo', (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// Buscar tipo de círculo por ID
router.get('/:id', (req, res) => {
  db.query('SELECT * FROM tipo_circulo WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) return res.status(404).json({ error: 'Tipo não encontrado' });
    res.json(results[0]);
  });
});

// Criar novo tipo de círculo
router.post('/', (req, res) => {
  const { nome } = req.body;
  db.query('INSERT INTO tipo_circulo (nome) VALUES (?)', [nome], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.status(201).json({ id: result.insertId, nome });
  });
});

// Editar tipo de círculo
router.put('/:id', (req, res) => {
  const { nome } = req.body;
  db.query('UPDATE tipo_circulo SET nome = ? WHERE id = ?', [nome, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ id: req.params.id, nome });
  });
});

// Deletar tipo de círculo
router.delete('/:id', (req, res) => {
  db.query('DELETE FROM tipo_circulo WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ success: true });
  });
});

module.exports = router;
