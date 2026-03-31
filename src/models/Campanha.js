const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const Campanhas = sequelize.define("campanhas", {
    id_campanha: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    nome: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    descricao: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    imagem_url: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    meta_valor: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    valor_arrecadado: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    date_inicio: {
        type: DataTypes.DATE,
        allowNull: false
    },
    date_fim: {
        type: DataTypes.DATE,
        allowNull: false
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    organizacao: {
        type: DataTypes.STRING,
        allowNull: true
    },
    causa: {
        type: DataTypes.ENUM('educacao', 'saude', 'ambiente', 'alimentacao', 'outro'),
        defaultValue: 'outro'
    }
}, {
    tableName: "campanhas",
    timestamps: false
});

module.exports = Campanhas