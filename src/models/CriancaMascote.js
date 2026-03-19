const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const CriancaMascote = sequelize.define("crianca_mascote",{

id:{
type:DataTypes.INTEGER,
autoIncrement:true,
primaryKey:true
},

id_crianca:{
type:DataTypes.INTEGER,
allowNull:false
},

id_mascote:{
type:DataTypes.INTEGER,
allowNull:false
}

},{
tableName:"crianca_mascote",
timestamps:true
})

module.exports = CriancaMascote