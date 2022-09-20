const { Sequelize } = require("sequelize");
const { User, BossRaidHistory } = require("../db");

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
  const bossRaidHistory = await BossRaidHistory.create(historyInfo);
  return bossRaidHistory;
};

// 보스레이드 기록 조회
const findBossRaidHistory = async (raidRecordId) => {
  const bossRaidHistory = await BossRaidHistory.findOne({
    where: { raidRecordId },
  });
  return bossRaidHistory;
};

// 유저의 totalScore 업데이트
const incrementTotalScore = async (incrementInfo) => {
  const { userId, score } = incrementInfo;
  const result = await User.increment(
    { totalScore: score },
    { where: { id: userId } }
  );
  return result;
};

const getRedis = async (redis, key) => {
  return await redis.json.get(key);
};

const setRedis = async (redis, key, value) => {
  await redis.json.set(key, "$", value);

  // rankingList 캐싱 기간 설정
  if (key === "rankingList") {
    await redis.expire("rankingList", 43200);
  }
  return;
};

module.exports = {
  findRankingList,
  findUserRanking,
  createBossRaidHistory,
  findBossRaidHistory,
  incrementTotalScore,
  getRedis,
  setRedis,
};
