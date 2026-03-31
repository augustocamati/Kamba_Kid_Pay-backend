// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authMiddleware } = require("../middlewares/auth");

// Rotas públicas
router.post("/login", authController.login);
router.post("/register", authController.register);
router.post("/logout", authController.logout);

// Rota protegida
router.get("/me", authMiddleware, authController.me);

module.exports = router;