const express = require("express")
const router = express.Router()
const { upload } = require("../middlewares/upload");
const tarefaController = require("../controllers/tarefasController")


router.post("/criar", tarefaController.criarTarefa)

// enviar foto da tarefa
router.post( "/comprovacao", upload.single("foto"), tarefaController.enviarComprovacao)

router.patch("/aprovar/:id_tarefa", tarefaController.aprovarTarefa)

router.patch("/rejeitar/:id_tarefa", tarefaController.rejeitarTarefa)

router.get("/crianca/:id_crianca", tarefaController.listarTarefasCrianca)

module.exports = router
