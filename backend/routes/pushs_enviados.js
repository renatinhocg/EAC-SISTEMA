const express = require('express');
const router = express.Router();

// Exemplo de endpoint para listar pushs enviados
const db = require('../db');
router.get('/', (req, res) => {
	db.query('SELECT * FROM pushs_enviados ORDER BY created_at DESC LIMIT 100', [], (err, rows) => {
		if (err) {
			console.error('[PUSH] Erro ao buscar histórico:', err);
			return res.status(500).json({ error: 'Erro ao buscar histórico de pushs' });
		}
		res.json(rows);
	});
});

module.exports = router;
