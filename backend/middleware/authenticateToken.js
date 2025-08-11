// Middleware para autenticação JWT
const jwt = require('jsonwebtoken');
require('dotenv').config();

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  console.log('🔐 AUTH - Header:', authHeader ? 'Presente' : 'Ausente');
  console.log('🔐 AUTH - Token extraído:', token ? 'Presente' : 'Ausente');
  
  if (!token) return res.status(401).json({ error: 'Token não fornecido' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log('❌ AUTH - Erro na verificação:', err.message);
      return res.status(403).json({ error: 'Token inválido' });
    }
    console.log('✅ AUTH - Token válido para usuário:', user.id);
    req.user = user;
    next();
  });
}

module.exports = authenticateToken;
