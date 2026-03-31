// controllers/relatoriosController.js
const { Op } = require("sequelize");
const Criancas = require("../models/Criancas");
const Tarefa = require("../models/Tarefa");
const Missao = require("../models/Missoes");
const Doacoes = require("../models/Doacoes");

// GET /api/reports/progress
exports.progressReport = async (req, res) => {
    try {
        const { crianca_id, periodo } = req.query;
        
        const crianca = await Criancas.findByPk(crianca_id);
        if (!crianca) {
            return res.status(404).json({ 
                erro: "CRIANCA_NAO_ENCONTRADA", 
                mensagem: "Criança não encontrada." 
            });
        }

        // Parse do período (ex: 2026-01)
        const [ano, mes] = periodo.split('-');
        const dataInicio = new Date(parseInt(ano), parseInt(mes) - 1, 1);
        const dataFim = new Date(parseInt(ano), parseInt(mes), 0);

        const tarefasConcluidas = await Tarefa.count({
            where: {
                id_crianca: crianca_id,
                status: "aprovada",
                aprovado_em: {
                    [Op.between]: [dataInicio, dataFim]
                }
            }
        });

        const historicoGanhos = await sequelize.query(`
            SELECT SUM(valor) as total
            FROM historico_transacoes
            WHERE id_crianca = :criancaId
            AND tipo = 'tarefa'
            AND data_hora BETWEEN :inicio AND :fim
        `, {
            replacements: { criancaId: crianca_id, inicio: dataInicio, fim: dataFim },
            type: sequelize.QueryTypes.SELECT
        });

        const missoesCompletas = await Missao.count({
            where: {
                id_crianca: crianca_id,
                concluida: true,
                updatedAt: {
                    [Op.between]: [dataInicio, dataFim]
                }
            }
        });

        const doacoesRealizadas = await Doacoes.count({
            where: {
                id_crianca: crianca_id,
                data_hora: {
                    [Op.between]: [dataInicio, dataFim]
                }
            }
        });

        const totalSaldo = parseFloat(crianca.saldo_gastar) + parseFloat(crianca.saldo_poupar) + parseFloat(crianca.saldo_ajudar);
        const taxaPoupanca = totalSaldo > 0 ? (parseFloat(crianca.saldo_poupar) / totalSaldo) * 100 : 0;
        const metaProgresso = await calcularMetaProgresso(crianca_id);

        const resumoWhatsapp = `📊 *Relatório Kamba Kid Pay - ${crianca.nome_completo}*\n\n` +
            `💰 Saldo Total: ${totalSaldo.toFixed(0)} Kz\n` +
            `✅ Tarefas Concluídas: ${tarefasConcluidas}\n` +
            `💚 Taxa de Poupança: ${Math.round(taxaPoupanca)}%\n\n` +
            `📦 Distribuição:\n` +
            `• Gastar: ${parseFloat(crianca.saldo_gastar).toFixed(0)} Kz\n` +
            `• Poupar: ${parseFloat(crianca.saldo_poupar).toFixed(0)} Kz\n` +
            `• Ajudar: ${parseFloat(crianca.saldo_ajudar).toFixed(0)} Kz\n\n` +
            `Continue incentivando a educação financeira! 🎯`;

        res.json({
            crianca_id: crianca_id,
            periodo,
            tarefas_concluidas: tarefasConcluidas,
            total_ganho: historicoGanhos[0]?.total || 0,
            missoes_completas: missoesCompletas,
            doacoes_realizadas: doacoesRealizadas,
            meta_poupanca_progresso: metaProgresso,
            resumo_whatsapp: resumoWhatsapp
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: "ERRO_INTERNO", mensagem: error.message });
    }
};

async function calcularMetaProgresso(criancaId) {
    const missao = await Missao.findOne({
        where: {
            id_crianca: criancaId,
            tipo: 'poupanca',
            ativa: true,
            concluida: false
        },
        order: [['createdAt', 'DESC']]
    });

    if (missao && missao.objetivo_valor > 0) {
        return Math.round((parseFloat(missao.progresso_atual) / parseFloat(missao.objetivo_valor)) * 100);
    }
    return 0;
}