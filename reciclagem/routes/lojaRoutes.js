const express = require("express")
const router = express.Router()

const lojaController = require("../controllers/lojaController")

router.get("/mascotes",lojaController.listarMascotes)

router.post("/comprar",lojaController.comprarMascote)

router.get("/crianca/:id_crianca",lojaController.mascotesCrianca)

module.exports = router