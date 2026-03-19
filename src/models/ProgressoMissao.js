// models/ProgressoMissao.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ProgressoMissao = sequelize.define("progresso_missao", {
    id_progresso: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    id_crianca: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'crianca',
            key: 'id_crianca'
        }
    },
    id_missao: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'missao',
            key: 'id_missao'
        }
    },
    estado: {
        type: DataTypes.ENUM(
            "disponivel",
            "em_progresso",
            "aguardando_aprovacao",
            "concluida"
        ),
        defaultValue: "disponivel"
    },
    prova_imagem: {
        type: DataTypes.STRING,
        allowNull: true
    },
    data_inicio: {
        type: DataTypes.DATE,
        allowNull: true
    },
    data_conclusao: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: "progresso_missao",  // ← AQUI
    timestamps: true                 // ← AQUI
});

module.exports = ProgressoMissao;