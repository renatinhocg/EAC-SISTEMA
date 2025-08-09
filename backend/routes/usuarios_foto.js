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
  console.log('📷 POST /:id/foto - ID:', req.params.id);
  console.log('📷 Arquivo recebido:', req.file);
  
  if (!req.file) {
    console.log('❌ Nenhum arquivo recebido');
    return res.status(400).json({ error: 'Arquivo não recebido' });
  }
  
  const filename = req.file.filename;
  const relativePath = path.posix.join('uploads', 'usuarios', filename);
  
  console.log('📷 Atualizando usuário ID:', req.params.id, 'com foto:', relativePath);
  
  db.query('UPDATE usuario SET foto = $1 WHERE id = $2', [relativePath, req.params.id], (err, result) => {
    if (err) {
      console.error('❌ Erro ao atualizar foto:', err);
      return res.status(500).json({ error: err.message || err });
    }
    
    console.log('✅ Foto atualizada com sucesso');
    res.json({ caminho: relativePath, message: 'Foto atualizada com sucesso' });
  });
});

module.exports = router;
