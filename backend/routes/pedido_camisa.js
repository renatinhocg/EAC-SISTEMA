const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '../uploads/camisas');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

router.post('/', upload.single('comprovante'), async (req, res) => {
  // Autenticação obrigatória
  authenticateToken(req, res, async () => {
    const { nome, nome_adolescente, telefone, email, cor, tamanho, quantidade } = req.body;
    const usuario_id = req.user?.id;
    if (!usuario_id || !nome || !nome_adolescente || !telefone || !email || !cor || !tamanho || !quantidade || !req.file) {
      return res.status(400).json({ error: 'Dados obrigatórios faltando ou usuário não autenticado.' });
    }
    // Salvar no banco de dados
    const db = require('../db');
    try {
      // Verifica se o usuario existe
      const userResult = await db.query('SELECT id FROM usuario WHERE id = $1', [usuario_id]);
      const userExists = Array.isArray(userResult) ? userResult.length > 0 : userResult.rows?.length > 0;
      if (!userExists) {
        return res.status(400).json({ error: 'Usuário não existe.' });
      }
      await db.query(
        'INSERT INTO pedidos_camisa (usuario_id, nome, nome_adolescente, telefone, email, cor, tamanho, quantidade, comprovante) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
        [usuario_id, nome, nome_adolescente, telefone, email, cor, tamanho, quantidade, req.file.filename]
      );
      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ error: 'Erro ao salvar pedido.' });
    }
  });
});

module.exports = router;
