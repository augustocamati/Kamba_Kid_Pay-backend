// server.js
require("dotenv").config();
const app = require("./src/app");
const sequelize = require("./src/config/database");

// Importar models e associations - AGORA É index.js, NÃO Associations.js!
require("./src/models/Associations");  // ← Mudei aqui!

sequelize.sync({ alter: true })
    .then(() => {
        console.log("✅ Banco sincronizado");
        app.listen(process.env.PORT || 3000, () => {
            console.log(`🚀 Servidor rodando em http://localhost:${process.env.PORT || 3000}`);
        });
    })
    .catch(err => {
        console.error("❌ Erro ao sincronizar banco:", err);
    });