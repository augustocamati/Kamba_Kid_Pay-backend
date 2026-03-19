// routes/quizRoutes.js
const express = require("express");
const router = express.Router();
const QuizController = require("../controllers/QuizController");

router.get("/:id_missao", QuizController.buscarQuiz);
router.post("/responder", QuizController.responderQuiz);
router.get("/progresso/:id_crianca/:id_quiz", QuizController.progressoQuiz);

module.exports = router;