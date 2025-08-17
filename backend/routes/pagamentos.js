const express = require('express');
const router = express.Router();
const db = require('../db');
const authenticateToken = require('../middleware/authenticateToken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuração do multer para comprovantes
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		const uploadDir = path.join(__dirname, '../uploads/comprovantes/');
		if (!fs.existsSync(uploadDir)) {
			fs.mkdirSync(uploadDir, { recursive: true });
		}
		cb(null, uploadDir);
	},
	filename: (req, file, cb) => {
		const timestamp = Date.now();
		const ext = path.extname(file.originalname);
		cb(null, `${timestamp}${ext}`);
	}
});
const upload = multer({ storage });

// POST /api/pagamentos - Recebe comprovante (arquivo) e salva no banco
router.post('/', authenticateToken, upload.single('comprovante'), (req, res) => {
	try {
		const { usuario_id, valor } = req.body;
		if (!usuario_id || !req.file) {
			console.error('[PAGAMENTO] Dados obrigatórios ausentes:', { usuario_id, file: req.file });
			return res.status(400).json({ error: 'Dados obrigatórios ausentes' });
		}

		const comprovante = req.file.filename;
		console.log('[PAGAMENTO] Iniciando insert:', { usuario_id, valor, comprovante });

		const query = `INSERT INTO pagamento (usuario_id, valor, comprovante, status, data_envio, created_at, updated_at)
									 VALUES (?, ?, ?, ?, NOW(), NOW(), NOW()) RETURNING *`;
		const values = [usuario_id, valor || 25, comprovante, 'aguardando_aprovacao'];

		db.query(query, values, (err, result) => {
			if (err) {
				console.error('[PAGAMENTO] Erro no insert:', err);
				return res.status(500).json({ error: 'Erro ao salvar pagamento (DB)' });
			}
			if (!result || !result[0]) {
				console.error('[PAGAMENTO] Insert não retornou registro:', result);
				return res.status(500).json({ error: 'Erro ao salvar pagamento (sem retorno)' });
			}
			console.log('[PAGAMENTO] Insert realizado:', result[0]);
			return res.status(201).json({ pagamento: result[0] });
		});
	} catch (error) {
		console.error('[PAGAMENTO] Erro inesperado:', error);
		return res.status(500).json({ error: 'Erro ao salvar pagamento (geral)' });
	}
});

// PUT /api/pagamentos/usuario/:id/aprovar - Aprova pagamento do usuário
router.put('/usuario/:id/aprovar', authenticateToken, (req, res) => {
	const usuarioId = req.params.id;
	if (!usuarioId) {
		return res.status(400).json({ error: 'ID do usuário não informado' });
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
