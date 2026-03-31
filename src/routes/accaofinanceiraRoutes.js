// routes/financeiroRoutes.js
const express = require("express");
const router = express.Router();
const financeiroController = require("../controllers/accaofinanceiraController");
const { authMiddleware, requireParent } = require("../middlewares/auth");

router.use(authMiddleware);

// Rotas que podem ser acessadas por responsável e criança (com validações internas)
router.post("/poupar", financeiroController.poupar);
router.post("/gastar", financeiroController.gastar);
router.post("/doar", financeiroController.doar);
router.post("/bonus", requireParent, financeiroController.bonusPoupanca);

module.exports = router;