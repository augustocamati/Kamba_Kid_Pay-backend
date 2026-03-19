// models/Missoes.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Missao = sequelize.define("missao", {
    id_missao: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    titulo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    descricao: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    tipo_missao: {
        type: DataTypes.ENUM('quiz', 'conteudo', 'tarefa_casa', 'acao_financeira'),
        allowNull: false
    },
    xp_recompensa: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    recompensa_financeira: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    id_responsavel: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Responsavel',
            key: 'id_responsavel'
        }
    },
    nivel_minimo: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    ativa: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: "missao",
    timestamps: false
});

module.exports = Missao;