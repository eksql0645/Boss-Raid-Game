const Sequelize = require("sequelize");

module.exports = class BossRaidHistory extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        raidRecordId: {
          type: Sequelize.STRING,
          allowNull: false,
          primaryKey: true,
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
        modelName: "BossRaidHistory",
        tableName: "boss_raid_histories",
        paranoid: true,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }
  static associate(db) {
    db.BossRaidHistory.belongsTo(db.User, {
      foreignKey: "userId",
      targetKey: "id",
    });
  }
};
