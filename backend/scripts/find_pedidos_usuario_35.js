// Script para buscar pedidos de camisa feitos pelo usuario_id 35
require('dotenv').config();
const db = require('../db');

async function main() {
  try {
    const result = await db.query('SELECT * FROM pedidos_camisa WHERE usuario_id = $1', [35]);
    if (Array.isArray(result) && result.length > 0) {
      console.log('Pedidos encontrados para usuario_id 35:');
      result.forEach(pedido => {
        console.log(pedido);
      });
    } else if (result.rows && result.rows.length > 0) {
      console.log('Pedidos encontrados para usuario_id 35:');
      result.rows.forEach(pedido => {
        console.log(pedido);
      });
    } else {
      console.log('Nenhum pedido encontrado para usuario_id 35.');
    }
  } catch (err) {
    console.error('Erro ao buscar pedidos:', err);
  } finally {
    db.end && db.end();
  }
}

main();
