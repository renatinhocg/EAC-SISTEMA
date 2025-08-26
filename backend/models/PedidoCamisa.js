const { DataTypes } = require('mysql');

// Modelo para pedidos de camisa
const PedidoCamisa = {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nome: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false },
  telefone: { type: DataTypes.STRING, allowNull: false },
  tamanho: { type: DataTypes.STRING, allowNull: false },
  quantidade: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: 'pendente' },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
};

module.exports = PedidoCamisa;
