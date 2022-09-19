const { bossRaidModel, userModel } = require("../models");
const errorCodes = require("../utils/errorCodes");

// 랭킹 조회
const getRankingList = async (userId) => {
  // 유저 존재 확인
  const user = await userModel.findUserById(userId);
  if (!user) {
    throw new Error(errorCodes.canNotFindUser);
  }
  const rankingList = await bossRaidModel.findRankingList(userId);
  if (rankingList.ranking.length === 0) {
    throw new Error(errorCodes.serverError);
  }
  return rankingList;
};
module.exports = { getRankingList };
