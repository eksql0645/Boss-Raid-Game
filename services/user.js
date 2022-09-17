const { userModel } = require("../models");
const errorCodes = require("../utils/errorCodes");
const bcrypt = require("bcrypt");

// 유저 생성
const addUser = async (userInfo) => {
  const { email, password } = userInfo;

  // 해당 email로 가입한 user가 있는지 확인
  let user = await userModel.findByEmail(email);
  if (user) {
    throw new Error(errorCodes.AlreadySignUpEmail);
  }

  // 비밀번호 해쉬화
  const hashedPassword = await bcrypt.hash(password, 8);
  userInfo.password = hashedPassword;

  user = await userModel.createUser(userInfo);
  return user;
};

module.exports = { addUser };
