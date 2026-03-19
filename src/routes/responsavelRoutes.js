const express = require("express");
const router = express.Router();
const responsavelController = require("../controllers/responsavelController");

router.post("/cadastrar", responsavelController.cadastrarResponsavel);

module.exports = router;