const Sequelize = require("sequelize");
const env = process.env.NODE_ENV || "development";
const config = require("../config/config")[env];

const User = require("./models/user");
const Record = require("./models/record");

const db = {};
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

db.sequelize = sequelize;
db.User = User;
db.Record = Record;

User.init(sequelize);
Record.init(sequelize);

User.associate(db);
Record.associate(db);

module.exports = db;
