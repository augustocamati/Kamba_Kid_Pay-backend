// routes/campanhaRoutes.js
const express = require("express");
const router = express.Router();
const campanhaController = require("../controllers/campanhaController");
const { authMiddleware } = require("../middlewares/auth");
const {upload} = require("../middlewares/upload");

// Listar campanhas é público (ou pode ser protegido)
router.get("/", campanhaController.listCampaigns);

// Criar campanha requer autenticação (responsável)
router.post("/", authMiddleware, upload.single("foto"), campanhaController.createCampaign);

module.exports = router;