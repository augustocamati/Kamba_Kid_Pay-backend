// controllers/financeiroController.js
const sequelize = require("../config/database");
const Criancas = require("../models/Criancas");
const Historico = require("../models/HistoricoTransacao");
const Campanha = require("../models/Campanha");
const Doacoes = require("../models/Doacoes");

// ============================================
// POST /api/financeiro/poupar
// ============================================
exports.poupar = async (req, res) => {
    const transaction = await sequelize.transaction();  // 🔥 ADICIONAR ESTA LINHA!
    try {
        const { id_crianca, valor } = req.body;

        // 🔥 VALIDAR SE A CRIANÇA DO TOKEN É A MESMA
        if (req.usuario.tipo === 'crianca' && req.usuario.id !== parseInt(id_crianca)) {
            await transaction.rollback();
            return res.status(403).json({
                erro: "SEM_PERMISSAO",
                mensagem: "Você só pode movimentar os seus próprios potes."
            });
        }

        const crianca = await Criancas.findByPk(id_crianca, { transaction });
        if (!crianca) {
            await transaction.rollback();
            return res.status(404).json({ 
                erro: "CRIANCA_NAO_ENCONTRADA", 
                mensagem: "Criança não encontrada." 
            });
        }

        // Verificar se o responsável tem acesso (se for responsável)
        if (req.usuario.tipo === 'responsavel') {
            if (crianca.id_responsavel !== req.usuario.id) {
                await transaction.rollback();
                return res.status(403).json({
                    erro: "SEM_PERMISSAO",
                    mensagem: "Você não tem acesso a esta criança."
                });
            }
        }

        const valorNum = parseFloat(valor);
        if (parseFloat(crianca.saldo_gastar) < valorNum) {
            await transaction.rollback();
            return res.status(400).json({
                erro: "SALDO_INSUFICIENTE",
                mensagem: "Saldo insuficiente no pote Gastar."
            });
        }

        const novoGastar = parseFloat(crianca.saldo_gastar) - valorNum;
        const novoPoupar = parseFloat(crianca.saldo_poupar) + valorNum;

        await crianca.update({
            saldo_gastar: novoGastar,
            saldo_poupar: novoPoupar
        }, { transaction });

        await Historico.create({
            id_crianca,
            tipo: "poupar",
            valor: valorNum,
            descricao: "Transferência para poupança"
        }, { transaction });

        await transaction.commit();

        res.json({
            mensagem: "💰 Valor transferido para poupança!",
            valor_poupado: valorNum,
            saldos: {
                gastar: novoGastar,
                poupar: novoPoupar,
                ajudar: parseFloat(crianca.saldo_ajudar)
            }
        });

    } catch (error) {
        await transaction.rollback();
        console.error("Erro ao poupar:", error);
        res.status(500).json({ erro: "ERRO_INTERNO", mensagem: error.message });
    }
};

// ============================================
// POST /api/financeiro/gastar
// ============================================
exports.gastar = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id_crianca, valor, descricao } = req.body;

        // 🔥 VALIDAÇÃO DO ID DA CRIANÇA
        if (!id_crianca) {
            await transaction.rollback();
            return res.status(400).json({ 
                erro: "CAMPOS_OBRIGATORIOS", 
                mensagem: "ID da criança é obrigatório." 
            });
        }

        // 🔥 VALIDAR SE A CRIANÇA DO TOKEN É A MESMA
        if (req.usuario.tipo === 'crianca' && req.usuario.id !== parseInt(id_crianca)) {
            await transaction.rollback();
            return res.status(403).json({ 
                erro: "SEM_PERMISSAO", 
                mensagem: "Você só pode movimentar os seus próprios potes." 
            });
        }

        const crianca = await Criancas.findByPk(id_crianca, { transaction });
        
        if (!crianca) {
            await transaction.rollback();
            return res.status(404).json({
                erro: "CRIANCA_NAO_ENCONTRADA",
                mensagem: "Criança não encontrada."
            });
        }

        // Verificar se o responsável tem acesso (se for responsável)
        if (req.usuario.tipo === 'responsavel') {
            if (crianca.id_responsavel !== req.usuario.id) {
                await transaction.rollback();
                return res.status(403).json({ 
                    erro: "SEM_PERMISSAO", 
                    mensagem: "Você não tem acesso a esta criança." 
                });
            }
        }

        const valorNum = parseFloat(valor);
        if (isNaN(valorNum) || valorNum <= 0) {
            await transaction.rollback();
            return res.status(400).json({
                erro: "VALOR_INVALIDO",
                mensagem: "Valor deve ser maior que zero."
            });
        }

        if (parseFloat(crianca.saldo_gastar) < valorNum) {
            await transaction.rollback();
            return res.status(400).json({
                erro: "SALDO_INSUFICIENTE",
                mensagem: `Saldo insuficiente no pote Gastar. Saldo atual: ${parseFloat(crianca.saldo_gastar)} Kz`
            });
        }

        const novoGastar = parseFloat(crianca.saldo_gastar) - valorNum;

        await crianca.update({
            saldo_gastar: novoGastar
        }, { transaction });

        await Historico.create({
            id_crianca,
            tipo: "gastar",
            valor: valorNum,
            descricao: descricao || "Compra realizada"
        }, { transaction });

        await transaction.commit();

        res.json({
            mensagem: "🛍️ Compra realizada!",
            valor_gasto: valorNum,
            saldo_restante: novoGastar,
            detalhes: {
                produto: descricao || "Produto",
                data: new Date()
            }
        });

    } catch (error) {
        await transaction.rollback();
        console.error("Erro ao gastar:", error);
        res.status(500).json({ erro: "ERRO_INTERNO", mensagem: error.message });
    }
};

// ============================================
// POST /api/financeiro/doar (para campanhas)
// ============================================
exports.doar = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id_crianca, id_campanha, valor } = req.body;

        // 🔥 VALIDAÇÕES
        if (!id_crianca || !id_campanha || !valor) {
            await transaction.rollback();
            return res.status(400).json({ 
                erro: "CAMPOS_OBRIGATORIOS", 
                mensagem: "ID da criança, ID da campanha e valor são obrigatórios." 
            });
        }

        // 🔥 VALIDAR SE A CRIANÇA DO TOKEN É A MESMA
        if (req.usuario.tipo === 'crianca' && req.usuario.id !== parseInt(id_crianca)) {
            await transaction.rollback();
            return res.status(403).json({ 
                erro: "SEM_PERMISSAO", 
                mensagem: "Você só pode doar com os seus próprios potes." 
            });
        }

        const crianca = await Criancas.findByPk(id_crianca, { transaction });
        const campanha = await Campanha.findByPk(id_campanha, { transaction });

        if (!crianca) {
            await transaction.rollback();
            return res.status(404).json({
                erro: "CRIANCA_NAO_ENCONTRADA",
                mensagem: "Criança não encontrada."
            });
        }

        if (!campanha) {
            await transaction.rollback();
            return res.status(404).json({
                erro: "CAMPANHA_NAO_ENCONTRADA",
                mensagem: "Campanha não encontrada."
            });
        }

        // Verificar se o responsável tem acesso (se for responsável)
        if (req.usuario.tipo === 'responsavel') {
            if (crianca.id_responsavel !== req.usuario.id) {
                await transaction.rollback();
                return res.status(403).json({ 
                    erro: "SEM_PERMISSAO", 
                    mensagem: "Você não tem acesso a esta criança." 
                });
            }
        }

        const valorNum = parseFloat(valor);
        if (isNaN(valorNum) || valorNum <= 0) {
            await transaction.rollback();
            return res.status(400).json({
                erro: "VALOR_INVALIDO",
                mensagem: "Valor deve ser maior que zero."
            });
        }

        if (parseFloat(crianca.saldo_ajudar) < valorNum) {
            await transaction.rollback();
            return res.status(400).json({
                erro: "SALDO_INSUFICIENTE",
                mensagem: `Saldo insuficiente no pote Ajudar. Saldo atual: ${parseFloat(crianca.saldo_ajudar)} Kz`
            });
        }

        // Verificar se campanha está ativa
        if (!campanha.status) {
            await transaction.rollback();
            return res.status(400).json({
                erro: "CAMPANHA_INATIVA",
                mensagem: "Esta campanha não está ativa."
            });
        }

        const hoje = new Date();
        if (hoje > new Date(campanha.date_fim)) {
            await transaction.rollback();
            return res.status(400).json({
                erro: "CAMPANHA_ENCERRADA",
                mensagem: "Esta campanha já terminou."
            });
        }

        const novoSaldoAjudar = parseFloat(crianca.saldo_ajudar) - valorNum;
        const novoXP = crianca.xp + 30;
        const novoArrecadado = parseFloat(campanha.valor_arrecadado) + valorNum;

        await crianca.update({
            saldo_ajudar: novoSaldoAjudar,
            xp: novoXP,
            nivel: Math.floor(novoXP / 100) + 1
        }, { transaction });

        await campanha.update({
            valor_arrecadado: novoArrecadado
        }, { transaction });

        await Doacoes.create({
            id_crianca,
            id_campanha,
            valor: valorNum
        }, { transaction });

        await Historico.create({
            id_crianca,
            tipo: "doar",
            valor: valorNum,
            descricao: `Doação para: ${campanha.nome}`
        }, { transaction });

        await transaction.commit();

        res.json({
            mensagem: "💝 Doação realizada com sucesso!",
            doacao: {
                valor: valorNum,
                campanha: campanha.nome,
                data: new Date()
            },
            saldo_ajudar: novoSaldoAjudar,
            xp_ganho: 30,
            xp_total: novoXP,
            badge: "🏅 Kamba Generoso"
        });

    } catch (error) {
        await transaction.rollback();
        console.error("Erro ao doar:", error);
        res.status(500).json({ erro: "ERRO_INTERNO", mensagem: error.message });
    }
};

// ============================================
// POST /api/financeiro/bonus
// ============================================
exports.bonusPoupanca = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id_crianca, percentagem } = req.body;

        if (!id_crianca || !percentagem) {
            await transaction.rollback();
            return res.status(400).json({ 
                erro: "CAMPOS_OBRIGATORIOS", 
                mensagem: "ID da criança e percentagem são obrigatórios." 
            });
        }

        // 🔥 VALIDAR SE O RESPONSÁVEL TEM ACESSO
        if (req.usuario.tipo !== 'responsavel') {
            await transaction.rollback();
            return res.status(403).json({ 
                erro: "SEM_PERMISSAO", 
                mensagem: "Apenas responsáveis podem dar bónus." 
            });
        }

        const crianca = await Criancas.findByPk(id_crianca, { transaction });
        if (!crianca) {
            await transaction.rollback();
            return res.status(404).json({
                erro: "CRIANCA_NAO_ENCONTRADA",
                mensagem: "Criança não encontrada."
            });
        }

        // Verificar se o responsável tem acesso a esta criança
        if (crianca.id_responsavel !== req.usuario.id) {
            await transaction.rollback();
            return res.status(403).json({ 
                erro: "SEM_PERMISSAO", 
                mensagem: "Você não tem acesso a esta criança." 
            });
        }

        const percent = parseFloat(percentagem);
        if (isNaN(percent) || percent <= 0 || percent > 100) {
            await transaction.rollback();
            return res.status(400).json({
                erro: "PERCENTAGEM_INVALIDA",
                mensagem: "Percentagem deve ser entre 1 e 100."
            });
        }

        const bonus = parseFloat(crianca.saldo_poupar) * (percent / 100);
        const novoSaldo = parseFloat(crianca.saldo_poupar) + bonus;

        await crianca.update({
            saldo_poupar: novoSaldo
        }, { transaction });

        await Historico.create({
            id_crianca,
            tipo: "bonus_gestao",
            valor: bonus,
            descricao: `Bónus de ${percent}% sobre poupança`
        }, { transaction });

        await transaction.commit();

        res.json({
            mensagem: "🎉 Bónus aplicado com sucesso!",
            percentagem: percent,
            bonus_aplicado: bonus,
            novo_saldo_poupar: novoSaldo
        });

    } catch (error) {
        await transaction.rollback();
        console.error("Erro ao aplicar bónus:", error);
        res.status(500).json({ erro: "ERRO_INTERNO", mensagem: error.message });
    }
};