const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const Mascote = sequelize.define("mascote",{

id_mascote:{
type:DataTypes.INTEGER,
autoIncrement:true,
primaryKey:true
},

nome:{
type:DataTypes.STRING,
allowNull:false
},

descricao:{
type:DataTypes.TEXT
},

preco_xp:{
type:DataTypes.INTEGER,
allowNull:false
},

imagem:{
type:DataTypes.STRING
}

},{
tableName:"mascotes",
timestamps:false
})

module.exports = Mascote