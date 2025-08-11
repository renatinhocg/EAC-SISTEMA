require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// CORS
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// APENAS ROTAS DA API
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'API TEST FUNCIONANDO!', 
    version: 'TEST-2025-08-11',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'ROTA DE TESTE FUNCIONANDO!',
    data: [1, 2, 3, 4, 5]
  });
});

// NENHUM ARQUIVO ESTÁTICO - APENAS APIS

const PORT = process.env.PORT || 3001;
console.log('🧪 SERVIDOR DE TESTE INICIANDO NA PORTA', PORT);
app.listen(PORT, () => {
  console.log(`🧪 SERVIDOR DE TESTE RODANDO NA PORTA ${PORT}`);
});
