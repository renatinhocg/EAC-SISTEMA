console.log('[CHECKLISTS ROUTER] Arquivo carregado');
const express = require('express');
const router = express.Router();
const db = require('../db');

// Listar todos os checklists com equipes associadas
router.get('/', (req, res) => {
  const sql = `
    SELECT c.id, c.titulo, c.descricao, c.tipo,
      COALESCE(STRING_AGG(ce.equipe_id::text, ','), '') AS equipe_ids
    FROM checklist c
    LEFT JOIN checklist_equipes ce ON ce.checklist_id = c.id
    GROUP BY c.id`;
  console.log('[GET /checklists] INICIANDO');
  db.query(sql, (err, results) => {
    if (err) {
      console.error('[GET /checklists] ERRO SQL:', err);
      return res.status(500).json({ error: err });
    }
    console.log('[GET /checklists] Resultados:', results);
    const data = results.map(r => ({
      id: r.id,
      titulo: r.titulo,
      descricao: r.descricao,
      tipo: r.tipo,
      equipe_ids: r.equipe_ids ? r.equipe_ids.split(',').map(id => parseInt(id)) : []
    }));
    res.json(data);
    console.log('[GET /checklists] FINALIZADO');
  });
});

// Buscar checklist por ID com equipes associadas
router.get('/:id', (req, res) => {
  const sql = `
    SELECT c.id, c.titulo, c.descricao, c.tipo,
      COALESCE(STRING_AGG(ce.equipe_id::text, ','), '') AS equipe_ids
    FROM checklist c
    LEFT JOIN checklist_equipes ce ON ce.checklist_id = c.id
    WHERE c.id = ?
    GROUP BY c.id`;
  console.log(`[GET /checklists/:id] INICIANDO id=`, req.params.id);
  db.query(sql, [req.params.id], (err, results) => {
    if (err) {
      console.error(`[GET /checklists/:id] ERRO SQL:`, err);
      return res.status(500).json({ error: err });
    }
    if (!results.length) {
      console.warn(`[GET /checklists/:id] Checklist não encontrada para id:`, req.params.id);
      return res.status(404).json({ error: 'Checklist não encontrada' });
    }
    const r = results[0];
    console.log(`[GET /checklists/:id] Resultado:`, r);
    res.json({
      id: r.id,
      titulo: r.titulo,
      descricao: r.descricao,
      tipo: r.tipo,
      equipe_ids: r.equipe_ids ? r.equipe_ids.split(',').map(id => parseInt(id)) : []
    });
    console.log(`[GET /checklists/:id] FINALIZADO id=`, req.params.id);
  });
});

// Criar nova checklist e associações
router.post('/', (req, res) => {
  let { titulo, descricao, tipo, equipe_ids } = req.body;
  console.log('[POST /checklists] INICIANDO');
  console.log('[POST /checklists] req.body:', req.body);
  // Força conversão para número
  if (Array.isArray(equipe_ids)) {
    equipe_ids = equipe_ids.map(id => Number(id));
  }
  db.query(
    'INSERT INTO checklist (titulo, descricao, tipo) VALUES (?, ?, ?) RETURNING id',
    [titulo, descricao, tipo],
    (err, result) => {
      if (err) {
        console.error('[POST /checklists] ERRO SQL INSERT checklist:', err);
        return res.status(500).json({ error: err });
      }
      const checklistId = result[0].id;
      console.log('[POST /checklists] checklistId criado:', checklistId);
      if (Array.isArray(equipe_ids) && equipe_ids.length) {
        console.log('[POST /checklists] equipe_ids recebidos:', equipe_ids);
        const insertPromises = equipe_ids.map(equipeId => 
          new Promise((resolve, reject) => {
            db.query(
              'INSERT INTO checklist_equipes (checklist_id, equipe_id) VALUES (?, ?)',
              [checklistId, equipeId],
              (err2) => {
                if (err2) {
                  console.error(`[POST /checklists] ERRO INSERT checklist_equipes: checklistId=${checklistId}, equipeId=${equipeId}`, err2);
                  reject(err2);
                } else {
                  console.log(`[POST /checklists] checklist_equipes inserida: checklistId=${checklistId}, equipeId=${equipeId}`);
                  resolve();
                }
              }
            );
          })
        );
        Promise.all(insertPromises)
          .then(() => {
            console.log('[POST /checklists] checklist_equipes inseridas com sucesso');
            res.status(201).json({ id: checklistId });
            console.log('[POST /checklists] FINALIZADO com sucesso id=', checklistId);
          })
          .catch(err2 => {
            console.error('[POST /checklists] ERRO Promise.all checklist_equipes:', err2);
            res.status(500).json({ error: err2 });
            console.log('[POST /checklists] FINALIZADO com erro id=', checklistId);
          });
      } else {
        console.log('[POST /checklists] Nenhuma equipe associada enviada id=', checklistId);
        res.status(201).json({ id: checklistId });
        console.log('[POST /checklists] FINALIZADO sem equipes id=', checklistId);
      }
    }
  );
});

// Atualizar checklist e associações
router.put('/:id', async (req, res) => {
  console.log('[CHECKLISTS ROUTER] Entrou na rota PUT /:id');
  let { titulo, descricao, tipo, equipe_ids } = req.body;
  console.log('[PUT /checklists/:id] INICIANDO');
  console.log('[PUT /checklists/:id] req.body:', req.body);
  console.log('[PUT /checklists/:id] id recebido:', req.params.id);
  console.log('[PUT /checklists/:id] equipe_ids recebido:', equipe_ids);
  if (Array.isArray(equipe_ids)) {
    equipe_ids = equipe_ids.map(id => Number(id));
  }
  try {
    console.log('[PUT /checklists/:id] Antes do UPDATE checklist');
    await new Promise((resolve, reject) => {
      db.query(
        'UPDATE checklist SET titulo = ?, descricao = ?, tipo = ? WHERE id = ?',
        [titulo, descricao, tipo, req.params.id],
        err => {
          if (err) {
            console.error('[PUT /checklists/:id] ERRO SQL UPDATE checklist:', err);
            return reject(err);
          }
          console.log(`[PUT /checklists/:id] checklist atualizado id=${req.params.id}`);
          resolve();
        }
      );
    });
    console.log('[PUT /checklists/:id] Depois do UPDATE checklist');

    console.log('[PUT /checklists/:id] Antes do DELETE checklist_equipes');
    await new Promise((resolve, reject) => {
      db.query('DELETE FROM checklist_equipes WHERE checklist_id = ?', [req.params.id], delErr => {
        if (delErr) {
          console.error(`[PUT /checklists/:id] ERRO DELETE checklist_equipes:`, delErr);
          // Não retorna erro, apenas loga
        } else {
          console.log(`[PUT /checklists/:id] checklist_equipes deletadas id=${req.params.id}`);
        }
        resolve();
      });
    });
    console.log('[PUT /checklists/:id] Depois do DELETE checklist_equipes');

    if (Array.isArray(equipe_ids) && equipe_ids.length) {
      console.log('[PUT /checklists/:id] Antes do INSERT checklist_equipes');
      for (const equipeId of equipe_ids) {
        await new Promise((resolve, reject) => {
          db.query(
            'INSERT INTO checklist_equipes (checklist_id, equipe_id) VALUES (?, ?)',
            [req.params.id, equipeId],
            (err2) => {
              if (err2) {
                console.error(`[PUT /checklists/:id] ERRO INSERT checklist_equipes: checklistId=${req.params.id}, equipeId=${equipeId}`, err2);
                return reject(err2);
              } else {
                console.log(`[PUT /checklists/:id] checklist_equipes inserida: checklistId=${req.params.id}, equipeId=${equipeId}`);
                resolve();
              }
            }
          );
        });
      }
      console.log(`[PUT /checklists/:id] checklist_equipes inseridas com sucesso id=${req.params.id}`);
    } else {
      console.log(`[PUT /checklists/:id] Nenhuma equipe associada enviada id=${req.params.id}`);
    }
    console.log('[PUT /checklists/:id] Antes do res.json');
    res.json({ id: parseInt(req.params.id) });
    console.log(`[PUT /checklists/:id] FINALIZADO com sucesso id=${req.params.id}`);
  } catch (err2) {
    console.error('[PUT /checklists/:id] ERRO geral:', err2);
    res.status(500).json({ error: err2 });
    console.log(`[PUT /checklists/:id] FINALIZADO com erro id=${req.params.id}`);
  }
});

// Deletar checklist e suas associações
router.delete('/:id', (req, res) => {
  db.query('DELETE FROM checklist WHERE id = ?', [req.params.id], err => {
    if (err) return res.status(500).json({ error: err });
    res.json({ success: true });
  });
});

module.exports = router;
