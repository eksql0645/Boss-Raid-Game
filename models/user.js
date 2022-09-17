const { User, BossRaidHistory } = require("../db");

const createUser = async (userInfo) => {
  const user = await User.create(userInfo);
  return user;
};

const findUserByEmail = async (email) => {
  const userId = await User.findOne({ where: { email } });
  return userId;
};

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

module.exports = { createUser, findUserByEmail, findHistory };
