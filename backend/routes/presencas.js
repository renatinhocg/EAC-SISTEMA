const express = require('express');
const router = express.Router();
const db = require('../db');

// CRUD Presenças
router.get('/', (req, res) => {
  res.send('Listar presenças');
});
router.post('/', (req, res) => {
  res.send('Criar presença');
});
router.get('/:id', (req, res) => {
  res.send('Detalhar presença');
});
router.put('/:id', (req, res) => {
  res.send('Editar presença');
});
router.delete('/:id', (req, res) => {
  res.send('Deletar presença');
});

// Listar presenças por evento e equipe
router.get('/evento/:agendaId/equipe/:equipeId', (req, res) => {
  const { agendaId, equipeId } = req.params;
  db.query('SELECT data FROM agenda WHERE id = ?', [agendaId], (err, results) => {
    if (err || !results.length) {
      console.error('Agenda não encontrada ou erro ao buscar data:', err, { agendaId });
      return res.status(404).json({ error: 'Agenda não encontrada', agendaId });
    }
    const data = results[0].data;
    if (!data) {
      console.error('Agenda sem data definida:', { agendaId });
      return res.status(400).json({ error: 'Agenda sem data definida', agendaId });
    }
    const sql = `
      SELECT p.*, u.nome, u.tipo_usuario
      FROM presenca p
      JOIN usuario u ON u.id = p.usuario_id
      INNER JOIN (
        SELECT usuario_id, MAX(id) as max_id
        FROM presenca
        WHERE data = ? AND equipe_id = ?
        GROUP BY usuario_id
      ) ult ON p.id = ult.max_id
      WHERE p.data = ? AND p.equipe_id = ?
    `;
    db.query(sql, [data, equipeId, data, equipeId], (err2, results2) => {
      if (err2) {
        console.error('Erro SQL presencas/evento:', err2, { agendaId, equipeId, data });
        return res.status(500).json({ error: err2, sql: sql, params: [data, equipeId, data, equipeId] });
      }
      res.json(results2);
    });
  });
});

// Marcar/atualizar presença de um usuário
router.post('/evento/:agendaId/equipe/:equipeId/usuario/:usuarioId', (req, res) => {
  const { agendaId, equipeId, usuarioId } = req.params;
  const { status } = req.body; // status: 'ok', 'falta', 'justificada'
  // Busca a data do evento
  db.query('SELECT data FROM agenda WHERE id = ?', [agendaId], (err, results) => {
    if (err || !results.length) return res.status(400).json({ error: 'Evento não encontrado' });
    const data = results[0].data;
    // status: 1 = ok, 0 = falta, 2 = justificada
    let presente = status === 'ok' ? 1 : (status === 'justificada' ? 2 : 0);
    // LOG para depuração
    console.log('[PRESENCA POST]', {
      agendaId, equipeId, usuarioId, data, status, presente,
      sql: 'INSERT INTO presenca (equipe_id, usuario_id, data, presente) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE presente = VALUES(presente)',
      params: [equipeId, usuarioId, data, presente]
    });
    // Upsert
    db.query(
      'INSERT INTO presenca (equipe_id, usuario_id, data, presente) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE presente = VALUES(presente)',
      [equipeId, usuarioId, data, presente],
      (err2) => {
        if (err2) {
          console.error('[PRESENCA POST][ERRO]', err2);
          return res.status(500).json({ error: err2 });
        }
        res.json({ success: true });
      }
    );
  });
});

module.exports = router;
