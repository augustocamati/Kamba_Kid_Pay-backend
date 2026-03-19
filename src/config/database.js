const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  "kamba_kid_pay2",
  "root",
  "",
  {
    host: "localhost",
    dialect: "mysql",
    logging: false
  },
);

module.exports = sequelize;