const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const CriancaShopItem = sequelize.define("crianca_shop_item", {
    id: {
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
    id_item: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'shop_items',
            key: 'id_item'
        }
    },
    adquirido_em: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: "crianca_shop_item",
    timestamps: false
});

module.exports = CriancaShopItem;