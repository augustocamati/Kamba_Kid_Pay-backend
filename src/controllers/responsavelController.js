const bcrypt = require("bcrypt");
const Responsavel = require("../models/Responsavel");

exports.cadastrarResponsavel = async (req, res) => {
  try {
    const { nome_completo, email, telefone, senha } = req.body;

    // Verificar se já existe
    const responsavelExistente = await Responsavel.findOne({ where: { email } });
    if (responsavelExistente) {
      return res.status(400).json({ message: "Email já cadastrado" });
    }

    // Criptografar senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Criar responsavel
    const novoResponsavel = await Responsavel.create({
      nome_completo,
      email,
      telefone,
      senha: senhaHash,
    });

    res.status(201).json({
      message: "Responsavel cadastrado com sucesso",
      responsavel: {
        id_responsavel: novoResponsavel.id_responsavel,
        nome_completo: novoResponsavel.nome_completo,
        email: novoResponsavel.email,
        telefone: novoResponsavel.telefone
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao cadastrar responsavel" });
  }
};