const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Historico = sequelize.define("historico_transacoes", {

    id_transacao: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },

    id_crianca: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    tipo: {
        type: DataTypes.ENUM(
            "tarefa",
            "gastar",
            "poupar",
            "doar",
            "bonus_gestao",
            "missao_conteudo",   // ADICIONAR
            "missao_quiz"         // ADICIONAR
        )
    },

    valor: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },

    descricao: {
        type: DataTypes.STRING
    }

}, {
    tableName: "historico_transacoes",
    timestamps: true
})

module.exports = Historico