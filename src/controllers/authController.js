const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Responsavel = require("../models/Responsavel");
const Criancas = require("../models/Criancas");

const SECRET = process.env.JWT_SECRET;

// LOGIN DO Responsavel
exports.loginResponsavel = async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) return res.status(400).json({ message: "Email e senha são obrigatórios" });

    const responsavel = await Responsavel.findOne({ where: { email } });
    if (!responsavel) return res.status(404).json({ message: "Responsavel não encontrado" });

    const senhaValida = await bcrypt.compare(senha, responsavel.senha);
    if (!senhaValida) return res.status(401).json({ message: "Senha incorreta" });

    const token = jwt.sign(
      { id: responsavel.id_responsavel, email: responsavel.email },
      SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login realizado com sucesso",
      token,
      responsavel: {
        id_responsavel: responsavel.id_responsavel,
        nome_completo: responsavel.nome_completo,
        email: responsavel.email
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro no login" });
  }
};

// LOGIN DA CRIANÇA
exports.loginCrianca = async (req, res) => {
  try {
    const { nome_usuario, senha } = req.body;

    if (!nome_usuario || !senha) {
      return res.status(400).json({ message: "Nome de usuário e senha são obrigatórios" });
    }

    const crianca = await Criancas.findOne({ where: { nome_usuario } });
    if (!crianca) return res.status(404).json({ message: "Criança não encontrada" });

    const senhaValida = await bcrypt.compare(senha, crianca.senha);
    if (!senhaValida) return res.status(401).json({ message: "Senha incorreta" });

    const token = jwt.sign(
      { id: crianca.id_crianca, tipo: "crianca" },
      SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login realizado com sucesso",
      token,
      crianca: {
        id_crianca: crianca.id_crianca,
        nome_completo: crianca.nome_completo,
        idade: crianca.idade,
        id_responsavel: crianca.id_responsavel,
        nome_usuario: crianca.nome_usuario,
        saldo_gastar: crianca.saldo_gastar,
        saldo_poupar: crianca.saldo_poupar,
        saldo_ajudar: crianca.saldo_ajudar,
        xp: crianca.xp,
        nivel: crianca.nivel
      }
    });

  } catch (erro) {
    console.error(erro);
    res.status(500).json({ message: "Erro no login" });
  }
};