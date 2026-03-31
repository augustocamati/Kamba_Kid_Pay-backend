const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ShopItem = sequelize.define("shop_item", {
    id_item: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    nome: {
        type: DataTypes.STRING,
        allowNull: false
    },
    tipo: {
        type: DataTypes.ENUM('cabelo', 'roupa', 'acessorio'),
        allowNull: false
    },
    preco: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    nivel_necessario: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    imagem_url: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: "shop_items",
    timestamps: false
});

module.exports = ShopItem;