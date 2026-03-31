const express = require("express")
const router = express.Router()

const cofreController = require("../controllers/cofreController")

router.post("/criar",cofreController.criarMeta)

router.get("/crianca/:id_crianca",cofreController.verMetas)

router.post("/depositar",cofreController.depositar)

module.exports = router