const Sequelize = require("sequelize");

module.exports = class User extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        id: {
          type: Sequelize.STRING,
          allowNull: false,
          primaryKey: true,
        },
        nick: {
          type: Sequelize.STRING(15),
          allowNull: false,
        },
        email: {
          type: Sequelize.STRING(25),
          allowNull: false,
          unique: true,
        },
        password: {
          type: Sequelize.STRING(70),
          allowNull: false,
        },
        totalScore: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: false,
        modelName: "User",
        tableName: "users",
        paranoid: true,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }
  static associate(db) {
    db.User.hasMany(db.BossRaidHistory, {
      foreignKey: "userId",
      sourceKey: "id",
    });
  }
};
