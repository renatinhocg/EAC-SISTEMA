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
  db.query('SELECT data FROM agenda WHERE id = $1', [agendaId], (err, results) => {
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
      SELECT p.id, p.equipe_id, p.usuario_id, p.data, u.nome, u.tipo_usuario, p.presente
      FROM presenca p
      JOIN usuario u ON u.id = p.usuario_id
      INNER JOIN (
        SELECT usuario_id, MAX(id) as max_id
        FROM presenca
        WHERE data = $1 AND equipe_id = $2
        GROUP BY usuario_id
      ) ult ON p.id = ult.max_id
      WHERE p.data = $3 AND p.equipe_id = $4
    `;
    db.query(sql, [data, equipeId, data, equipeId], (err2, results2) => {
      if (err2) {
        console.error('Erro SQL presencas/evento:', err2, { agendaId, equipeId, data });
        return res.status(500).json({ error: err2, sql: sql, params: [data, equipeId, data, equipeId] });
      }
      
      console.log(`🔍 [DEBUG] results2 ATUALIZADO:`, results2);
      console.log(`🔍 [DEBUG] results2.rows:`, results2.rows);
      console.log(`🔍 [DEBUG] Array que será usado:`, results2.rows || results2);
      
      // Agora que salvamos como números, não precisa transformar
      const presencasProcessadas = results2.rows || results2;
      
      console.log(`🔍 [GET PRESENCAS] Evento ${agendaId}, Equipe ${equipeId}, Data ${data}:`, {
        totalPresencas: presencasProcessadas.length,
        presencas: presencasProcessadas
      });
      res.json(presencasProcessadas);
    });
  });
});

// Marcar/atualizar presença de um usuário
router.post('/evento/:agendaId/equipe/:equipeId/usuario/:usuarioId', (req, res) => {
  const { agendaId, equipeId, usuarioId } = req.params;
  const { status } = req.body; // status: 'ok', 'falta', 'justificada'
  // Busca a data do evento
  db.query('SELECT data FROM agenda WHERE id = $1', [agendaId], (err, results) => {
    if (err || !results.length) return res.status(400).json({ error: 'Evento não encontrado' });
    const data = results[0].data;
    // status: 1 = ok, 0 = falta, 2 = justificada
    let presente = parseInt(status === 'ok' ? 1 : (status === 'justificada' ? 2 : 0));
    // LOG para depuração
    console.log('[PRESENCA POST]', {
      agendaId, equipeId, usuarioId, data, status, presente,
      sql: 'DELETE + INSERT',
      params: [parseInt(equipeId), parseInt(usuarioId), data, presente],
      tipos: [typeof parseInt(equipeId), typeof parseInt(usuarioId), typeof data, typeof presente]
    });
    // Primeiro, deletar presença existente se houver
    db.query(
      'DELETE FROM presenca WHERE equipe_id = $1 AND usuario_id = $2 AND data = $3',
      [parseInt(equipeId), parseInt(usuarioId), data],
      (err1) => {
        if (err1) {
          console.error('[PRESENCA DELETE][ERRO]', err1);
          return res.status(500).json({ error: err1 });
        }
        
        // Depois, inserir nova presença
        db.query(
          'INSERT INTO presenca (equipe_id, usuario_id, data, presente) VALUES ($1, $2, $3, $4)',
          [parseInt(equipeId), parseInt(usuarioId), data, presente],
          (err2) => {
            if (err2) {
              console.error('[PRESENCA INSERT][ERRO]', err2);
              return res.status(500).json({ error: err2 });
            }
            console.log('[PRESENCA POST][SUCESSO] Presença salva com sucesso!');
            res.json({ success: true });
          }
        );
      }
    );
  });
});

module.exports = router;
