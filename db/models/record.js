const { nanoid } = require("nanoid");
const Sequelize = require("sequelize");

module.exports = class Record extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        raidRecordId: {
          type: Sequelize.STRING,
          allowNull: false,
          primaryKey: true,
          defaultValue: nanoid(8),
        },
        level: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        score: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        enterTime: {
          type: Sequelize.STRING(20),
          allowNull: false,
        },
        endTime: {
          type: Sequelize.STRING(20),
          allowNull: true,
        },
      },
      {
        sequelize,
        timestamps: false,
        underscored: false,
        modelName: "Record",
        tableName: "records",
        paranoid: true,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }
  static associate(db) {
    db.Record.belongsTo(db.User, {
      foreignKey: "userId",
      targetKey: "id",
    });
  }
};
