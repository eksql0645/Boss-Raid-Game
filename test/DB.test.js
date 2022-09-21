/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const Sequelize = require("sequelize");
const User = require("../db/models/user");
const BossRaidHistory = require("../db/models/bossRaidHistory");
const config = require("../config/config")["test"];
const should = require("should");

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

describe("User 모델 테스트", () => {
  test("static init 메서드 호출", () => {
    expect(User.init(sequelize)).toBe(User);
  });
  test("static associate 메서드 호출", () => {
    const db = {
      User: {
        hasMany: jest.fn(),
      },
      BossRaidHistory: {},
    };
    User.associate(db);
    expect(db.User.hasMany).toHaveBeenCalledWith(db.BossRaidHistory, {
      foreignKey: "userId",
      sourceKey: "id",
    });
  });
});

describe("BossRaidHistory 모델 테스트", () => {
  test("static init 메서드 호출", () => {
    expect(BossRaidHistory.init(sequelize)).toBe(BossRaidHistory);
  });
  test("static associate 메서드 호출", () => {
    const db = {
      User: {},
      BossRaidHistory: {
        belongsTo: jest.fn(),
      },
    };
    BossRaidHistory.associate(db);
    expect(db.BossRaidHistory.belongsTo).toHaveBeenCalledWith(db.User, {
      foreignKey: "userId",
      targetKey: "id",
    });
  });
});
