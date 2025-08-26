const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

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
  const { nome, nome_adolescente, telefone, email, cor, tamanho, quantidade } = req.body;
  if (!nome || !nome_adolescente || !telefone || !email || !cor || !tamanho || !quantidade || !req.file) {
    return res.status(400).json({ error: 'Dados obrigatórios faltando.' });
  }
  // Salvar no banco de dados
  const db = require('../db');
  try {
    await db.query(
      'INSERT INTO pedidos_camisa (nome, nome_adolescente, telefone, email, cor, tamanho, quantidade, comprovante) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [nome, nome_adolescente, telefone, email, cor, tamanho, quantidade, req.file.filename]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao salvar pedido.' });
  }
});

module.exports = router;
