const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../db');
const fs = require('fs');

// Configuração do multer para upload de fotos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = 'uploads/usuarios/';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Upload de foto do usuário
router.post('/:id/foto', upload.single('foto'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Arquivo não recebido' });
  // Usa path.posix para garantir barras '/' no path relativo
  const filename = req.file.filename;
  const relativePath = path.posix.join('uploads', 'usuarios', filename);
  db.query('UPDATE usuario SET foto = ? WHERE id = ?', [relativePath, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ caminho: relativePath });
  });
});

module.exports = router;
