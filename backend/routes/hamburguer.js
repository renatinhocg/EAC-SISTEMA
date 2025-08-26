
const express = require('express');
const router = express.Router();
const db = require('../db');
const authenticateToken = require('../middleware/authenticateToken');

// Rota para buscar reservas do usuário logado
router.get('/minhas', authenticateToken, async (req, res) => {
  try {
  const userId = req.user.id;
  console.log('[HAMBURGUER /minhas] userId recebido:', userId);
    // Buscar soma das reservas por tipo
    db.query(
      'SELECT tipo, SUM(quantidade) as total FROM hamburguer WHERE usuario_id = ? GROUP BY tipo',
      [userId],
      (err, result) => {
        if (err) {
          return res.status(500).json({ error: 'Erro ao buscar reservas.' });
        }
        const rows = result.rows || result;
        console.log('[HAMBURGUER /minhas] Resultado da query:', rows);
        // Monta objeto de resposta
        const resposta = { hamburguer: 0, trio: 0 };
        rows.forEach(r => {
          if (r.tipo === 'hamburguer') resposta.hamburguer = Number(r.total);
          if (r.tipo === 'trio') resposta.trio = Number(r.total);
        });
        console.log('[HAMBURGUER /minhas] Resposta enviada:', resposta);
        res.json(resposta);
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Erro interno.' });
  }
});

// POST /hamburguer/reservar
router.post('/reservar', authenticateToken, (req, res) => {
  const { hamburguer, trio } = req.body;
  const usuario_id = req.user.id;

  if ((hamburguer ?? 0) === 0 && (trio ?? 0) === 0) {
    return res.status(400).json({ error: 'Selecione ao menos uma opção e quantidade!' });
  }

  // Função auxiliar para inserir reserva
  function inserirReserva(tipo, quantidade, cb) {
    db.query(
      'INSERT INTO hamburguer (usuario_id, tipo, quantidade) VALUES (?, ?, ?)',
      [usuario_id, tipo, quantidade],
      cb
    );
  }

  let inseridos = 0;
  let erro = null;

  function finalizar() {
    if (erro) {
      console.error('Erro ao salvar reserva:', erro);
      return res.status(500).json({ error: 'Erro ao salvar reserva.' });
    }
    return res.json({ success: true });
  }

  // Executa as inserções conforme quantidade
  if (hamburguer > 0 && trio > 0) {
    inserirReserva('hamburguer', hamburguer, (err) => {
      if (err) erro = err;
      inseridos++;
      if (inseridos === 2) finalizar();
    });
    inserirReserva('trio', trio, (err) => {
      if (err) erro = err;
      inseridos++;
      if (inseridos === 2) finalizar();
    });
  } else if (hamburguer > 0) {
    inserirReserva('hamburguer', hamburguer, (err) => {
      if (err) erro = err;
      finalizar();
    });
  } else if (trio > 0) {
    inserirReserva('trio', trio, (err) => {
      if (err) erro = err;
      finalizar();
    });
  }
});

module.exports = router;
