const { userModel } = require("../models");
const errorCodes = require("../utils/errorCodes");
const bcrypt = require("bcrypt");

// 유저 생성
const addUser = async (userInfo) => {
  const { email, password } = userInfo;

  // 해당 email로 가입한 user가 있는지 확인
  let user = await userModel.findUserByEmail(email);
  if (user) {
    throw new Error(errorCodes.alreadySignUpEmail);
  }

  // 비밀번호 해쉬화
  const hashedPassword = await bcrypt.hash(password, 8);
  userInfo.password = hashedPassword;

  user = await userModel.createUser(userInfo);
  return user;
};

// 유저의 보스레이드 기록 조회
const getHistory = async (userId) => {
  const history = await userModel.findHistory(userId);
  if (!history) {
    throw new Error(errorCodes.canNotFindHistory);
  }
  return history;
};

module.exports = { addUser, getHistory };
