const express = require("express");
const router = express.Router();
const criancasController = require("../controllers/criancasController");

router.post("/cadastrar", criancasController.cadastrarCrianca);
router.get("/dashboard/:id", criancasController.getStudentDashboard)

module.exports = router;