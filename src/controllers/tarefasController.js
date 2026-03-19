// controllers/tarefasController.js
const Tarefa = require("../models/Tarefa");
const Criancas = require("../models/Criancas");
const Responsavel = require("../models/Responsavel");
const Historico = require("../models/HistoricoTransacao");
const missaoService = require("../services/missaoService");


exports.criarTarefa = async (req, res) => {
    try {
        const { titulo, descricao, recompensa, id_crianca, id_responsavel, id_missao } = req.body;

        console.log("📝 Dados recebidos:", { titulo, id_missao }); // LOG PARA DEBUG

        // ⚠️ VALIDAÇÃO CRÍTICA
        if (id_missao) {
            // Buscar a missão
            const missao = await Missao.findByPk(id_missao);
            
            console.log("🔍 Missão encontrada:", missao ? {
                id: missao.id_missao,
                titulo: missao.titulo,
                tipo: missao.tipo_missao
            } : "NÃO ENCONTRADA");

            if (!missao) {
                return res.status(400).json({ 
                    erro: "Missão não encontrada",
                    detalhe: `ID ${id_missao} não existe no banco`
                });
            }
            
            // ⚠️ VALIDAÇÃO DO TIPO
            if (missao.tipo_missao !== 'tarefa_casa') {
                return res.status(400).json({ 
                    erro: "Esta missão não é uma tarefa doméstica",
                    missao_encontrada: {
                        id: missao.id_missao,
                        titulo: missao.titulo,
                        tipo: missao.tipo_missao,
                        tipo_esperado: 'tarefa_casa'
                    }
                });
            }

            // Validação adicional: missão pertence ao responsável?
            if (missao.id_responsavel && missao.id_responsavel !== id_responsavel) {
                return res.status(400).json({
                    erro: "Esta missão não pertence a este responsável",
                    missao_responsavel: missao.id_responsavel,
                    seu_responsavel: id_responsavel
                });
            }
        }

        // Se passou por todas validações, cria a tarefa
        const tarefa = await Tarefa.create({
            titulo,
            descricao,
            recompensa,
            id_crianca,
            id_responsavel,
            id_missao: id_missao || null,
            status: "pendente"
        });

        res.status(201).json({
            mensagem: "✅ Tarefa criada com sucesso",
            tarefa,
            vinculacao: id_missao ? `Vinculada à missão: ${id_missao}` : "Tarefa avulsa"
        });

    } catch (error) {
        console.error("❌ Erro ao criar tarefa:", error);
        res.status(500).json({ erro: error.message });
    }
};

// enviar comprovacao com FOTO (criança)
exports.enviarComprovacao = async (req, res) => {
    try {
        const { id_tarefa } = req.body;

        if (!req.file) {
            return res.status(400).json({ erro: "Envie uma foto da tarefa realizada" });
        }

        await Tarefa.update({
            foto_comprovacao: req.file.filename,
            status: "aguardando_aprovacao"
        }, {
            where: { id_tarefa }
        });

        res.json({
            mensagem: "📸 Comprovação enviada! Aguardando aprovação do responsável.",
            imagem: `/uploads/${req.file.filename}`
        });

    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
};

// aprovar tarefa (responsável)
exports.aprovarTarefa = async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { id_tarefa } = req.params;

        // Buscar dados
        const tarefa = await Tarefa.findByPk(id_tarefa, { transaction });
        if (!tarefa) {
            await transaction.rollback();
            return res.status(404).json({ erro: "Tarefa não encontrada" });
        }

        const crianca = await Criancas.findByPk(tarefa.id_crianca, { transaction });
        const responsavel = await Responsavel.findByPk(crianca.id_responsavel, { transaction });

        // Calcular divisão nos potes
        const valor = tarefa.recompensa;
        const saldos = {
            gastar: parseFloat(crianca.saldo_gastar) + (valor * responsavel.perc_gastar / 100),
            poupar: parseFloat(crianca.saldo_poupar) + (valor * responsavel.perc_poupar / 100),
            ajudar: parseFloat(crianca.saldo_ajudar) + (valor * responsavel.perc_ajudar / 100)
        };

        // Atualizar tarefa
        tarefa.status = "aprovada";
        await tarefa.save({ transaction });

        // Se esta tarefa está ligada a uma MISSÃO
        if (tarefa.id_missao) {
            await transaction.commit(); // Commita antes de chamar o service
            
            // Chama o service para finalizar a missão (já cria histórico lá dentro)
            const resultado = await missaoService.finalizarMissao(
                crianca.id_crianca,
                tarefa.id_missao,
                { saldos } // Passa os saldos calculados
            );

            return res.json({
                mensagem: "✅ Tarefa aprovada e missão concluída!",
                valor_recebido: valor,
                divisao: {
                    gastar: valor * responsavel.perc_gastar / 100,
                    poupar: valor * responsavel.perc_poupar / 100,
                    ajudar: valor * responsavel.perc_ajudar / 100
                },
                ...resultado
            });
        } 
        
        // Se NÃO é missão (tarefa avulsa)
        await crianca.update(saldos, { transaction });
        
        // Criar histórico
        await Historico.create({
            id_crianca: crianca.id_crianca,
            tipo: "tarefa",
            valor,
            descricao: `Recompensa: ${tarefa.titulo}`
        }, { transaction });

        await transaction.commit();

        res.json({
            mensagem: "✅ Tarefa aprovada!",
            valor_recebido: valor,
            novos_saldos: {
                gastar: saldos.gastar,
                poupar: saldos.poupar,
                ajudar: saldos.ajudar
            }
        });

    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ erro: error.message });
    }
};

// rejeitar tarefa (responsável)
exports.rejeitarTarefa = async (req, res) => {
    try {
        const { id_tarefa } = req.params;

        await Tarefa.update({
            status: "rejeitada"
        }, {
            where: { id_tarefa }
        });

        res.json({
            mensagem: "❌ Tarefa rejeitada. Peça para a criança refazer."
        });

    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
};

// listar tarefas da crianca
exports.listarTarefasCrianca = async (req, res) => {
    try {
        const { id_crianca } = req.params;

        const tarefas = await Tarefa.findAll({
            where: { id_crianca },
            order: [['createdAt', 'DESC']]
        });

        // Separar por status
        const pendentes = tarefas.filter(t => t.status === 'pendente');
        const aguardando = tarefas.filter(t => t.status === 'aguardando_aprovacao');
        const aprovadas = tarefas.filter(t => t.status === 'aprovada');
        const rejeitadas = tarefas.filter(t => t.status === 'rejeitada');

        res.json({
            total: tarefas.length,
            pendentes,
            aguardando_aprovacao: aguardando,
            aprovadas,
            rejeitadas
        });

    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
};