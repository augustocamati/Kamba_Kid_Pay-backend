const Quiz = require("../src/models/Quiz");
const QuizOpcao = require("../src/models/QuizOpcao");
const RespostaUsuario = require("../src/models/RespostaUsuario");
const Missao = require("../src/models/Missoes");
const missaoService = require("../src/services/missaoService");

//Buscar perguntas de um quiz

exports.buscarQuiz = async (req, res) => {
    try {
        const { id_missao } = req.params;

        const quiz = await Quiz.findAll({
            where: { id_missao },
            include: [{
                model: QuizOpcao,
                attributes: ['id_opcao', 'texto'] // NÃO enviar 'correta'
            }]
        });

        if (!quiz.length) {
            return res.status(404).json({ 
                erro: "Nenhuma pergunta encontrada para esta missão" 
            });
        }

        res.json({
            total_perguntas: quiz.length,
            perguntas: quiz
        });

    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
};

exports.responderQuiz = async (req, res) => {
    try {
        const { id_crianca, id_quiz, id_opcao } = req.body;

        // Validar opção
        const opcao = await QuizOpcao.findByPk(id_opcao);
        if (!opcao) {
            return res.status(404).json({ erro: "Opção não encontrada" });
        }

        const quiz = await Quiz.findByPk(id_quiz);
        if (!quiz) {
            return res.status(404).json({ erro: "Quiz não encontrado" });
        }

        // Registrar resposta
        await RespostaUsuario.create({
            id_crianca,
            id_quiz,
            id_opcao,
            correta: opcao.correta
        });

        // Verificar se já respondeu todas as perguntas
        const totalPerguntas = await QuizOpcao.count({
            where: { id_quiz }
        });

        const respostasDadas = await RespostaUsuario.count({
            where: { 
                id_crianca, 
                id_quiz 
            }
        });

        // Se respondeu todas, verificar se acertou todas
        if (respostasDadas === totalPerguntas) {
            const todasRespostas = await RespostaUsuario.findAll({
                where: { id_crianca, id_quiz }
            });

            const todasCorretas = todasRespostas.every(r => r.correta);

            if (todasCorretas) {
                // FINALIZAR MISSÃO via service
                const resultado = await missaoService.finalizarMissao(
                    id_crianca, 
                    quiz.id_missao
                );

                return res.json({
                    mensagem: "🎉 Parabéns! Você acertou todas as perguntas!",
                    quiz_concluido: true,
                    ...resultado
                });
            } else {
                return res.json({
                    mensagem: "Quiz finalizado. Algumas respostas estão erradas. Tente novamente!",
                    quiz_concluido: true,
                    todas_corretas: false
                });
            }
        }

        // Ainda não respondeu todas
        res.json({
            mensagem: "Resposta registrada!",
            respondidas: respostasDadas,
            total: totalPerguntas,
            continuar: true
        });

    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
};

exports.progressoQuiz = async (req, res) => {
    try {
        const { id_crianca, id_quiz } = req.params;

        const respostas = await RespostaUsuario.findAll({
            where: { id_crianca, id_quiz }
        });

        const totalPerguntas = await QuizOpcao.count({
            where: { id_quiz }
        });

        res.json({
            respondidas: respostas.length,
            total: totalPerguntas,
            porcentagem: Math.round((respostas.length / totalPerguntas) * 100)
        });

    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
};