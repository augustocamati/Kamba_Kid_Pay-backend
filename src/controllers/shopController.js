// controllers/shopController.js
const ShopItem = require("../models/ShopItem");
const CriancaShopItem = require("../models/CriancaShopItem");
const Criancas = require("../models/Criancas");
const Historico = require("../models/HistoricoTransacao");
const sequelize = require("../config/database");

// GET /api/shop/items
exports.listItems = async (req, res) => {
    try {
        const criancaId = req.query.crianca_id || req.usuario.id;

        const crianca = await Criancas.findByPk(criancaId);
        if (!crianca) {
            return res.status(404).json({
                erro: "CRIANCA_NAO_ENCONTRADA",
                mensagem: "Criança não encontrada."
            });
        }

        const itensComprados = await CriancaShopItem.findAll({
            where: { id_crianca: criancaId },
            attributes: ['id_item']
        });
        const idsComprados = itensComprados.map(i => i.id_item);

        const itens = await ShopItem.findAll();

        res.json({
            itens: itens.map(item => ({
                id: item.id_item,
                nome: item.nome,
                tipo: item.tipo,
                preco: item.preco,
                nivel_necessario: item.nivel_necessario,
                desbloqueado: crianca.nivel >= item.nivel_necessario,
                imagem_url: item.imagem_url,
                ja_possui: idsComprados.includes(item.id_item)
            }))
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: "ERRO_INTERNO", mensagem: error.message });
    }
};

// POST /api/shop/purchase
exports.purchase = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { item_id, crianca_id } = req.body;

        // 🔥 VALIDAR SE A CRIANÇA DO TOKEN É A MESMA
        let criancaId = crianca_id;

        if (req.usuario.tipo === 'crianca') {
            // Criança só pode comprar para si mesma
            if (crianca_id && req.usuario.id !== parseInt(crianca_id)) {
                return res.status(403).json({
                    erro: "SEM_PERMISSAO",
                    mensagem: "Você só pode comprar itens para si mesmo."
                });
            }
            criancaId = req.usuario.id;
        } else if (req.usuario.tipo === 'responsavel') {
            // Responsável pode comprar para seus dependentes
            const crianca = await Criancas.findByPk(criancaId);
            if (!crianca || crianca.id_responsavel !== req.usuario.id) {
                return res.status(403).json({
                    erro: "SEM_PERMISSAO",
                    mensagem: "Você não tem acesso a esta criança."
                });
            }
        }

        const crianca = await Criancas.findByPk(criancaId, { transaction });
        const item = await ShopItem.findByPk(item_id, { transaction });

        if (!crianca) {
            await transaction.rollback();
            return res.status(404).json({
                erro: "CRIANCA_NAO_ENCONTRADA",
                mensagem: "Criança não encontrada."
            });
        }

        if (!item) {
            await transaction.rollback();
            return res.status(404).json({
                erro: "ITEM_NAO_ENCONTRADO",
                mensagem: "Item não encontrado."
            });
        }

        // Verificar nível
        if (crianca.nivel < item.nivel_necessario) {
            await transaction.rollback();
            return res.status(400).json({
                erro: "NIVEL_INSUFICIENTE",
                mensagem: `Você precisa estar no nível ${item.nivel_necessario} para desbloquear este item.`
            });
        }

        // Verificar saldo
        if (parseFloat(crianca.saldo_gastar) < item.preco) {
            await transaction.rollback();
            return res.status(400).json({
                erro: "SALDO_INSUFICIENTE",
                mensagem: "O seu Pote Gastar não tem saldo suficiente."
            });
        }

        // Verificar se já possui
        const jaPossui = await CriancaShopItem.findOne({
            where: { id_crianca: criancaId, id_item: item_id },
            transaction
        });

        if (jaPossui) {
            await transaction.rollback();
            return res.status(400).json({
                erro: "ITEM_JA_POSSUI",
                mensagem: "Você já possui este item."
            });
        }

        // Deduzir saldo
        const novoSaldo = parseFloat(crianca.saldo_gastar) - item.preco;
        await crianca.update({ saldo_gastar: novoSaldo }, { transaction });

        // Registrar compra
        await CriancaShopItem.create({
            id_crianca: criancaId,
            id_item: item_id
        }, { transaction });

        // Registrar histórico
        await Historico.create({
            id_crianca: criancaId,
            tipo: "gastar",
            valor: item.preco,
            descricao: `Compra: ${item.nome}`
        }, { transaction });

        await transaction.commit();

        res.json({
            mensagem: "Item comprado com sucesso!",
            item_comprado: {
                id: item.id_item,
                nome: item.nome,
                tipo: item.tipo
            },
            pote_gastar_atualizado: {
                saldo_anterior: parseFloat(crianca.saldo_gastar) + item.preco,
                saldo_atual: novoSaldo
            }
        });

    } catch (error) {
        await transaction.rollback();
        console.error(error);
        res.status(500).json({ erro: "ERRO_INTERNO", mensagem: error.message });
    }
};