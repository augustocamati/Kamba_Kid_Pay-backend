// routes/tarefasRoutes.js
const express = require("express");
const router = express.Router();
const tarefasController = require("../controllers/tarefasController");
const { authMiddleware, requireParent } = require("../middlewares/auth");
const {upload} = require("../middlewares/upload");

router.use(authMiddleware, requireParent);

router.post("/", tarefasController.createTask);
router.get("/", tarefasController.listTasks);
router.patch("/:taskId/approve", tarefasController.approveTask);
router.patch("/:taskId/reject", tarefasController.rejectTask);

module.exports = router;