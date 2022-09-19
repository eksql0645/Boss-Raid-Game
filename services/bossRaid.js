const { bossRaidModel, userModel } = require("../models");
const errorCodes = require("../utils/errorCodes");

// 랭킹 조회
const getRankingList = async (userId, redis) => {
  // 유저 존재 확인
  const user = await userModel.findUserById(userId);
  if (!user) {
    throw new Error(errorCodes.canNotFindUser);
  }

  // ============ 이부분을 12시간마다 돌리기 ==============

  // DB에서 랭킹 조회
  let rankingList = await bossRaidModel.findRankingListInDB(userId);
  if (rankingList.ranking.length === 0) {
    throw new Error(errorCodes.serverError);
  }

  // Redis에 랭킹 리스트 캐싱
  await redis.json.set("rankingLists", "$", rankingList);
  // =====================================================

  // Redis에서 랭킹 조회
  rankingList = await bossRaidModel.findRankingListInRedis(redis);
  if (!rankingList) {
    throw new Error(errorCodes.serverError);
  }
  return rankingList;
};

module.exports = { getRankingList };
