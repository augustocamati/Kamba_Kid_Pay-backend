// models/VideoAssistido.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

// Modelo de Conteúdo (vídeo educativo)
const Conteudo = sequelize.define("conteudo", {
    id_conteudo: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    titulo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    tipo: {
        type: DataTypes.ENUM('video', 'artigo', 'infografico'),
        defaultValue: 'video'
    },
    url: {
        type: DataTypes.STRING,
        allowNull: false
    },
    xp_recompensa: {
        type: DataTypes.INTEGER,
        defaultValue: 5
    },
    id_missao: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'missao',
            key: 'id_missao'
        }
    }
}, {
    tableName: "conteudo",
    timestamps: false
});

// Modelo para registrar o que a criança assistiu
const ConteudoAssistido = sequelize.define("conteudo_assistido", {
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
    id_conteudo: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'conteudo',
            key: 'id_conteudo'
        }
    }
}, {
    tableName: "conteudo_assistido",
    timestamps: true
});

// ⚠️ IMPORTANTE: Definir as associations AQUI mesmo
Conteudo.hasMany(ConteudoAssistido, { foreignKey: "id_conteudo" });
ConteudoAssistido.belongsTo(Conteudo, { foreignKey: "id_conteudo" });

// Exportar ambos
module.exports = {
    Conteudo,
    ConteudoAssistido
};