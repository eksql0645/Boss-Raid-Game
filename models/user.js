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

module.exports = {
  createUser,
  findUserByEmail,
  findHistory,
  findUserById,
};
