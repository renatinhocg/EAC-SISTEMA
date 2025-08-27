const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const Crianca = sequelize.define('Crianca', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  usuario_id: { type: DataTypes.INTEGER, allowNull: false },
  equipe_id: { type: DataTypes.INTEGER, allowNull: false },
  telefone: { type: DataTypes.STRING },
  nome: { type: DataTypes.STRING, allowNull: false },
  idade: { type: DataTypes.STRING },
  alergiaAlimentar: { type: DataTypes.BOOLEAN },
  alergiaAlimentarDesc: { type: DataTypes.STRING },
  alergiaMedic: { type: DataTypes.BOOLEAN },
  alergiaMedicDesc: { type: DataTypes.STRING },
  alergiaContato: { type: DataTypes.BOOLEAN },
  alergiaContatoDesc: { type: DataTypes.STRING },
  restricaoAlimentar: { type: DataTypes.STRING },
  assinatura: { type: DataTypes.STRING }
}, {
  tableName: 'crianca',
  timestamps: true
});

module.exports = Crianca;
