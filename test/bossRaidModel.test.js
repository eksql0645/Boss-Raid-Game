/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
jest.mock("../db/models/user");
jest.mock("../db/models/bossRaidHistory");
const User = require("../db/models/user");
const BossRaidHistory = require("../db/models/bossRaidHistory");
const testData = require("./bossRaidTestData");
let {
  findRankingList,
  findUserRanking,
  createBossRaidHistory,
  findBossRaidHistory,
  incrementTotalScore,
} = require("../models/bossRaid");

describe("findRankingList", () => {
  test("전체 랭킹을 조회한다.", async () => {
    const rankingList = testData.rankingList;
    User.findAll.mockReturnValue(rankingList);
    expect(await findRankingList()).toEqual(rankingList);
  });
});

describe.only("findUserRanking", () => {
  test("유저 랭킹을 조회한다.", async () => {
    const userRanking = testData.userRanking;
    const userId = testData.userId;
    findUserRanking = jest.fn(() => userRanking);
    expect(await findUserRanking(userId)).toEqual(userRanking);
  });
});

describe("createBossRaidHistory", () => {
  test("보스레이드 기록을 생성한다.", async () => {
    const bossRaidStatus = testData.bossRaidStatus;
    const historyInfo = testData.historyInfo;
    BossRaidHistory.create.mockReturnValue(bossRaidStatus);

    expect(await createBossRaidHistory(historyInfo)).toEqual(bossRaidStatus);
  });
});

describe("findBossRaidHistory", () => {
  test("보스레이드 기록을 조회한다.", async () => {
    const raidRecordId = testData.raidRecordId;
    const bossRaidHistory = testData.bossRaidHistory;
    BossRaidHistory.findOne.mockReturnValue(bossRaidHistory);
    expect(await findBossRaidHistory(raidRecordId)).toEqual(bossRaidHistory);
  });
});

describe("incrementTotalScore", () => {
  const incrementInfo = testData.incrementInfo;

  const result = [[undefined, 1]];
  test("유저의 보스레이드 기록을 반환한다.", async () => {
    User.increment.mockReturnValue(result);

    expect(await incrementTotalScore(incrementInfo)).toEqual(result);
  });
});
