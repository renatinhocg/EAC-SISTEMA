const express = require('express');
const router = express.Router();

const db = require('../db');
const webpush = require('web-push');
const pushConfig = require('../pushConfig');

webpush.setVapidDetails(
	pushConfig.VAPID_SUBJECT,
	pushConfig.VAPID_PUBLIC_KEY,
	pushConfig.VAPID_PRIVATE_KEY
);

// Endpoint para retornar a chave pública VAPID
router.get('/vapid-public-key', (req, res) => {
	res.json({ publicKey: pushConfig.VAPID_PUBLIC_KEY });
});

// Exemplo de endpoint para registrar push subscription
router.post('/subscribe', (req, res) => {
	// Aqui você pode salvar a subscription no banco ou enviar push
	console.log('Push subscription recebida:', req.body);
	res.status(201).json({ message: 'Subscription registrada com sucesso!' });
});



router.post('/send-notification', (req, res) => {
	// Aceita tanto titulo/mensagem quanto title/body
	const titulo = req.body.titulo || req.body.title;
	const mensagem = req.body.mensagem || req.body.body;
	const url = req.body.url;
	const equipe_id = req.body.equipe_id;
	const usuario_id = req.body.usuario_id;
	console.log('[PUSH] Recebendo push notification:', req.body);
	// Salvar na tabela notificacao
	const sql = `INSERT INTO notificacao (titulo, descricao, para_todos, equipe_id, status) VALUES (?, ?, ?, ?, ?)`;
	const params = [
		titulo,
		mensagem,
		!usuario_id, // para_todos = true se não tem usuario_id
		equipe_id || null,
		'push'
	];
	db.query(sql, params, (err, result) => {
		if (err) {
			console.error('[PUSH] Erro ao salvar notificacao:', err);
			return res.status(500).json({ error: 'Erro ao salvar notificacao' });
		}
		// Buscar subscriptions
		let subSql = 'SELECT * FROM push_subscriptions';
		let subParams = [];
		if (usuario_id) {
			subSql += ' WHERE usuario_id = ?';
			subParams = [usuario_id];
		} else if (equipe_id) {
			subSql += ' WHERE equipe_id = ?';
			subParams = [equipe_id];
		}
		db.query(subSql, subParams, async (subErr, subs) => {
			if (subErr) {
				console.error('[PUSH] Erro ao buscar subscriptions:', subErr);
				return res.status(500).json({ error: 'Erro ao buscar subscriptions' });
			}
			if (!subs.length) {
				console.warn('[PUSH] Nenhuma subscription encontrada');
				return res.status(201).json({ message: 'Push salva, mas nenhuma subscription encontrada.' });
			}
			// Enviar push para cada subscription
			const payload = JSON.stringify({
				title: titulo,
				body: mensagem,
				url: url || '',
				equipe_id,
				usuario_id
			});
			let enviados = 0;
					for (const sub of subs) {
						let erro = null;
						try {
							const subscription = JSON.parse(sub.subscription_json);
							await webpush.sendNotification(subscription, payload);
							enviados++;
						} catch (sendErr) {
							erro = sendErr.message || JSON.stringify(sendErr);
							console.error('[PUSH] Erro ao enviar push:', sendErr);
						}
								// Salvar histórico do envio na tabela v2
																const histSql = `INSERT INTO pushs_enviados_v2 (titulo, mensagem, data_envio) VALUES (?, ?, CURRENT_DATE)`;
																const histParams = [
																	titulo,
																	mensagem
																];
								console.log('[PUSH] Salvando histórico v2:', { histSql, histParams });
								db.query(histSql, histParams, (histErr) => {
									if (histErr) {
										console.error('[PUSH] Erro ao salvar pushs_enviados_v2:', histErr);
									}
								});
					}
					res.status(201).json({ message: `Push salva e enviada para ${enviados} dispositivos.` });
		});
	});
});
module.exports = router;
