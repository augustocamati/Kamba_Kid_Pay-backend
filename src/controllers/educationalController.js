// controllers/educationalController.js
const { Op } = require("sequelize");
const {Conteudo} = require("../models/VideoAssistido");
const {ConteudoAssistido} = require("../models/VideoAssistido");
const Criancas = require("../models/Criancas");
const sequelize = require("../config/database");

// GET /api/educational-content
exports.listContent = async (req, res) => {
    try {
        const criancaId = req.usuario.id;
        const { faixa_etaria } = req.query;

        const crianca = await Criancas.findByPk(criancaId);
        if (!crianca) {
            return res.status(404).json({ 
                erro: "CRIANCA_NAO_ENCONTRADA", 
                mensagem: "Criança não encontrada." 
            });
        }

        const idadeCrianca = crianca.idade;
        let faixaRecomendada = faixa_etaria;
        
        if (!faixaRecomendada) {
            if (idadeCrianca <= 8) faixaRecomendada = '6-8';
            else if (idadeCrianca <= 10) faixaRecomendada = '9-10';
            else faixaRecomendada = '11-12';
        }

        const conteudos = await Conteudo.findAll({
            where: {
                faixa_etaria: faixaRecomendada
            }
        });

        const conteudosAssistidos = await ConteudoAssistido.findAll({
            where: { id_crianca: criancaId },
            attributes: ['id_conteudo']
        });
        const idsAssistidos = conteudosAssistidos.map(c => c.id_conteudo);

        res.json({
            conteudos: conteudos.map(c => ({
                id: c.id_conteudo,
                titulo: c.titulo,
                descricao: c.descricao,
                tipo: c.tipo,
                faixa_etaria: c.faixa_etaria,
                thumbnail_url: c.thumbnail_url,
                duracao: c.duracao,
                topico: c.topico,
                completo: idsAssistidos.includes(c.id_conteudo)
            }))
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: "ERRO_INTERNO", mensagem: error.message });
    }
};

// PATCH /api/educational-content/:contentId/complete
exports.completeContent = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { contentId } = req.params;
        const criancaId = req.usuario.id;

        const conteudo = await Conteudo.findByPk(contentId, { transaction });
        if (!conteudo) {
            await transaction.rollback();
            return res.status(404).json({ 
                erro: "CONTEUDO_NAO_ENCONTRADO", 
                mensagem: "Conteúdo não encontrado." 
            });
        }

        // 🔥 VERIFICAR SE O CONTEÚDO É DA FAIXA ETÁRIA DA CRIANÇA
        const crianca = await Criancas.findByPk(criancaId, { transaction });
        let faixaCrianca;
        if (crianca.idade <= 8) faixaCrianca = '6-8';
        else if (crianca.idade <= 10) faixaCrianca = '9-10';
        else faixaCrianca = '11-12';

        if (conteudo.faixa_etaria !== faixaCrianca) {
            await transaction.rollback();
            return res.status(400).json({ 
                erro: "FAIXA_ETARIA_INVALIDA", 
                mensagem: `Este conteúdo é para a faixa etária ${conteudo.faixa_etaria}. A sua faixa é ${faixaCrianca}.`,
                sua_idade: crianca.idade,
                faixa_do_conteudo: conteudo.faixa_etaria
            });
        }

        // Verificar se já foi assistido
        const jaAssistiu = await ConteudoAssistido.findOne({
            where: { id_crianca: criancaId, id_conteudo: contentId },
            transaction
        });

        if (jaAssistiu) {
            await transaction.rollback();
            return res.status(400).json({ 
                erro: "CONTEUDO_JA_ASSISTIDO", 
                mensagem: "Você já completou este conteúdo." 
            });
        }

        // Registrar visualização
        await ConteudoAssistido.create({
            id_crianca: criancaId,
            id_conteudo: contentId
        }, { transaction });

        // 🔥 DAR XP
        const novoXP = crianca.xp + (conteudo.xp_recompensa || 10);
        const novoNivel = Math.floor(novoXP / 100) + 1;
        
        await crianca.update({
            xp: novoXP,
            nivel: novoNivel
        }, { transaction });

        await transaction.commit();

        res.json({
            mensagem: "Conteúdo marcado como concluído!",
            conteudo_id: contentId,
            xp_ganho: conteudo.xp_recompensa || 10,
            xp_total: novoXP,
            novo_nivel: novoNivel
        });

    } catch (error) {
        await transaction.rollback();
        console.error(error);
        res.status(500).json({ erro: "ERRO_INTERNO", mensagem: error.message });
    }
};