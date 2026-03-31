const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  "kamba_kid_pay3",
  "root",
  "",
  {
    host: "localhost",
    dialect: "mysql",
    logging: false
  },
);

module.exports = sequelize;