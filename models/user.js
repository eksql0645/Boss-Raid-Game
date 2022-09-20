const { User, BossRaidHistory } = require("../db");

// 유저 생성
const createUser = async (userInfo) => {
  const user = await User.create(userInfo);
  return user;
};

// 이메일로 유저 조회
const findUserByEmail = async (email) => {
  const user = await User.findOne({ where: { email } });
  return user;
};

// userId로 유저 조회
const findUserById = async (userId) => {
  const user = await User.findOne({ where: { id: userId } });
  return user;
};

// 유저의 보스레이드 기록 조회
const findHistory = async (userId) => {
  const history = await User.findOne({
    where: { id: userId },
    attributes: ["totalScore"],
    include: [
      {
        model: BossRaidHistory,
        attributes: ["raidRecordId", "score", "enterTime", "endTime"],
      },
    ],
  });
  return history;
};

// 유저의 totalScore 업데이트
const incrementUser = async (incrementInfo) => {
  const { userId, score } = incrementInfo;
  const result = await User.increment(
    { totalScore: score },
    { where: { id: userId } }
  );
  return result;
};

module.exports = {
  createUser,
  findUserByEmail,
  findHistory,
  findUserById,
  incrementUser,
};
