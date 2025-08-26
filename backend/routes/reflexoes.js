const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const { S3Client } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const path = require('path');
const fs = require('fs');
const upload = multer({ storage: multer.memoryStorage() });

function getEquipeIdsFromBody(body) {
  let equipe_id = body['equipe_id[]'] || body.equipe_id;
  if (Array.isArray(equipe_id)) return equipe_id;
  if (typeof equipe_id === 'string' && equipe_id.length > 0) return [equipe_id];
  return [];
}

// GET /reflexoes - lista todas
router.get('/', (req, res) => {
  const sqlQuery = `
    SELECT r.id, r.texto, r.usuario_id, r.anexo, r.data, r.agenda_id, a.titulo as agenda_nome, a.data as agenda_data, u.nome as usuario_nome
    FROM reflexao r
    JOIN usuario u ON r.usuario_id = u.id
    LEFT JOIN agenda a ON r.agenda_id = a.id
    ORDER BY r.data DESC
  `;
  db.query(sqlQuery, [], (err, results) => {
    if (err) return res.status(500).json({ error: err.message || err });
    res.json(results);
  });
});

// GET /reflexoes/:id - detalhe
router.get('/:id', (req, res) => {
  const reflexaoId = req.params.id;
  db.query(
    `SELECT r.id, r.texto, r.usuario_id, r.anexo, r.data, r.agenda_id, u.nome as usuario_nome, a.titulo as agenda_nome, a.data as agenda_data
     FROM reflexao r
     JOIN usuario u ON r.usuario_id = u.id
     LEFT JOIN agenda a ON r.agenda_id = a.id
     WHERE r.id = $1`,
    [reflexaoId],
    (err, results) => {
      if (err) return res.status(500).json({ error: err });
      if (results.length === 0) return res.status(404).json({ error: 'Reflexão não encontrada' });
      const reflexao = results[0];
      db.query(
        `SELECT e.id, e.nome FROM reflexao_equipe re JOIN equipe e ON re.equipe_id = e.id WHERE re.reflexao_id = $1`,
        [reflexaoId],
        (err2, equipes) => {
          if (err2) return res.status(500).json({ error: err2 });
          reflexao.equipes = equipes;
          reflexao.equipe_id = equipes.map(e => e.id);
          res.json(reflexao);
        }
      );
    }
  );
});

// POST /reflexoes - cria reflexão
router.post('/', upload.single('anexo'), (req, res) => {
  const { texto, usuario_id, agenda_id } = req.body;
  const equipe_id = getEquipeIdsFromBody(req.body);
  const agendaIdInt = agenda_id ? Number(agenda_id) : null;
  function inserirReflexao(url) {
    db.query(
      url
        ? 'INSERT INTO reflexao (texto, usuario_id, agenda_id, anexo) VALUES ($1, $2, $3, $4) RETURNING id'
        : 'INSERT INTO reflexao (texto, usuario_id, agenda_id) VALUES ($1, $2, $3) RETURNING id',
      url
        ? [texto, usuario_id, agendaIdInt, url]
        : [texto, usuario_id, agendaIdInt],
      (err, result) => {
        if (err) return res.status(500).json({ error: err });
        const reflexaoId = result[0].id;
        if (!equipe_id || equipe_id.length === 0) return res.status(201).json({ id: reflexaoId, texto, usuario_id, agenda_id: agendaIdInt, equipe_id: [], anexo: url });
        const insertPromises = equipe_id.map(equipeId =>
          new Promise((resolve, reject) => {
            db.query(
              'INSERT INTO reflexao_equipe (reflexao_id, equipe_id) VALUES ($1, $2)',
              [reflexaoId, equipeId],
              (err2) => err2 ? reject(err2) : resolve()
            );
          })
        );
        Promise.all(insertPromises)
          .then(() => res.status(201).json({ id: reflexaoId, texto, usuario_id, agenda_id: agendaIdInt, equipe_id, anexo: url }))
          .catch(err2 => res.status(500).json({ error: err2 }));
      }
    );
  }
  if (req.file) {
    try {
      const s3Client = new S3Client({
        region: process.env.AWS_REGION || 'us-east-2',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
      });
      const fileName = Date.now() + '-' + req.file.originalname;
      const uploadParams = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: fileName,
        Body: req.file.buffer,
        ContentType: req.file.mimetype
      };
      const upload = new Upload({ client: s3Client, params: uploadParams });
      upload.done().then(data => {
        inserirReflexao(data.Location);
      }).catch(err => {
        res.status(500).json({ error: 'Erro ao enviar anexo para S3', details: err });
      });
    } catch (err) {
      res.status(500).json({ error: 'Erro ao preparar upload para S3', details: err });
    }
  } else {
    inserirReflexao(null);
  }
});

// PUT /reflexoes/:id - edita reflexão
router.put('/:id', upload.single('anexo'), (req, res) => {
  const { texto, usuario_id, agenda_id } = req.body;
  const equipe_id = getEquipeIdsFromBody(req.body);
  const agendaIdInt = agenda_id ? Number(agenda_id) : null;
  const anexoUrl = req.file ? req.file.location : null;
  const updateQuery = anexoUrl
    ? 'UPDATE reflexao SET texto=$1, usuario_id=$2, agenda_id=$3, anexo=$4 WHERE id=$5'
    : 'UPDATE reflexao SET texto=$1, usuario_id=$2, agenda_id=$3 WHERE id=$4';
  const updateParams = anexoUrl
    ? [texto, usuario_id, agendaIdInt, anexoUrl, req.params.id]
    : [texto, usuario_id, agendaIdInt, req.params.id];
  db.query(updateQuery, updateParams, (err) => {
    if (err) return res.status(500).json({ error: err });
    db.query('DELETE FROM reflexao_equipe WHERE reflexao_id = $1', [req.params.id], (err2) => {
      if (err2) return res.status(500).json({ error: err2 });
      if (!equipe_id || equipe_id.length === 0) return res.json({ id: req.params.id, texto, usuario_id, agenda_id: agendaIdInt, equipe_id: [], anexo: anexoUrl });
      const insertPromises = equipe_id.map(equipeId =>
        new Promise((resolve, reject) => {
          db.query(
            'INSERT INTO reflexao_equipe (reflexao_id, equipe_id) VALUES ($1, $2)',
            [req.params.id, equipeId],
            (err3) => err3 ? reject(err3) : resolve()
          );
        })
      );
      Promise.all(insertPromises)
        .then(() => res.json({ id: req.params.id, texto, usuario_id, agenda_id: agendaIdInt, equipe_id, anexo: anexoUrl }))
        .catch(err3 => res.status(500).json({ error: err3 }));
    });
  });
});

// DELETE /

module.exports = router;