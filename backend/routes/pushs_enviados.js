const express = require('express');
const router = express.Router();
const db = require('../db');

// Retorna o histórico de pushs enviados
router.get('/', (req, res) => {
  db.query('SELECT * FROM pushs_enviados ORDER BY created_at DESC', (err, results) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar pushs enviados' });
    res.json(results.rows || results);
  });
});

module.exports = router;
