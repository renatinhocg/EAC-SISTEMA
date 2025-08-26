const express = require('express');
const router = express.Router();
const multer = require('multer');
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
const path = require('path');
const db = require('../db');
const fs = require('fs');

// Configuração do multer para upload de fotos (memória)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload de foto do usuário
router.post('/:id/foto', upload.single('foto'), (req, res) => {
  console.log('📷 POST /:id/foto - ID:', req.params.id);
  console.log('📷 Arquivo recebido (req.file):', req.file);
  console.log('--- LOG DIAGNÓSTICO S3 ---');
  console.log('process.env.AWS_REGION:', process.env.AWS_REGION);
  console.log('process.env.AWS_S3_BUCKET:', process.env.AWS_S3_BUCKET);
  console.log('process.env.AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID);
  console.log('process.env.AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? '***' : undefined);
  console.log('s3Client.config.region:', s3Client.config.region);
  console.log('s3Client.config.endpoint:', s3Client.config.endpoint);
  console.log('s3Client.config.credentials:', s3Client.config.credentials);
  console.log('Key:', 'usuarios/' + Date.now() + '-' + (req.file?.originalname || ''));
  console.log('--------------------------');
  if (!req.file || !req.file.buffer) {
    console.log('❌ Nenhum arquivo recebido ou sem buffer');
    return res.status(400).json({ error: 'Arquivo não recebido ou sem buffer' });
  }
  const fileName = 'usuarios/' + Date.now() + '-' + req.file.originalname;
  (async () => {
    try {
      const uploader = new Upload({
        client: s3Client,
        params: {
          Bucket: process.env.AWS_S3_BUCKET,
          Key: fileName,
          Body: req.file.buffer,
          ContentType: req.file.mimetype,
          region: 'us-east-2'
        }
      });
      await uploader.done();
      const s3Url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
      db.query('UPDATE usuario SET foto = $1 WHERE id = $2', [s3Url, req.params.id], (err, result) => {
        if (err) {
          console.error('❌ Erro ao atualizar foto:', err);
          return res.status(500).json({ error: err.message || err });
        }
        console.log('✅ Foto atualizada com sucesso no banco!');
        res.json({ foto: s3Url, message: 'Foto atualizada com sucesso' });
      });
    } catch (err) {
      console.error('❌ Erro ao enviar para S3:', err);
      return res.status(500).json({ error: 'Erro ao enviar foto para S3', details: err.message });
    }
  })();
});

module.exports = router;
