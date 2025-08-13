const webpush = require('web-push');
const express = require('express');
const router = express.Router();

// Substitua pelas suas chaves VAPID reais depois!
const vapidKeys = webpush.generateVAPIDKeys();

// ...existing code...

// Endpoint para disparar push de teste para todos inscritos
router.post('/test', async (req, res) => {
  const payload = JSON.stringify({
    title: 'Push de Teste',
    body: 'Este é um push enviado para teste do sistema!',
    url: 'https://eac-app-production.up.railway.app/'
  });
  const results = await Promise.all(subscriptions.map(subObj =>
    webpush.sendNotification(subObj.subscription, payload).catch(err => err)
  ));
  res.json({ results });
});
webpush.setVapidDetails(
  'mailto:seu-email@dominio.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);


const db = require('../db');
// Estrutura: { subscription, usuario_id, equipe_id }
let subscriptions = [];

// Salva subscription com usuario_id e equipe_id
router.post('/subscribe', (req, res) => {
  const { subscription, usuario_id, equipe_id } = req.body;
  if (!subscription) return res.status(400).json({ error: 'Subscription obrigatória' });
  subscriptions.push({ subscription, usuario_id, equipe_id });
  res.status(201).json({ message: 'Inscrito com sucesso!' });
});

// Envia push para todos, equipe ou usuario
router.post('/send-notification', async (req, res) => {
  const { title, body, url, equipe_id, usuario_id } = req.body;
  const payload = JSON.stringify({ title, body, url });
  let filtered = subscriptions;
  if (usuario_id) {
    filtered = subscriptions.filter(s => s.usuario_id == usuario_id);
  } else if (equipe_id) {
    filtered = subscriptions.filter(s => s.equipe_id == equipe_id);
  }
  // Salvar notificação no banco com status 'push'
  db.query(
    'INSERT INTO notificacao (titulo, descricao, para_todos, equipe_id, status) VALUES (?,?,?,?,?)',
    [title, body, !equipe_id, equipe_id || null, 'push'],
    (err, result) => {
      // Não bloqueia envio do push se der erro no banco
    }
  );
  // Salvar envio na tabela pushs_enviados
  db.query(
    'INSERT INTO pushs_enviados (titulo, mensagem, url, equipe_id, usuario_id, enviado_por, status, erro, created_at) VALUES (?,?,?,?,?,?,?,?,now())',
    [title, body, url || null, equipe_id || null, usuario_id || null, null, 'enviado', null],
    (err, result) => {
      // Não bloqueia envio do push se der erro no banco
    }
  );
  const results = await Promise.all(filtered.map(subObj =>
    webpush.sendNotification(subObj.subscription, payload).catch(err => err)
  ));
  res.json({ results });
});

router.get('/vapid-public-key', (req, res) => {
  res.json({ publicKey: vapidKeys.publicKey });
});

module.exports = router;
