const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Servir arquivos estáticos do build
app.use(express.static(path.join(__dirname, 'dist')));

// Proxy para backend Railway
app.use('/api', createProxyMiddleware({
  target: 'https://eac-backend-production.up.railway.app', // URL do backend Railway
  changeOrigin: true,
  pathRewrite: { '^/api': '/api' },
}));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
