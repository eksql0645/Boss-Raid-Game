const { User, BossRaidHistory } = require("../db");

const createUser = async (userInfo) => {
  const user = await User.create(userInfo);
  return user;
};

const findUserByEmail = async (email) => {
  const user = await User.findOne({ where: { email } });
  return user;
};

const findUserById = async (userId) => {
  const user = await User.findOne({ where: { id: userId } });
  return user;
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

module.exports = { createUser, findUserByEmail, findHistory, findUserById };
