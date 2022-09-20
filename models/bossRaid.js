const { Sequelize } = require("sequelize");
const { User } = require("../db");

// 전체 랭킹 조회
const findRankingList = async () => {
  const rankingList = await User.findAll({
    order: [["totalScore", "DESC"]],
    attributes: [
      [
        Sequelize.literal("(DENSE_RANK() OVER (ORDER BY totalScore DESC))"),
        "ranking",
      ],
      ["id", "userId"],
      "totalScore",
    ],
    raw: true,
  });
  return rankingList;
};

// 유저의 랭킹 조회
const findUserRanking = async (userId) => {
  // 전체랭킹조회에서 userId에 해당하는 랭킹 정보 가져오기
  const rankingList = await findRankingList();

  const userRanking = rankingList.filter((ele) => {
    return ele.userId === userId;
  });

  return userRanking;
};

// 보스레이드 기록 생성
const createBossRaidHistory = async (historyInfo) => {
  const bossRaidHistory = await User.create(historyInfo);
  return bossRaidHistory;
};

module.exports = { findRankingList, findUserRanking, createBossRaidHistory };
