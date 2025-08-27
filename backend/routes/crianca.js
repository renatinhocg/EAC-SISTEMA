const express = require('express');
const router = express.Router();
const db = require('../db');

// Listar todas as crianças
router.get('/', (req, res) => {
  db.query('SELECT * FROM crianca', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Criar nova criança
router.post('/', (req, res) => {
  console.log('POST /crianca body:', req.body);
  const campos = [
    'usuario_id', 'equipe_id', 'telefone', 'nome', 'idade',
    'alergiaAlimentar', 'alergiaAlimentarDesc',
    'alergiaMedic', 'alergiaMedicDesc',
    'alergiaContato', 'alergiaContatoDesc',
    'restricaoAlimentar', 'assinatura', 'createdat'
  ];
  const values = campos.map(c => {
    if (c === 'createdat') {
      return new Date();
    }
    return req.body[c];
  });
  const sql = `INSERT INTO crianca (${campos.join(',')}) VALUES (${campos.map(() => '?').join(',')}) RETURNING *`;
  db.query(sql, values, (err, rows) => {
    if (err) return res.status(400).json({ error: err.message });
    res.status(201).json(rows[0]);
  });
});

// Buscar criança por id
router.get('/:id', (req, res) => {
  db.query('SELECT * FROM crianca WHERE id = ?', [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!rows.length) return res.status(404).json({ error: 'Não encontrada' });
    res.json(rows[0]);
  });
});

module.exports = router;
