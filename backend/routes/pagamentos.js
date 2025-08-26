const express = require('express');
const router = express.Router();
const db = require('../db');
const authenticateToken = require('../middleware/authenticateToken');
const multer = require('multer');
const { S3Client } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const path = require('path');

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

// POST /api/pagamentos - Recebe comprovante (arquivo) e salva no banco
router.post('/', authenticateToken, upload.single('comprovante'), (req, res) => {
		(async () => {
			const { usuario_id, valor } = req.body;
			if (!usuario_id || !req.file) {
				console.error('[PAGAMENTO] Dados obrigatórios ausentes:', { usuario_id, file: req.file });
				return res.status(400).json({ error: 'Dados obrigatórios ausentes' });
			}

			const isCamisa = req.body.tipo === 'camisa' || req.body.camisa_id;
			const pasta = isCamisa ? 'comprovantes/camisa/' : 'comprovantes/';
			const fileName = pasta + Date.now() + '-' + req.file.originalname;

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
						const comprovanteUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
						console.log('[PAGAMENTO] Iniciando insert:', { usuario_id, valor, comprovanteUrl });
								const query = `INSERT INTO pagamento (usuario_id, valor, comprovante, status, data_envio, created_at, updated_at)
									VALUES (?, ?, ?, ?, NOW(), NOW(), NOW()) RETURNING *`;
								db.query(query, [usuario_id, valor, comprovanteUrl, 'aguardando aprovação'], (err, result) => {
									if (err) {
										console.error('[PAGAMENTO] Erro ao salvar pagamento:', err);
										return res.status(500).json({ error: 'Erro ao salvar pagamento' });
									}
									res.json({ comprovante: comprovanteUrl, pagamento: {...result[0], status: 'aguardando aprovação'}, message: 'Comprovante enviado com sucesso' });
								});
					} catch (err) {
						console.error('Erro ao enviar para S3:', err);
						return res.status(500).json({ error: 'Erro ao enviar comprovante para S3', details: err.message });
					}
		})();
});

// PUT /api/pagamentos/usuario/:id/aprovar - Aprova pagamento do usuário
router.put('/usuario/:id/aprovar', authenticateToken, (req, res) => {
	const usuarioId = req.params.id;
	if (!usuarioId) {
		return res.status(400).json({ error: 'ID do usuário não informado' });
	}
	// Verificação de permissão: apenas admin pode aprovar
	if (!req.user || req.user.tipo_usuario !== 'admin') {
		console.log('[PAGAMENTO] Usuário sem permissão para aprovar:', req.user);
		return res.status(403).json({ error: 'Apenas administradores podem aprovar pagamentos.' });
	}
	const query = `UPDATE pagamento SET status = 'aprovado', data_aprovacao = NOW(), updated_at = NOW() WHERE usuario_id = ? RETURNING *`;
	db.query(query, [usuarioId], (err, result) => {
		if (err) {
			console.error('[PAGAMENTO] Erro ao aprovar pagamento:', err);
			return res.status(500).json({ error: 'Erro ao aprovar pagamento' });
		}
		// Sempre retorna sucesso, mesmo que o array esteja vazio
		console.log('[PAGAMENTO] Pagamento(s) aprovado(s):', result);
		return res.status(200).json({ pagamento: result && result.length ? result[0] : { usuario_id: usuarioId, status: 'aprovado' } });
	});
});

module.exports = router;
