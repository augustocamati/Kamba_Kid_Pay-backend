const Mascote = require("../src/models/Mascote")
const CriancaMascote = require("../src/models/CriancaMascote")
const Crianca = require("../src/models/Criancas")

exports.listarMascotes = async (req, res) => {

    try {
        const mascotes = await Mascote.findAll()
        res.json(mascotes)
    } catch (e) {
        res.status(500).json({
            erro: "Erro buscar mascotes"
        })

    }

}

exports.comprarMascote = async (req, res) => {

    try {
        const { id_crianca, id_mascote } = req.body
        const mascote = await Mascote.findByPk(id_mascote)
        const crianca = await Crianca.findByPk(id_crianca)
        if (!mascote) {
            return res.status(404).json({
                erro: "Mascote não encontrado"
            })
        }

        if (crianca.xp < mascote.preco_xp) {
            return res.status(400).json({
                erro: "XP insuficiente"
            })
        }

        await Crianca.update({
            xp: crianca.xp - mascote.preco_xp
        }, {
            where: { id_crianca }
        })
        await CriancaMascote.create({
            id_crianca,
            id_mascote
        })

        res.json({
            mensagem: "Mascote comprado com sucesso"
        })

    } catch (e) {
        res.status(500).json({
            erro: "Erro comprar mascote"
        })
    }

}

exports.mascotesCrianca = async (req, res) => {
    try {
        const { id_crianca } = req.params
        const mascotes = await CriancaMascote.findAll({
            where: { id_crianca }
        })
        res.json(mascotes)
    } catch (e) {
        res.status(500).json({
            erro: "Erro buscar mascotes da criança"
        })
    }
}