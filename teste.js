// debug.js
const sequelize = require("./src/config/database");
const models = {
    Responsavel: require("./src/models/Responsavel"),
    Criancas: require("./src/models/Criancas"),
    Campanhas: require("./src/models/Campanha"),
    Doacoes: require("./src/models/Doacoes"),
    ProgressoMissao: require("./src/models/ProgressoMissao"),
    Quiz: require("./src/models/Quiz"),
    Missao: require("./src/models/Missoes"),
    QuizOpcao: require("./src/models/QuizOpcao"),
    RespostaUsuario: require("./src/models/RespostaUsuario"),
    VideoAssistido: require("./src/models/VideoAssistido"),
    Tarefa: require("./src/models/Tarefa"),
    CofreMeta: require("./src/models/CofreMeta"),
    Mascote: require("./src/models/Mascote"),
    CriancaMascote: require("./src/models/CriancaMascote"),
    Historico: require("./src/models/HistoricoTransacao")
};

console.log("🔍 VERIFICANDO MODELOS:\n");
Object.keys(models).forEach(key => {
    try {
        const isModel = models[key].prototype instanceof sequelize.Sequelize.Model;
        console.log(`${key}: ${isModel ? '✅ OK' : '❌ PROBLEMA'}`);
        if (!isModel) {
            console.log('   -> Tipo:', typeof models[key]);
            console.log('   -> Conteúdo:', models[key]);
        }
    } catch (e) {
        console.log(`${key}: ❌ ERRO -`, e.message);
    }
});