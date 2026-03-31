// routes/relatoriosRoutes.js
const express = require("express");
const router = express.Router();
const relatoriosController = require("../controllers/relatoriosController");
const { authMiddleware, requireParent } = require("../middlewares/auth");

router.use(authMiddleware, requireParent);

router.get("/progress", relatoriosController.progressReport);

module.exports = router;