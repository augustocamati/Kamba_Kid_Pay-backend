// controllers/missoesController.js
const { Op } = require("sequelize");
const Missao = require("../models/Missoes");
const ProgressoMissao = require("../models/ProgressoMissao");
const Crianca = require("../models/Criancas");

/**
 * RESPONSÁVEL: Pode criar missões personalizadas
 */
exports.criarMissao = async (req, res) => {
    try {
        const {
            titulo,
            descricao,
            tipo_missao,
            xp_recompensa,
            recompensa_financeira,
            nivel_minimo,
            id_responsavel
        } = req.body;

        // Validações básicas
        if (!titulo || !descricao || !tipo_missao) {
            return res.status(400).json({
                erro: "Título, descrição e tipo da missão são obrigatórios"
            });
        }

        // Se for tarefa, precisa ter recompensa financeira
        if (tipo_missao === 'tarefa_casa' && (!recompensa_financeira || recompensa_financeira <= 0)) {
            return res.status(400).json({
                erro: "Tarefas devem ter uma recompensa financeira"
            });
        }

        const novaMissao = await Missao.create({
            titulo,
            descricao,
            tipo_missao,
            xp_recompensa: xp_recompensa || 0,
            recompensa_financeira: recompensa_financeira || 0,
            nivel_minimo: nivel_minimo || 1,
            id_responsavel: id_responsavel || null,
            ativa: true
        });

        res.status(201).json({
            mensagem: "Missão criada com sucesso",
            missao: novaMissao
        });

    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
};

/**
 * CRIANÇA: Ver missões disponíveis
 */
exports.missoesDisponiveis = async (req, res) => {
    try {
        const { id_crianca } = req.params;

        const crianca = await Crianca.findByPk(id_crianca);
        if (!crianca) {
            return res.status(404).json({ erro: "Criança não encontrada" });
        }

        // Buscar missões ativas com nível compatível
        const missoes = await Missao.findAll({
            where: {
                ativa: true,
                nivel_minimo: { [Op.lte]: crianca.nivel },
                // Mostra missões do sistema (id_responsavel null) e do responsável dela
                [Op.or]: [
                    { id_responsavel: null },
                    { id_responsavel: crianca.id_responsavel }
                ]
            }
        });

        // Buscar progresso da criança
        const progresso = await ProgressoMissao.findAll({
            where: { id_crianca }
        });

        // Separar por estado
        const missoesConcluidas = progresso
            .filter(p => p.estado === 'concluida')
            .map(p => p.id_missao);

        const missoesEmAndamento = progresso
            .filter(p => p.estado === 'em_progresso' || p.estado === 'aguardando_aprovacao')
            .map(p => p.id_missao);

        const disponiveis = missoes.filter(m => 
            !missoesConcluidas.includes(m.id_missao) && 
            !missoesEmAndamento.includes(m.id_missao)
        );

        // Buscar detalhes das missões em andamento
        const andamentoDetalhado = await Promise.all(
            progresso
                .filter(p => missoesEmAndamento.includes(p.id_missao))
                .map(async (p) => {
                    const missao = await Missao.findByPk(p.id_missao);
                    return {
                        ...p.toJSON(),
                        missao: missao ? missao.toJSON() : null
                    };
                })
        );

        res.json({
            disponiveis,
            em_andamento: andamentoDetalhado,
            concluidas: missoesConcluidas.length
        });

    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
};

/**
 * CRIANÇA: Iniciar uma missão
 */
exports.iniciarMissao = async (req, res) => {
    try {
        const { id_crianca, id_missao } = req.body;

        // Validações
        const crianca = await Crianca.findByPk(id_crianca);
        if (!crianca) {
            return res.status(404).json({ erro: "Criança não encontrada" });
        }

        const missao = await Missao.findByPk(id_missao);
        if (!missao) {
            return res.status(404).json({ erro: "Missão não encontrada" });
        }

        // Verificar nível
        if (crianca.nivel < missao.nivel_minimo) {
            return res.status(400).json({ 
                erro: `Nível mínimo necessário: ${missao.nivel_minimo}` 
            });
        }

        // Verificar se já iniciou
        const progressoExistente = await ProgressoMissao.findOne({
            where: { id_crianca, id_missao }
        });

        if (progressoExistente) {
            return res.status(400).json({ erro: "Missão já iniciada" });
        }

        // Criar progresso
        const progresso = await ProgressoMissao.create({
            id_crianca,
            id_missao,
            estado: 'em_progresso',
            data_inicio: new Date()
        });

        res.json({
            mensagem: "Missão iniciada com sucesso!",
            progresso
        });

    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
};

exports.missoesTarefa = async (req, res) => {
    try {
        const { id_responsavel } = req.params;

        const missoes = await Missao.findAll({
            where: {
                tipo_missao: 'tarefa_casa',
                ativa: true,
                [Op.or]: [
                    { id_responsavel: null },      // Missões do sistema
                    { id_responsavel: id_responsavel } // Missões criadas por este responsável
                ]
            },
            attributes: ['id_missao', 'titulo', 'descricao', 'xp_recompensa', 'recompensa_financeira']
        });

        res.json({
            total: missoes.length,
            missoes
        });

    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
};