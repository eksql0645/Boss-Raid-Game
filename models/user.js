const { User } = require("../db");

const createUser = async (userInfo) => {
  const user = await User.create(userInfo);
  return user;
};

const findByEmail = async (email) => {
  const userId = await User.findOne({ where: { email } });
  return userId;
};

module.exports = { createUser, findByEmail };
