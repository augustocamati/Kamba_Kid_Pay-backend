// services/missaoService.js
const sequelize = require("../config/database");
const Crianca = require("../models/Criancas");
const Missao = require("../models/Missoes");
const ProgressoMissao = require("../models/ProgressoMissao");
const Historico = require("../models/HistoricoTransacao");

class MissaoService {
    
    /**
     * Função ÚNICA para finalizar qualquer tipo de missão
     * Chamada por: quizController, videoController, tarefasController
     */
    async finalizarMissao(id_crianca, id_missao, dadosExtras = {}) {
        const transaction = await sequelize.transaction();
        
        try {
            // Buscar dados
            const crianca = await Crianca.findByPk(id_crianca, { transaction });
            const missao = await Missao.findByPk(id_missao, { transaction });
            const progresso = await ProgressoMissao.findOne({
                where: { id_crianca, id_missao },
                transaction
            });

            if (!crianca || !missao) {
                throw new Error("Criança ou missão não encontrada");
            }

            if (!progresso) {
                throw new Error("Missão não iniciada");
            }

            if (progresso.estado === 'concluida') {
                throw new Error("Missão já foi concluída");
            }

            // Calcular novo XP
            let novoXP = crianca.xp + missao.xp_recompensa;
            let novoNivel = Math.floor(novoXP / 100) + 1;

            // Preparar atualização da criança
            const updateCrianca = {
                xp: novoXP,
                nivel: novoNivel
            };

            // Se tiver recompensa financeira (só tarefas)
            if (dadosExtras.saldos) {
                updateCrianca.saldo_gastar = dadosExtras.saldos.gastar;
                updateCrianca.saldo_poupar = dadosExtras.saldos.poupar;
                updateCrianca.saldo_ajudar = dadosExtras.saldos.ajudar;
            }

            // Atualizar criança
            await crianca.update(updateCrianca, { transaction });

            // Marcar progresso como concluído
            progresso.estado = 'concluida';
            progresso.data_conclusao = new Date();
            if (dadosExtras.foto) {
                progresso.prova_imagem = dadosExtras.foto;
            }
            await progresso.save({ transaction });

            // Se tiver valor financeiro, criar histórico
            if (missao.recompensa_financeira > 0 && missao.tipo_missao === 'tarefa_casa') {
                await Historico.create({
                    id_crianca,
                    tipo: 'tarefa',
                    valor: missao.recompensa_financeira,
                    descricao: `Recompensa: ${missao.titulo}`
                }, { transaction });
            }

            await transaction.commit();

            return {
                sucesso: true,
                xp_ganho: missao.xp_recompensa,
                xp_total: novoXP,
                novo_nivel: novoNivel,
                missao_concluida: missao.titulo
            };

        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
}

module.exports = new MissaoService();