const { bossRaidModel, userModel } = require("../models");
const errorCodes = require("../utils/errorCodes");
const { nanoid } = require("nanoid");
const moment = require("moment");

// 전체 랭킹 조회
const getRankingList = async (redis) => {
  // DB에서 랭킹 조회
  const rankingList = await bossRaidModel.findRankingList();

  if (!rankingList[0]) {
    throw new Error(errorCodes.serverError);
  }

  // Redis에 rankingList 캐싱
  await redis.json.set("rankingList", "$", rankingList);

  // rankingList 캐싱 기간 설정
  await redis.expire("rankingList", 43200);

  return rankingList;
};

// 유저 랭킹 조회
const getUserRanking = async (userId) => {
  // 유저 존재 확인
  const user = await userModel.findUserById(userId);
  if (!user) {
    throw new Error(errorCodes.canNotFindUser);
  }

  const userRanking = await bossRaidModel.findUserRanking(userId);
  if (!userRanking) {
    throw new Error(errorCodes.serverError);
  }

  return userRanking;
};

// 보스레이드 상태 조회
const getBossRaidStatus = async (redis) => {
  const bossRaidStatus = await redis.json.get("bossRaidStatus");

  if (!bossRaidStatus) {
    throw new Error(errorCodes.serverError);
  }

  return bossRaidStatus;
};

// 보스레이드 게임 시작
const getBossRaidEnterStatus = async (redis, enterInfo) => {
  const { userId, level } = enterInfo;

  // canEnter가 false라면 레이드 시작 불가
  const bossRaidStatus = await getBossRaidStatus(redis);

  if (!bossRaidStatus.canEnter) {
    return { isEntered: false };
  }

  // 유저 확인
  const user = await userModel.findUserById(userId);
  if (!user) {
    throw new Error(errorCodes.canNotFindUser);
  }

  // 보스레이드 데이터 가져오기
  const bossRaidData = JSON.parse(await redis.json.get("bossRaid"))
    .bossRaids[0];
  const enterTime = moment().format();
  const bossRaidLevel = bossRaidData.levels[level].level;
  const score = bossRaidLevel.score;

  // 레벨 확인
  if (!(level === bossRaidLevel)) {
    throw new Error(errorCodes.canNotFindLevel);
  }

  // lock
  await redis.watch("bossRaidEnterData", "bossRaidStatus");

  // 게임 종료시 기록 생성에 사용할 임시 enterData 생성
  await redis
    .multi()
    .json.set("bossRaidEnterData", "$", {
      raidRecordId: nanoid(),
      enterTime,
      score,
      userId,
    })
    .json.set("bossRaidStatus", "$", {
      canEnter: false,
      enteredUserId: userId,
    })
    .exec();

  const bossRaidEnterData = await redis.json.get("bossRaidEnterData");

  return { isEntered: true, raidRecordId: bossRaidEnterData.raidRecordId };
};

module.exports = {
  getRankingList,
  getUserRanking,
  getBossRaidStatus,
  getBossRaidEnterStatus,
};
