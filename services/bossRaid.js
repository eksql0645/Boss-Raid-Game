const { bossRaidModel, userModel } = require("../models");
const errorCodes = require("../utils/errorCodes");
const { nanoid } = require("nanoid");
const moment = require("moment");
const resetData = require("../utils/resetData");
const { setRedis, getRedis } = require("../models/bossRaid");

// 전체 랭킹 조회
const getRankingList = async (redis) => {
  // DB에서 랭킹 조회
  const rankingList = await bossRaidModel.findRankingList();

  if (!rankingList[0]) {
    throw new Error(errorCodes.serverError);
  }

  // Redis에 rankingList 캐싱
  await setRedis(redis, "rankingList", rankingList);

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
  const bossRaidStatus = await getRedis(redis, "bossRaidStatus");
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
  const bossRaidData = JSON.parse(await getRedis(redis, "bossRaid"))
    .bossRaids[0];
  const bossRaidlevels = bossRaidData.levels[level];
  const bossRaidLevel = bossRaidlevels.level;
  const score = bossRaidlevels.score;
  const enterTime = moment();

  // 레벨 확인
  if (!(level === bossRaidLevel)) {
    throw new Error(errorCodes.canNotFindLevel);
  }

  // lock
  await redis.watch("enteredBossRaid", "bossRaidStatus");

  // 게임 종료시 기록 생성에 사용할 임시 enterData 생성
  await redis
    .multi()
    .json.set("enteredBossRaid", "$", {
      raidRecordId: nanoid(),
      enterTime,
      endTime: null,
      score,
      userId,
    })
    .json.set("bossRaidStatus", "$", {
      canEnter: false,
      enteredUserId: userId,
    })
    .exec();

  const enteredBossRaid = await getRedis(redis, "enteredBossRaid");

  return { isEntered: true, raidRecordId: enteredBossRaid.raidRecordId };
};

// 보스레이드 종료
const addBossRaidHistory = async (redis, historyInfo) => {
  const { userId, raidRecordId } = historyInfo;

  // 종료 확인
  const closedRaid = await bossRaidModel.findBossRaidHistory(raidRecordId);
  if (closedRaid) {
    resetData(redis);
    throw new Error(errorCodes.alreadyClosedBossRaid);
  }

  // 요청정보와 입장한 보스레이드의 정보 일치 확인
  const enteredBossRaid = await getRedis(redis, "enteredBossRaid");

  if (!enteredBossRaid) {
    throw new Error(errorCodes.canNotFindEnterData);
  }
  if (userId !== enteredBossRaid.userId) {
    throw new Error(errorCodes.doNotMatchUser);
  }
  if (raidRecordId !== enteredBossRaid.raidRecordId) {
    throw new Error(errorCodes.doNotMatchBossRaid);
  }

  // 시간 측정
  const limitTime = JSON.parse(await getRedis(redis, "bossRaid")).bossRaids[0]
    .bossRaidLimitSeconds;
  const enterTime = enteredBossRaid.enterTime;
  const endTime = moment();
  const gap = endTime.diff(enterTime, "seconds");

  // 시간 초과 시 예외처리
  if (gap > limitTime) {
    resetData(redis);
    throw new Error(errorCodes.timeOver);
  }

  historyInfo = enteredBossRaid;
  historyInfo.endTime = endTime.format();

  const bossRaidHistory = await bossRaidModel.createBossRaidHistory(
    historyInfo
  );

  if (!bossRaidHistory) {
    throw new Error(errorCodes.failedCreateHistory);
  }

  // 정상 종료 시 score 유저 totalScore에 반영
  const incrementInfo = {
    userId,
    score: bossRaidHistory.score,
  };
  const result = await bossRaidModel.incrementTotalScore(incrementInfo);
  if (!result[0][1]) {
    throw new Error(errorCodes.doNotUpdateScore);
  }

  // 보스레이드 상태와 입장한 보스레이드 데이터를 초기화한다.
  resetData(redis);
  return;
};

module.exports = {
  getRankingList,
  getUserRanking,
  getBossRaidStatus,
  getBossRaidEnterStatus,
  addBossRaidHistory,
};
