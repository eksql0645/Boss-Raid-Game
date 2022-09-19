const { Sequelize } = require("sequelize");
const { User } = require("../db");

// DB에서 랭킹 조회
const findRankingListInDB = async (userId) => {
  const ranking = await User.findAll({
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

  // 유저의 랭킹 조회
  const userRank = ranking.filter((ele) => {
    return ele.userId === userId;
  });

  const rankingList = { ranking, userRank };
  return rankingList;
};

// Redis에서 랭킹 조회
const findRankingListInRedis = async (redis) => {
  const rankingList = await redis.json.get("rankingLists");
  return rankingList;
};

module.exports = { findRankingListInDB, findRankingListInRedis };
