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

// Listar reflexões com equipes agrupadas - VERSÃO TOTALMENTE NOVA
router.get('/', (req, res) => {
  console.log('[GET /reflexoes] INICIANDO');
  
  const sqlQuery = `
    SELECT 
      r.id, 
      r.texto, 
      r.usuario_id, 
      r.anexo, 
      r.data,
      r.agenda_id,
      a.titulo as agenda_nome,
      u.nome as usuario_nome,
      COALESCE(STRING_AGG(e.nome, ', ' ORDER BY e.nome), '') as equipes_nomes,
      COALESCE(STRING_AGG(e.id::text, ',' ORDER BY e.nome), '') as equipes_ids
    FROM reflexao r
    JOIN usuario u ON r.usuario_id = u.id
        LEFT JOIN agenda a ON r.agenda_id = a.id
    LEFT JOIN reflexao_equipe re ON r.id = re.reflexao_id
    LEFT JOIN equipe e ON re.equipe_id = e.id
    GROUP BY r.id, r.texto, r.usuario_id, r.anexo, r.data, r.agenda_id, a.titulo, u.nome 
    ORDER BY r.data DESC
  `;
  
  console.log('[GET /reflexoes] Executando query:', sqlQuery);
  
  db.query(sqlQuery, [], (err, results) => {
    if (err) {
      console.error('[GET /reflexoes] ERRO na query:', err);
      return res.status(500).json({ error: err.message || err });
    }
    console.log('[GET /reflexoes] Query executada com sucesso, resultados:', results.length);
    res.json(results);
    console.log('[GET /reflexoes] FINALIZADO');
  });
});

// Buscar por ID (agora retorna equipes vinculadas)
router.get('/:id', (req, res) => {
  console.log(`[GET /reflexoes/:id] INICIANDO id=`, req.params.id);
  const reflexaoId = req.params.id;
  // Busca a reflexão principal
  db.query(
    `SELECT r.id, r.texto, r.usuario_id, r.anexo, r.data, r.agenda_id, u.nome as usuario_nome
     FROM reflexao r
     JOIN usuario u ON r.usuario_id = u.id
     WHERE r.id = $1`,
    [reflexaoId],
    (err, results) => {
      if (err) {
        console.error(`[GET /reflexoes/:id] ERRO SQL:`, err);
        return res.status(500).json({ error: err });
      }
      if (results.length === 0) {
        console.warn(`[GET /reflexoes/:id] Reflexão não encontrada para id:`, reflexaoId);
        return res.status(404).json({ error: 'Reflexão não encontrada' });
      }
      const reflexao = results[0];
      db.query(
        `SELECT e.id, e.nome FROM reflexao_equipe re JOIN equipe e ON re.equipe_id = e.id WHERE re.reflexao_id = $1`,
        [reflexaoId],
        (err2, equipes) => {
          if (err2) {
            console.error(`[GET /reflexoes/:id] ERRO SQL equipes:`, err2);
            return res.status(500).json({ error: err2 });
          }
          reflexao.equipes = equipes;
          reflexao.equipe_id = equipes.map(e => e.id);
          // Log para debug do retorno
          console.log('[GET /reflexoes/:id] Reflexao encontrada:', reflexao);
          res.json({
            id: reflexao.id,
            texto: reflexao.texto,
            usuario_id: reflexao.usuario_id,
            usuario_nome: reflexao.usuario_nome,
            anexo: reflexao.anexo,
            data: reflexao.data,
            agenda_id: reflexao.agenda_id || null,
            equipes: reflexao.equipes,
            equipe_id: reflexao.equipe_id
          });
          console.log(`[GET /reflexoes/:id] FINALIZADO id=`, reflexaoId);
        }
      );
    }
  );
});

// Criar nova reflexão com upload de anexo e múltiplas equipes
router.post('/', upload.single('anexo'), (req, res) => {
  console.log('[POST /reflexoes] INICIANDO');
  console.log('[POST /reflexoes] req.body:', req.body);
  const { texto, usuario_id, agenda_id } = req.body;
  const equipe_id = getEquipeIdsFromBody(req.body);
  const anexoPath = req.file ? path.posix.join('uploads','reflexoes', req.file.filename) : null;
  const agendaIdInt = agenda_id ? Number(agenda_id) : null;
  db.query(
    anexoPath
      ? 'INSERT INTO reflexao (texto, usuario_id, agenda_id, anexo) VALUES ($1, $2, $3, $4) RETURNING id'
      : 'INSERT INTO reflexao (texto, usuario_id, agenda_id) VALUES ($1, $2, $3) RETURNING id',
    anexoPath
      ? [texto, usuario_id, agendaIdInt, anexoPath]
      : [texto, usuario_id, agendaIdInt],
    (err, result) => {
      if (err) {
        console.error('[POST /reflexoes] ERRO SQL INSERT reflexao:', err);
        return res.status(500).json({ error: err });
      }
      const reflexaoId = result[0].id;
      console.log('[POST /reflexoes] reflexaoId criado:', reflexaoId);
      if (equipe_id.length === 0) {
        console.log('[POST /reflexoes] Nenhuma equipe associada enviada id=', reflexaoId);
        return res.status(201).json({ id: reflexaoId, texto, usuario_id, agenda_id: agendaIdInt, equipe_id: [], anexo: anexoPath });
      }
      console.log('[POST /reflexoes] equipe_id recebidos:', equipe_id);
      const insertPromises = equipe_id.map(equipeId => 
        new Promise((resolve, reject) => {
          db.query(
            'INSERT INTO reflexao_equipe (reflexao_id, equipe_id) VALUES ($1, $2)',
            [reflexaoId, equipeId],
            (err2) => {
              if (err2) {
                console.error(`[POST /reflexoes] ERRO INSERT reflexao_equipe: reflexaoId=${reflexaoId}, equipeId=${equipeId}`, err2);
                reject(err2);
              } else {
                console.log(`[POST /reflexoes] reflexao_equipe inserida: reflexaoId=${reflexaoId}, equipeId=${equipeId}`);
                resolve();
              }
            }
          );
        })
      );
      Promise.all(insertPromises)
        .then(() => {
          console.log('[POST /reflexoes] reflexao_equipe inseridas com sucesso id=', reflexaoId);
          res.status(201).json({ id: reflexaoId, texto, usuario_id, agenda_id: agendaIdInt, equipe_id, anexo: anexoPath });
          console.log('[POST /reflexoes] FINALIZADO com sucesso id=', reflexaoId);
        })
        .catch(err2 => {
          console.error('[POST /reflexoes] ERRO Promise.all reflexao_equipe:', err2);
          res.status(500).json({ error: err2 });
          console.log('[POST /reflexoes] FINALIZADO com erro id=', reflexaoId);
        });
    }
  );
});

// Editar reflexão e atualizar equipes
router.put('/:id', upload.single('anexo'), (req, res) => {
  console.log('[PUT /reflexoes/:id] INICIANDO');
  console.log('[PUT /reflexoes/:id] req.body:', req.body);
  const { texto, usuario_id, agenda_id } = req.body;
  const equipe_id = getEquipeIdsFromBody(req.body);
  const agendaIdInt = agenda_id ? Number(agenda_id) : null;
  const anexoPath = req.file ? path.posix.join('uploads','reflexoes', req.file.filename) : null;
  console.log('[PUT /reflexoes/:id] id recebido:', req.params.id);
  console.log('[PUT /reflexoes/:id] equipe_id recebido:', equipe_id);
  db.query(
    anexoPath
      ? 'UPDATE reflexao SET texto=$1, usuario_id=$2, agenda_id=$3, anexo=$4 WHERE id=$5'
      : 'UPDATE reflexao SET texto=$1, usuario_id=$2, agenda_id=$3 WHERE id=$4',
    anexoPath
      ? [texto, usuario_id, agendaIdInt, anexoPath, req.params.id]
      : [texto, usuario_id, agendaIdInt, req.params.id],
    err => {
      if (err) {
        console.error('[PUT /reflexoes/:id] ERRO SQL UPDATE reflexao:', err);
        return res.status(500).json({ error: err });
      }
      console.log(`[PUT /reflexoes/:id] reflexao atualizada id=${req.params.id}`);
      db.query('DELETE FROM reflexao_equipe WHERE reflexao_id = $1', [req.params.id], err2 => {
        if (err2) {
          console.error(`[PUT /reflexoes/:id] ERRO DELETE reflexao_equipe:`, err2);
          return res.status(500).json({ error: err2 });
        }
        console.log(`[PUT /reflexoes/:id] reflexao_equipe deletadas id=${req.params.id}`);
        if (equipe_id.length === 0) {
          console.log(`[PUT /reflexoes/:id] Nenhuma equipe associada enviada id=${req.params.id}`);
          res.json({ id: req.params.id, texto, usuario_id, agenda_id: agendaIdInt, equipe_id: [], anexo: anexoPath });
          console.log(`[PUT /reflexoes/:id] FINALIZADO sem equipes id=${req.params.id}`);
          return;
        }
        const insertPromises = equipe_id.map(equipeId => 
          new Promise((resolve, reject) => {
            db.query(
              'INSERT INTO reflexao_equipe (reflexao_id, equipe_id) VALUES ($1, $2)',
              [req.params.id, equipeId],
              (err3) => {
                if (err3) {
                  console.error(`[PUT /reflexoes/:id] ERRO INSERT reflexao_equipe: reflexaoId=${req.params.id}, equipeId=${equipeId}`, err3);
                  reject(err3);
                } else {
                  console.log(`[PUT /reflexoes/:id] reflexao_equipe inserida: reflexaoId=${req.params.id}, equipeId=${equipeId}`);
                  resolve();
                }
              }
            );
          })
        );
        Promise.all(insertPromises)
          .then(() => {
            console.log(`[PUT /reflexoes/:id] reflexao_equipe inseridas com sucesso id=${req.params.id}`);
            res.json({ id: req.params.id, texto, usuario_id, agenda_id: agendaIdInt, equipe_id, anexo: anexoPath });
            console.log(`[PUT /reflexoes/:id] FINALIZADO com sucesso id=${req.params.id}`);
          })
          .catch(err3 => {
            console.error('[PUT /reflexoes/:id] ERRO Promise.all reflexao_equipe:', err3);
            res.status(500).json({ error: err3 });
            console.log(`[PUT /reflexoes/:id] FINALIZADO com erro id=${req.params.id}`);
          });
      });
    }
  );
});

// Deletar reflexão
router.delete('/:id', (req, res) => {
  console.log('[DELETE /reflexoes/:id] INICIANDO id=', req.params.id);
  db.query('DELETE FROM reflexao WHERE id = $1', [req.params.id], err => {
    if (err) return res.status(500).json({ error: err });
    res.json({ success: true });
  });
});

module.exports = router;
