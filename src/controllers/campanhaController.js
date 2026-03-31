// controllers/campanhaController.js
const { Op } = require("sequelize");
const Campanha = require("../models/Campanha");

// POST /api/campaigns
exports.createCampaign = async (req, res) => {
    try {
        const { titulo, descricao, meta_valor, organizacao, causa, imagem_url } = req.body;

        if (!titulo || !descricao || !meta_valor) {
            return res.status(400).json({ 
                erro: "CAMPOS_OBRIGATORIOS", 
                mensagem: "Preencha todos os campos obrigatórios." 
            });
        }

        const novaCampanha = await Campanha.create({
            nome: titulo,
            descricao,
            meta_valor: parseFloat(meta_valor),
            valor_arrecadado: 0,
            organizacao: organizacao || "Kamba Kid Pay",
            causa: causa || "outro",
            imagem_url: imagem_url || (req.file ? `/uploadCampanhas/${req.file.filename}` : null),
            date_inicio: new Date(),
            date_fim: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
            status: true
        });

        res.status(201).json({
            id: novaCampanha.id_campanha,
            titulo: novaCampanha.nome,
            descricao: novaCampanha.descricao,
            meta_valor: parseFloat(novaCampanha.meta_valor),
            valor_arrecadado: parseFloat(novaCampanha.valor_arrecadado),
            imagem_url: novaCampanha.imagem_url,
            ativa: novaCampanha.status,
            organizacao: novaCampanha.organizacao,
            causa: novaCampanha.causa,
            criado_em: novaCampanha.createdAt
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: "ERRO_INTERNO", mensagem: error.message });
    }
};

// GET /api/campaigns
exports.listCampaigns = async (req, res) => {
    try {
        const { ativa } = req.query;

        const where = {};
        if (ativa !== undefined) where.status = ativa === 'true';
        if (ativa === 'true') {
            where.date_fim = { [Op.gte]: new Date() };
        }

        const campanhas = await Campanha.findAll({ where });

        res.json({
            campanhas: campanhas.map(c => ({
                id: c.id_campanha,
                titulo: c.nome,
                descricao: c.descricao,
                meta_valor: parseFloat(c.meta_valor),
                valor_arrecadado: parseFloat(c.valor_arrecadado),
                imagem_url: c.imagem_url,
                ativa: c.status,
                organizacao: c.organizacao,
                causa: c.causa,
                criado_em: c.createdAt
            }))
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: "ERRO_INTERNO", mensagem: error.message });
    }
};