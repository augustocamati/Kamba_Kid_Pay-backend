const express = require("express");
const router = express.Router();
const VideoController = require("../controllers/videoController");

router.post("/assistir", VideoController.assistirVideo);
router.get("/assistidos/:id_crianca", VideoController.videosAssistidos);

module.exports = router;