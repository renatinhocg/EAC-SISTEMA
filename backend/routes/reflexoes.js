const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuração de storage para anexo de reflexões
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/reflexoes/';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Função utilitária para normalizar array de equipes
function getEquipeIdsFromBody(body) {
  let equipe_id = body['equipe_id[]'] || body.equipe_id;
  if (Array.isArray(equipe_id)) return equipe_id;
  if (typeof equipe_id === 'string' && equipe_id.length > 0) return [equipe_id];
  return [];
}

// Listar reflexões com equipes agrupadas
router.get('/', (req, res) => {
  const { agenda_id } = req.query;
  let sql = `
    SELECT r.*, u.nome as usuario_nome, a.titulo as agenda_titulo,
      COALESCE(STRING_AGG(e.nome, ', ' ORDER BY e.nome), '') as equipes_nomes,
      COALESCE(STRING_AGG(e.id::text, ',' ORDER BY e.nome), '') as equipes_ids
    FROM reflexao r
    JOIN usuario u ON r.usuario_id = u.id
    LEFT JOIN agenda a ON r.agenda_id = a.id
    LEFT JOIN reflexao_equipe re ON r.id = re.reflexao_id
    LEFT JOIN equipe e ON re.equipe_id = e.id
  `;
  const params = [];
  const conditions = [];
  if (agenda_id) {
    conditions.push('r.agenda_id = $1'); params.push(agenda_id);
  }
  if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
  sql += ' GROUP BY r.id, u.nome, a.titulo ORDER BY r.data DESC';
  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('Erro ao listar reflexões:', err);
      return res.status(500).json({ error: err });
    }
    res.json(results);
  });
});

// Buscar por ID (agora retorna equipes vinculadas)
router.get('/:id', (req, res) => {
  const reflexaoId = req.params.id;
  // Busca a reflexão principal
  db.query(
    `SELECT r.*, u.nome as usuario_nome, a.titulo as agenda_titulo
     FROM reflexao r
     JOIN usuario u ON r.usuario_id = u.id
     LEFT JOIN agenda a ON r.agenda_id = a.id
     WHERE r.id = ?`,
    [reflexaoId],
    (err, results) => {
      if (err) return res.status(500).json({ error: err });
      if (results.length === 0) return res.status(404).json({ error: 'Reflexão não encontrada' });
      const reflexao = results[0];
      // Busca equipes vinculadas
      db.query(
        `SELECT e.id, e.nome FROM reflexao_equipe re JOIN equipe e ON re.equipe_id = e.id WHERE re.reflexao_id = ?`,
        [reflexaoId],
        (err2, equipes) => {
          if (err2) return res.status(500).json({ error: err2 });
          reflexao.equipes = equipes;
          reflexao.equipe_id = equipes.map(e => e.id); // para o form
          res.json(reflexao);
        }
      );
    }
  );
});

// Criar nova reflexão com upload de anexo e múltiplas equipes
router.post('/', upload.single('anexo'), (req, res) => {
  const { texto, usuario_id, agenda_id } = req.body;
  const equipe_id = getEquipeIdsFromBody(req.body);
  const anexoPath = req.file ? path.posix.join('uploads','reflexoes', req.file.filename) : null;
  db.query(
    'INSERT INTO reflexao (texto, usuario_id, agenda_id, anexo) VALUES (?,?,?,?) RETURNING id',
    [texto, usuario_id, agenda_id || null, anexoPath],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      const reflexaoId = result[0].id; // wrapper simula formato MySQL
      if (equipe_id.length === 0) {
        return res.status(201).json({ id: reflexaoId, texto, usuario_id, agenda_id, equipe_id: [], anexo: anexoPath });
      }
      const insertPromises = equipe_id.map(equipeId => 
        new Promise((resolve, reject) => {
          db.query(
            'INSERT INTO reflexao_equipe (reflexao_id, equipe_id) VALUES (?, ?)',
            [reflexaoId, equipeId],
            (err2) => {
              if (err2) reject(err2);
              else resolve();
            }
          );
        })
      );
      Promise.all(insertPromises)
        .then(() => res.status(201).json({ id: reflexaoId, texto, usuario_id, agenda_id, equipe_id, anexo: anexoPath }))
        .catch(err2 => res.status(500).json({ error: err2 }));
    }
  );
});

// Editar reflexão e atualizar equipes
router.put('/:id', upload.single('anexo'), (req, res) => {
  const { texto, usuario_id, agenda_id } = req.body;
  const equipe_id = getEquipeIdsFromBody(req.body);
  const anexoPath = req.file ? path.posix.join('uploads','reflexoes', req.file.filename) : null;
  db.query(
    anexoPath
      ? 'UPDATE reflexao SET texto=?, usuario_id=?, agenda_id=?, anexo=? WHERE id=?'
      : 'UPDATE reflexao SET texto=?, usuario_id=?, agenda_id=? WHERE id=?',
    anexoPath
      ? [texto, usuario_id, agenda_id || null, anexoPath, req.params.id]
      : [texto, usuario_id, agenda_id || null, req.params.id],
    err => {
      if (err) return res.status(500).json({ error: err });
      db.query('DELETE FROM reflexao_equipe WHERE reflexao_id = ?', [req.params.id], err2 => {
        if (err2) return res.status(500).json({ error: err2 });
        if (equipe_id.length === 0) return res.json({ id: req.params.id, texto, usuario_id, agenda_id, equipe_id: [], anexo: anexoPath });
        const values = equipe_id.map(eid => [req.params.id, eid]);
        db.query('INSERT INTO reflexao_equipe (reflexao_id, equipe_id) VALUES ?', [values], err3 => {
          if (err3) return res.status(500).json({ error: err3 });
          res.json({ id: req.params.id, texto, usuario_id, agenda_id, equipe_id, anexo: anexoPath });
        });
      });
    }
  );
});

// Deletar reflexão
router.delete('/:id', (req, res) => {
  db.query('DELETE FROM reflexao WHERE id = ?', [req.params.id], err => {
    if (err) return res.status(500).json({ error: err });
    res.json({ success: true });
  });
});

module.exports = router;
