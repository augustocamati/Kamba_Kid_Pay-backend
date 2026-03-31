// routes/missoesRoutes.js
const express = require("express");
const router = express.Router();
const missoesController = require("../controllers/MissoesController");
const { authMiddleware, requireParent } = require("../middlewares/auth");

router.use(authMiddleware, requireParent);

router.post("/", missoesController.createMission);
router.get("/", missoesController.listMissions);
router.patch("/:missionId/progress", missoesController.updateProgress);

module.exports = router;