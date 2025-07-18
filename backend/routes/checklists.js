const express = require('express');
const router = express.Router();
const db = require('../db');

// Listar todos os checklists com equipes associadas
router.get('/', (req, res) => {
  const sql = `
    SELECT c.id, c.titulo, c.descricao, c.tipo,
      STRING_AGG(ce.equipe_id::text, ',') AS equipe_ids
    FROM checklist c
    LEFT JOIN checklist_equipes ce ON ce.checklist_id = c.id
    GROUP BY c.id, c.titulo, c.descricao, c.tipo`;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    const data = results.map(r => ({
      id: r.id,
      titulo: r.titulo,
      descricao: r.descricao,
      tipo: r.tipo,
      equipe_ids: r.equipe_ids ? r.equipe_ids.split(',').map(id => parseInt(id)) : []
    }));
    res.json(data);
  });
});

// Buscar checklist por ID com equipes associadas
router.get('/:id', (req, res) => {
  const sql = `
    SELECT c.id, c.titulo, c.descricao, c.tipo,
      GROUP_CONCAT(ce.equipe_id) AS equipe_ids
    FROM checklist c
    LEFT JOIN checklist_equipes ce ON ce.checklist_id = c.id
    WHERE c.id = ?
    GROUP BY c.id`;
  db.query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (!results.length) return res.status(404).json({ error: 'Checklist não encontrada' });
    const r = results[0];
    res.json({
      id: r.id,
      titulo: r.titulo,
      descricao: r.descricao,
      tipo: r.tipo,
      equipe_ids: r.equipe_ids ? r.equipe_ids.split(',').map(id => parseInt(id)) : []
    });
  });
});

// Criar nova checklist e associações
router.post('/', (req, res) => {
  const { titulo, descricao, tipo, equipe_ids } = req.body;
  console.log('POST checklist req.body:', req.body); // LOG PARA DEBUG
  db.query(
    'INSERT INTO checklist (titulo, descricao, tipo) VALUES (?, ?, ?)',
    [titulo, descricao, tipo],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      const checklistId = result.insertId;
      if (Array.isArray(equipe_ids) && equipe_ids.length) {
        const values = equipe_ids.map(id => [checklistId, id]);
        db.query(
          'INSERT INTO checklist_equipes (checklist_id, equipe_id) VALUES ?',
          [values],
          err2 => {
            if (err2) console.error(err2);
            res.status(201).json({ id: checklistId });
          }
        );
      } else {
        res.status(201).json({ id: checklistId });
      }
    }
  );
});

// Atualizar checklist e associações
router.put('/:id', (req, res) => {
  const { titulo, descricao, tipo, equipe_ids } = req.body;
  console.log('PUT checklist req.body:', req.body); // LOG PARA DEBUG
  db.query(
    'UPDATE checklist SET titulo = ?, descricao = ?, tipo = ? WHERE id = ?',
    [titulo, descricao, tipo, req.params.id],
    err => {
      if (err) return res.status(500).json({ error: err });
      // Atualizar associações
      db.query('DELETE FROM checklist_equipes WHERE checklist_id = ?', [req.params.id], delErr => {
        if (delErr) console.error(delErr);
        if (Array.isArray(equipe_ids) && equipe_ids.length) {
          const values = equipe_ids.map(id => [req.params.id, id]);
          db.query(
            'INSERT INTO checklist_equipes (checklist_id, equipe_id) VALUES ?',
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

// Deletar checklist e suas associações
router.delete('/:id', (req, res) => {
  db.query('DELETE FROM checklist WHERE id = ?', [req.params.id], err => {
    if (err) return res.status(500).json({ error: err });
    res.json({ success: true });
  });
});

module.exports = router;
