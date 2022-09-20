const { bossRaidModel, userModel } = require("../models");
const errorCodes = require("../utils/errorCodes");

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
  return userRanking;
};

module.exports = { getRankingList, getUserRanking };
