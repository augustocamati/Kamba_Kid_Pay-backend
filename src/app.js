const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();


// Middlewares
app.use(cors());
app.use(express.json());


// Pasta pública para uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use("/uploads2", express.static(path.join(__dirname, "../uploads2")));
app.use("/uploadsCampanhas", express.static(path.join(__dirname, "../uploadsCampanhas")));


// Rotas
const responsavelRoutes = require("./routes/responsavelRoutes");
const criancasRoutes = require("./routes/criancasRoutes");
const authRoutes = require("./routes/authRoutes");
const tarefasRoutes = require("./routes/tarefasRoutes");
const campanhaRoutes = require("./routes/campanhaRoutes");
const doacaoRoutes = require("./routes/doacaoRoutes");
const quizRoutes = require("./routes/quizRoutes");
const missoesRoutes = require("./routes/missoesRoutes");
const financeiroRoutes = require("./routes/accaofinanceiraRoutes");
const videoRoutes = require("./routes/videoRoutes");
const lojaRoutes = require("./routes/lojaRoutes");


// Rotas da API
app.use("/responsavel", responsavelRoutes);
app.use("/criancas", criancasRoutes);
app.use("/auth", authRoutes);
app.use("/tarefas", tarefasRoutes);
app.use("/campanhas", campanhaRoutes);
app.use("/doacoes", doacaoRoutes);
app.use("/missoes", missoesRoutes);
app.use("/quiz", quizRoutes);
app.use("/financeiro", financeiroRoutes);
app.use("/video", videoRoutes);
app.use("/loja", lojaRoutes);


// Middleware de erro (SEMPRE no final)
app.use((err, req, res, next) => {

  console.error(err.stack);

  res.status(err.status || 500).json({
    erro: err.message || "Erro interno do servidor"
  });

});

module.exports = app;