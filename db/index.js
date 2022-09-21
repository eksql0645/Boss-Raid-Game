const Sequelize = require("sequelize");
const env = process.env.NODE_ENV || "development";
const config = require("../config/config")[env];

const User = require("./models/user");
const BossRaidHistory = require("./models/bossRaidHistory");

const db = {};
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

db.sequelize = sequelize;
db.User = User;
db.BossRaidHistory = BossRaidHistory;

User.init(sequelize);
BossRaidHistory.init(sequelize);

User.associate(db);
BossRaidHistory.associate(db);

module.exports = db;
