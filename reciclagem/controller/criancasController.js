const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Crianca = require("../src/models/Criancas");
const HistoricoTransacao = require("../src/models/HistoricoTransacao")

const SECRET = process.env.JWT_SECRET;

exports.cadastrarCrianca = async (req, res) => {
  try {
    const { nome_completo, idade, id_responsavel, nome_usuario, senha } = req.body;

    if (!nome_completo || !idade || !id_responsavel || !nome_usuario || !senha) {
      return res.status(400).json({ message: "Todos os campos são obrigatórios" });
    }

    // Verificar se nome de usuário já existe
    const existe = await Crianca.findOne({ where: { nome_usuario } });
    if (existe) {
      return res.status(400).json({ message: "Nome de usuário já existe" });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    // Criar criança
    const novaCrianca = await Crianca.create({
      nome_completo,
      idade,
      id_responsavel,
      nome_usuario,
      senha: senhaHash
    });

    // Gerar token
    const token = jwt.sign(
      { id: novaCrianca.id_crianca, tipo: "crianca" },
      SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Criança cadastrada com sucesso",
      crianca: {
        id_crianca: novaCrianca.id_crianca,
        nome_completo: novaCrianca.nome_completo,
        idade: novaCrianca.idade,
        id_responsavel: novaCrianca.id_responsavel,
        nome_usuario: novaCrianca.nome_usuario,
        saldo_gastar: novaCrianca.saldo_gastar,
        saldo_poupar: novaCrianca.saldo_poupar,
        saldo_ajudar: novaCrianca.saldo_ajudar,
        xp: novaCrianca.xp,
        nivel: novaCrianca.nivel
      }
    });

  } catch (erro) {
    console.error(erro);
    res.status(500).json({ message: "Erro ao cadastrar criança" });
  }
};


exports.criancaDashboard = async (req, res) => {
  try {
    const id_crianca = req.params.id
    // Buscar saldos atuais
    const crianca = await Crianca.findByPk(id_crianca, {
      attributes: [
        "saldo_gastar",
        "saldo_poupar",
        "saldo_ajudar",
        "xp"
      ]
    })
    if (!crianca) {
      return res.status(404).json({
        erro: "Criança não encontrada"
      })
    }
    res.json({
      stats: crianca,
    })
  } catch (e) {
    console.log(e)
    res.status(500).json({
      erro: "Erro ao buscar dashboard"
    })
  }
}

exports.criancaTransacoes = async (req, res) => {
  try {
    const id_crianca = req.params.id
    const crianca = await Crianca.findByPk(id_crianca)

    if (!crianca) {
      return res.status(404).json({
        erro: "Criança não encontrada"
      })
    }
    // Buscar últimas 5 transações
    const historico = await HistoricoTransacao.findAll({
      where: { id_crianca },
      order: [["createdAt", "DESC"]],
      limit: 5
    })
    res.json({
      recentTransactions: historico
    })
  } catch (e) {
    console.log(e)
    res.status(500).json({
      erro: "Erro ao buscar Transações"
    })
  }
}