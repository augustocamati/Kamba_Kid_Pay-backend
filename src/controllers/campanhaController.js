const Campanhas = require("../models/Campanha")

exports.criarCampanha = async (req, res) => {
    try {
        const {
            nome,
            descricao,
            meta_valor,
            date_inicio,
            date_fim
        } = req.body

        const campanhaExistente = await Campanhas.findOne({ where: { nome } });
        if (campanhaExistente) {
            return res.status(400).json({ message: "Nome da Campanha já cadastrado" });
        }

        const nova = await Campanhas.create({
            nome,
            descricao,
            meta_valor,
            date_inicio,
            date_fim,
            imagem_url: req.file ? req.file.filename : null
        })
        res.json(nova)

    } catch (e) {
        res.status(400).json({ erro: e.message })
    }
}
exports.listarCampanhasAtivas = async (req, res) => {
    const hoje = new Date()
    const campanhas = await Campanhas.findAll({
        where: {
            status: true,
            date_fim: { [require("sequelize").Op.gte]: hoje }
        }
    })
    res.json(campanhas)
}