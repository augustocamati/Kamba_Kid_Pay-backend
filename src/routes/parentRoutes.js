// routes/parentRoutes.js
const express = require("express");
const router = express.Router();
const parentController = require("../controllers/parentController");
const { authMiddleware, requireParent } = require("../middlewares/auth");

// Todas as rotas de responsável exigem autenticação e permissão
router.use(authMiddleware, requireParent);

router.get("/dashboard", parentController.dashboard);
router.get("/children", parentController.listChildren);
router.post("/children", parentController.addChild);
router.get("/children/:childId/stats", parentController.childStats);
router.post("/children/:childId/add-balance", parentController.addBalance);
router.patch("/children/:childId", parentController.updateChild);
router.patch("/children/:childId/potes-config", parentController.updatePotesConfig);
router.get("/children/:childId/finance", parentController.childFinance);
//novas com filtras
// Estatísticas com período
router.get("/children/:childId/statsperiodo", parentController.childStatsWithPeriod);
// Transações filtradas
router.get("/children/:childId/transacoes", parentController.getTransacoes);
// Resumo mensal
router.get("/children/:childId/resumo-mensal", parentController.resumoMensal);
// Evolução de saldo
router.get("/children/:childId/evolucao-saldo", parentController.evolucaoSaldo);

module.exports = router;