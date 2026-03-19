// routes/missoesRoutes.js
const express = require("express");
const router = express.Router();
const MissoesController = require("../controllers/MissoesController");

// Consulta
router.get("/ativas/:id_crianca", MissoesController.missoesDisponiveis);

// CRUD (só responsável)
router.post("/criar", MissoesController.criarMissao);

// Fluxo
router.post("/iniciar", MissoesController.iniciarMissao);


router.get("/tarefas/:id_responsavel", MissoesController.missoesTarefa);

module.exports = router;