const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const CofreMeta = sequelize.define("cofre_meta",{

id_meta:{
type:DataTypes.INTEGER,
autoIncrement:true,
primaryKey:true
},

titulo:{
type:DataTypes.STRING,
allowNull:false
},

descricao:{
type:DataTypes.TEXT
},

valor_meta:{
type:DataTypes.INTEGER,
allowNull:false
},

valor_atual:{
type:DataTypes.INTEGER,
defaultValue:0
},

status:{
type:DataTypes.ENUM(
"ativa",
"concluida"
),
defaultValue:"ativa"
},

id_crianca:{
type:DataTypes.INTEGER,
allowNull:false
}

},{
tableName:"cofre_meta",
timestamps:true
})

module.exports = CofreMeta