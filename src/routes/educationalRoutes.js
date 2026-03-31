// routes/educationalRoutes.js
const express = require("express");
const router = express.Router();
const educationalController = require("../controllers/educationalController");
const { authMiddleware, requireChild } = require("../middlewares/auth");

router.use(authMiddleware, requireChild);

router.get("/content", educationalController.listContent);
router.patch("/content/:contentId/complete", educationalController.completeContent);

module.exports = router;