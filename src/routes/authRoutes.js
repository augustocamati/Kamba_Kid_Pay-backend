const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Login responsavel
router.post("/responsavel/login", authController.loginResponsavel);

// Login criança
router.post("/crianca/login", authController.loginCrianca);

module.exports = router;
