const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Crianca = sequelize.define("crianca", {
  id_crianca: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nome_completo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  nome_usuario: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  senha: {
    type: DataTypes.STRING,
    allowNull: false
  },
  idade: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  saldo_gastar: {
    type: DataTypes.DECIMAL(10,2),
    defaultValue: 0.00
  },
  saldo_poupar: {
    type: DataTypes.DECIMAL(10,2),
    defaultValue: 0.00
  },
  saldo_ajudar: {
    type: DataTypes.DECIMAL(10,2),
    defaultValue: 0.00
  },
  xp: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  nivel: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  id_responsavel: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Responsavel', // Nome da tabela referenciada
      key: "id_responsavel"
    }
  }
}, {
  tableName: "crianca",
  timestamps: true
});

module.exports = Crianca;