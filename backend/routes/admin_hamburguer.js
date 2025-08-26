const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /hamburguer/reservas

router.get('/reservas', (req, res) => {
  // Forçar envio do header CORS para o domínio do admin
  res.setHeader('Access-Control-Allow-Origin', 'https://eac-pwa-project-production.up.railway.app');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  // Query compatível com PostgreSQL e MySQL
  const query = `
      SELECT h.*, 
        u.nome AS usuario_nome,
        e.nome AS equipe_nome
      FROM hamburguer h
      LEFT JOIN usuario u ON u.id = h.usuario_id
      LEFT JOIN equipe e ON u.equipe_id = e.id
      ORDER BY h.id DESC
  `;
  db.query(query, [], (err, results) => {
    if (err) {
      console.error('Erro ao buscar reservas:', err);
      // Garante envio do header mesmo em erro
      res.setHeader('Access-Control-Allow-Origin', 'https://eac-pwa-project-production.up.railway.app');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      return res.status(500).json({ error: 'Erro ao buscar reservas.' });
    }
    console.log('TESTE CORS - RESERVAS', new Date().toISOString());
    console.log('Resultado da query hamburguer:', results);
    res.json({
      teste: 'deploy atualizado',
      data: new Date().toISOString(),
      reservas: results
    });
  });
});

module.exports = router;
