const express = require('express');
const router = express.Router();
const db = require('../db');

// Listar todas as agendas com equipes associadas
router.get('/', (req, res) => {
  const sql = `
    SELECT a.*, STRING_AGG(ae.equipe_id::text, ',') AS equipe_ids
    FROM agenda a
    LEFT JOIN agenda_equipes ae ON ae.agenda_id = a.id
    GROUP BY a.id`;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    const data = results.map(r => ({
      ...r,
      equipe_ids: r.equipe_ids ? r.equipe_ids.split(',').map(id => parseInt(id)) : []
    }));
    res.json(data);
  });
});

// Buscar agenda por ID com equipes associadas
router.get('/:id', (req, res) => {
  const sql = `
    SELECT a.*, STRING_AGG(ae.equipe_id::text, ',') AS equipe_ids
    FROM agenda a
    LEFT JOIN agenda_equipes ae ON ae.agenda_id = a.id
    WHERE a.id = ?
    GROUP BY a.id`;
  db.query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (!results.length) return res.status(404).json({ error: 'Agenda não encontrada' });
    const r = results[0];
    res.json({
      ...r,
      equipe_ids: r.equipe_ids ? r.equipe_ids.split(',').map(id => parseInt(id)) : []
    });
  });
});

// Criar nova agenda e associações
router.post('/', (req, res) => {
  const { titulo, descricao, data, hora_inicio, hora_fim, local, equipe_ids, presenca_ativa } = req.body;
  console.log('POST /agendas req.body:', req.body); // LOG DEBUG
  db.query(
    'INSERT INTO agenda (titulo, descricao, data, hora_inicio, hora_fim, local, presenca_ativa) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING id',
    [titulo, descricao, data, hora_inicio, hora_fim, local, presenca_ativa ? 1 : 0],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      const agendaId = result[0].id; // result.rows[0].id -> result[0].id (wrapper simula formato MySQL)
      if (Array.isArray(equipe_ids) && equipe_ids.length) {
        // PostgreSQL: inserir um por vez
        const insertPromises = equipe_ids.map(equipeId => 
          new Promise((resolve, reject) => {
            db.query(
              'INSERT INTO agenda_equipes (agenda_id, equipe_id) VALUES (?, ?)',
              [agendaId, equipeId],
              (err2) => {
                if (err2) reject(err2);
                else resolve();
              }
            );
          })
        );
        Promise.all(insertPromises)
          .then(() => res.status(201).json({ id: agendaId }))
          .catch(err2 => {
            console.error(err2);
            res.status(500).json({ error: err2 });
          });
      } else {
        res.status(201).json({ id: agendaId });
      }
    }
  );
});

// Atualizar agenda e associações
router.put('/:id', (req, res) => {
  const { titulo, descricao, data, hora_inicio, hora_fim, local, equipe_ids, presenca_ativa } = req.body;
  console.log('PUT /agendas req.body:', req.body); // LOG DEBUG
  db.query(
    'UPDATE agenda SET titulo = ?, descricao = ?, data = ?, hora_inicio = ?, hora_fim = ?, local = ?, presenca_ativa = ? WHERE id = ?',
    [titulo, descricao, data, hora_inicio, hora_fim, local, presenca_ativa ? 1 : 0, req.params.id],
    err => {
      if (err) return res.status(500).json({ error: err });
      db.query('DELETE FROM agenda_equipes WHERE agenda_id = ?', [req.params.id], delErr => {
        if (delErr) console.error(delErr);
        if (Array.isArray(equipe_ids) && equipe_ids.length) {
          const values = equipe_ids.map(id => [req.params.id, id]);
          db.query(
            'INSERT INTO agenda_equipes (agenda_id, equipe_id) VALUES ?',
            [values],
            insErr => {
              if (insErr) console.error(insErr);
              res.json({ id: parseInt(req.params.id) });
            }
          );
        } else {
          res.json({ id: parseInt(req.params.id) });
        }
      });
    }
  );
});

// Deletar agenda
router.delete('/:id', (req, res) => {
  db.query('DELETE FROM agenda WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ success: true });
  });
});

module.exports = router;
