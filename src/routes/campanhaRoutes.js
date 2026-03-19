const express = require("express")
const router = express.Router()
const { uploadCampanhas } = require("../middlewares/upload");
const campanhaController = require("../controllers/campanhaController")


router.post("/criar", uploadCampanhas.single("foto"),campanhaController.criarCampanha)

router.get("/ativas", campanhaController.listarCampanhasAtivas)

module.exports = router