const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');
const { S3Client } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-2',
  endpoint: 'https://s3.us-east-2.amazonaws.com',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});
const storage = multer.memoryStorage();
const upload = multer({ storage });
// ...existing code...

// GET /camisas - listar todos os pedidos de camisa
router.get('/', (req, res) => {
  const sql = `
    SELECT c.*, u.nome as usuario_nome, e.nome as equipe_nome, e.id as equipe_id
    FROM camisa c
    LEFT JOIN usuario u ON c.usuario_id = u.id
    LEFT JOIN equipe e ON u.equipe_id = e.id
    ORDER BY c.id DESC
  `;
  db.query(sql, [], (err, rows) => {
    if (err) {
      console.error('Erro ao buscar pedidos de camisa:', err);
      return res.status(500).json({ error: 'Erro ao buscar pedidos de camisa.' });
    }
    rows.forEach(r => {
      console.log(`Pedido: id=${r.id}, usuario_id=${r.usuario_id}, usuario_nome=${r.usuario_nome}, equipe_nome=${r.equipe_nome}`);
    });
    res.json(rows);
  });
});

// GET /camisas/estatisticas - estatísticas dos pedidos de camisa
router.get('/estatisticas', async (req, res) => {
  try {
    db.query('SELECT status, COUNT(*) as total FROM camisa GROUP BY status', [], (err, statusRows) => {
      if (err) {
        console.error('Erro ao buscar estatísticas de camisa:', err);
        return res.status(500).json({ error: 'Erro ao buscar estatísticas.' });
      }
      db.query('SELECT COUNT(*) as total FROM camisa', [], (err2, totalRows) => {
        if (err2) {
          console.error('Erro ao buscar total de camisas:', err2);
          return res.status(500).json({ error: 'Erro ao buscar estatísticas.' });
        }
        let aprovados = 0, pendentes = 0, aguardando_aprovacao = 0, rejeitados = 0;
        (statusRows || []).forEach(r => {
          if (r.status === 'aprovado') aprovados = parseInt(r.total);
          else if (r.status === 'pendente') pendentes = parseInt(r.total);
          else if (r.status === 'aguardando_aprovacao') aguardando_aprovacao = parseInt(r.total);
          else if (r.status === 'rejeitado') rejeitados = parseInt(r.total);
        });
        const total = totalRows[0]?.total || 0;
        const percentual_entregues = total > 0 ? ((aprovados / total) * 100).toFixed(1) : 0;
        res.json({
          total: parseInt(total),
          aprovados,
          pendentes,
          aguardando_aprovacao,
          rejeitados,
          percentual_entregues
        });
      });
    });
  } catch (err) {
    console.error('Erro ao buscar estatísticas de camisa:', err);
    res.status(500).json({ error: 'Erro ao buscar estatísticas.' });
  }
});

// PUT /camisas/usuario/:id/aprovar - aprovar pedido de camisa
router.put('/usuario/:id/aprovar', async (req, res) => {
  const usuarioId = req.params.id;
  try {
    db.query('UPDATE camisa SET status = $1 WHERE usuario_id = $2 RETURNING *', ['aprovado', usuarioId], (err, rows) => {
      if (err) {
        console.error('Erro ao aprovar pedido de camisa:', err);
        return res.status(500).json({ error: 'Erro ao aprovar pedido.' });
      }
      res.json({ success: true, pedido: rows[0] });
    });
  } catch (err) {
    console.error('Erro ao aprovar pedido de camisa:', err);
    res.status(500).json({ error: 'Erro ao aprovar pedido.' });
  }
});

// PUT /camisas/usuario/:id/rejeitar - rejeitar pedido de camisa
router.put('/usuario/:id/rejeitar', async (req, res) => {
  const usuarioId = req.params.id;
  const { observacoes } = req.body;
  try {
    db.query('UPDATE camisa SET status = $1 WHERE usuario_id = $2 RETURNING *', ['rejeitado', usuarioId], (err, rows) => {
      if (err) {
        console.error('Erro ao rejeitar pedido de camisa:', err);
        return res.status(500).json({ error: 'Erro ao rejeitar pedido.' });
      }
      res.json({ success: true, pedido: rows[0] });
    });
  } catch (err) {
    console.error('Erro ao rejeitar pedido de camisa:', err);
    res.status(500).json({ error: 'Erro ao rejeitar pedido.' });
  }
});

// Removido duplicidade das importações

// GET /camisa - listar todos os pedidos de camisa
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM camisa ORDER BY id DESC');
    console.log('🔍 Resultado SELECT camisa:', result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao buscar pedidos de camisa:', err);
    res.status(500).json({ error: 'Erro ao buscar pedidos de camisa.' });
  }
});

// Configuração do upload de comprovante
// Upload de comprovante direto no S3
// Upload de comprovante direto no S3
// (mantido apenas uma vez no topo do arquivo)

// POST /camisas - registrar pedido de camisa
router.post('/', upload.single('comprovante'), async (req, res) => {
  try {
    const { usuario_id, tamanhos } = req.body;
    console.log('[CAMISA] Dados recebidos:', { usuario_id, tamanhos, file: req.file });
    if (!usuario_id || !req.file) {
      console.error('[CAMISA] Falta usuario_id ou arquivo:', { usuario_id, file: req.file });
      return res.status(400).json({ error: 'Dados obrigatórios ausentes.' });
    }
    const fileName = 'comprovantes/camisa/' + Date.now() + '-' + req.file.originalname;
    try {
      const uploader = new Upload({
        client: s3Client,
        params: {
          Bucket: process.env.AWS_S3_BUCKET,
          Key: fileName,
          Body: req.file.buffer,
          ContentType: req.file.mimetype
        }
      });
      await uploader.done();
      console.log('[CAMISA] Upload S3 concluído:', fileName);
    } catch (s3Err) {
      console.error('[CAMISA] Erro no upload S3:', s3Err);
      return res.status(500).json({ error: 'Erro ao enviar comprovante para S3', details: s3Err.message });
    }
    const comprovanteUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    const query = `INSERT INTO camisa (usuario_id, tamanhos, comprovante, status, data_pedido, dt_envio_comprovante)
      VALUES (?, ?, ?, ?, NOW(), NOW()) RETURNING *`;
    db.query(query, [usuario_id, tamanhos, comprovanteUrl, 'aguardando_aprovacao'], (err, result) => {
      if (err) {
        console.error('[CAMISA] Erro ao salvar pedido:', err);
        return res.status(500).json({ error: 'Erro ao salvar pedido de camisa.' });
      }
      res.json({ comprovante: comprovanteUrl, pedido: result[0], message: 'Pedido enviado com sucesso!' });
    });
  } catch (err) {
    console.error('[CAMISA] Erro geral ao enviar comprovante:', err);
    return res.status(500).json({ error: 'Erro ao enviar comprovante para S3', details: err.message });
  }
});

module.exports = router;
