const Cofre = require("../models/CofreMeta")

exports.criarMeta = async(req,res)=>{

try{

const {titulo,descricao,valor_meta,id_crianca} = req.body

const meta = await Cofre.create({

titulo,
descricao,
valor_meta,
id_crianca

})

res.json({

mensagem:"Meta criada",
meta

})

}catch(e){

res.status(500).json({
erro:"Erro criar meta"
})

}

}

exports.verMetas = async(req,res)=>{

try{

const {id_crianca} = req.params

const metas = await Cofre.findAll({

where:{id_crianca}

})

res.json(metas)

}catch(e){

res.status(500).json({
erro:"Erro buscar metas"
})

}

}

//////////////////////////////////////////////////

exports.depositar = async(req,res)=>{

try{

const {id_meta,valor} = req.body

const meta = await Cofre.findByPk(id_meta)

if(!meta){

return res.status(404).json({
erro:"Meta não encontrada"
})

}

const novoValor = meta.valor_atual + valor

let status = "ativa"

if(novoValor >= meta.valor_meta){

status = "concluida"

}

await meta.update({

valor_atual:novoValor,
status

})

res.json({

mensagem:"Valor depositado",
valor_atual:novoValor

})

}catch(e){

res.status(500).json({
erro:"Erro depositar"
})

}

}