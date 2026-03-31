// middlewares/auth.js
const jwt = require("jsonwebtoken");
const Responsavel = require("../models/Responsavel");
const Criancas = require("../models/Criancas");

const SECRET = process.env.JWT_SECRET;

exports.authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        
        if (!token) {
            return res.status(401).json({ 
                erro: "NAO_AUTENTICADO", 
                mensagem: "Token não fornecido." 
            });
        }

        const decoded = jwt.verify(token, SECRET);
        
        if (decoded.tipo === 'responsavel') {
            const responsavel = await Responsavel.findByPk(decoded.id);
            if (!responsavel) {
                return res.status(401).json({ 
                    erro: "NAO_AUTENTICADO", 
                    mensagem: "Responsável não encontrado." 
                });
            }
            req.usuario = {
                id: responsavel.id_responsavel,
                tipo: 'responsavel',
                nome: responsavel.nome_completo,
                email: responsavel.email
            };
        } else {
            const crianca = await Criancas.findByPk(decoded.id);
            if (!crianca) {
                return res.status(401).json({ 
                    erro: "NAO_AUTENTICADO", 
                    mensagem: "Criança não encontrada." 
                });
            }
            req.usuario = {
                id: crianca.id_crianca,
                tipo: 'crianca',
                nome: crianca.nome_completo,
                username: crianca.nome_usuario,
                id_responsavel: crianca.id_responsavel
            };
        }
        
        next();
    } catch (error) {
        return res.status(401).json({ 
            erro: "NAO_AUTENTICADO", 
            mensagem: "Token inválido ou expirado." 
        });
    }
};

exports.requireParent = (req, res, next) => {
    if (req.usuario.tipo !== 'responsavel') {
        return res.status(403).json({ 
            erro: "SEM_PERMISSAO", 
            mensagem: "Acesso restrito a responsáveis." 
        });
    }
    next();
};

exports.requireChild = (req, res, next) => {
    if (req.usuario.tipo !== 'crianca') {
        return res.status(403).json({ 
            erro: "SEM_PERMISSAO", 
            mensagem: "Acesso restrito a crianças." 
        });
    }
    next();
};