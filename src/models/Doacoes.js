const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const Doacoes = sequelize.define("doacoes", {
    id_doacao: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    id_crianca: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    id_campanha: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    valor: {
        type: DataTypes.DECIMAL(10,2),
        allowNull: false
    }
}, {
    tableName: "doacoes",
    timestamps: true,
    createdAt: "data_hora",
    updatedAt: false
})
module.exports = Doacoes