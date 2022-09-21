/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
jest.mock("../db/models/user");
jest.mock("../db/models/bossRaidHistory");
const User = require("../db/models/user");
const BossRaidHistory = require("../db/models/bossRaidHistory");
const testData = require("./userTestData");
const {
  createUser,
  findUserByEmail,
  findUserById,
  findHistory,
} = require("../models/user");

describe("createUser", () => {
  const userInfo = testData.userInfo;
  const user = testData.user;

  test("user를 반환한다.", async () => {
    User.create.mockReturnValue(user);
    expect(await createUser(userInfo)).toEqual(user);
  });
});

describe("findUserByEmail", () => {
  const email = testData.email;
  const user = testData.user;

  test("user를 반환한다.", async () => {
    User.findOne.mockReturnValue(user);
    expect(await findUserByEmail(email)).toEqual(user);
  });
});

describe("findUserById", () => {
  const userId = testData.userId;
  const user = testData.user;

  test("user를 반환한다.", async () => {
    User.findOne.mockReturnValue(user);
    expect(await findUserById(userId)).toEqual(user);
  });
});

describe("findHistory", () => {
  const userId = testData.userId;
  const history = testData.history;

  test("유저의 보스레이드 기록을 반환한다.", async () => {
    User.findOne.mockReturnValue(history);
    expect(await findHistory(userId)).toEqual(history);
  });
});
