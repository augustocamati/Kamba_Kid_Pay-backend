// controllers/videoController.js
const { ConteudoAssistido } = require("../../src/models/VideoAssistido");
const ProgressoMissao = require("../../src/models/ProgressoMissao");
const missaoService = require("../../src/services/missaoService");
const Conteudo = require("../../src/models/VideoAssistido")

exports.assistirVideo = async (req, res) => {
    try {
        const { id_crianca, id_missao } = req.body;

        // Primeiro, precisamos saber qual CONTEÚDO está associado a esta MISSÃO
        
        const conteudo = await Conteudo.findOne({
            where: { id_missao: id_missao }
        });

        if (!conteudo) {
            return res.status(404).json({ 
                erro: "Nenhum conteúdo encontrado para esta missão" 
            });
        }

        // Verificar se já assistiu (agora usando id_conteudo)
        const jaAssistiu = await ConteudoAssistido.findOne({
            where: { 
                id_crianca: id_crianca, 
                id_conteudo: conteudo.id_conteudo  // ← Mudei aqui!
            }
        });

        if (jaAssistiu) {
            return res.json({ 
                mensagem: "Você já assistiu este vídeo",
                ja_assistido: true 
            });
        }

        // Verificar se já tem progresso na missão
        let progresso = await ProgressoMissao.findOne({
            where: { id_crianca, id_missao }
        });

        if (!progresso) {
            progresso = await ProgressoMissao.create({
                id_crianca,
                id_missao,
                estado: 'em_progresso',
                data_inicio: new Date()
            });
        }

        // Registrar que assistiu 
        await ConteudoAssistido.create({
            id_crianca,
            id_conteudo: conteudo.id_conteudo 
        });

        // FINALIZAR MISSÃO via service
        const resultado = await missaoService.finalizarMissao(
            id_crianca, 
            id_missao
        );

        res.json({
            mensagem: "Vídeo assistido com sucesso!",
            xp_ganho: resultado.xp_ganho,
            ...resultado
        });

    } catch (error) {
        console.error("Erro no assistirVideo:", error);
        res.status(500).json({ erro: error.message });
    }
};

exports.videosAssistidos = async (req, res) => {
    try {
        const { id_crianca } = req.params;

        const videos = await ConteudoAssistido.findAll({
            where: { id_crianca },
            include: [{
                model: require("../../src/models/VideoAssistido").Conteudo,
                as: 'conteudo'
            }]
        });

        res.json({
            total: videos.length,
            videos
        });

    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
};