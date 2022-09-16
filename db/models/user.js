const { nanoid } = require("nanoid");
const Sequelize = require("sequelize");

module.exports = class User extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        id: {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: nanoid(8),
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
          type: Sequelize.STRING(45),
          allowNull: false,
        },
        totalScore: {
          type: Sequelize.STRING(10),
          allowNull: true,
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
    db.User.hasMany(db.Record, {
      foreignKey: "userId",
      sourceKey: "id",
    });
  }
};
