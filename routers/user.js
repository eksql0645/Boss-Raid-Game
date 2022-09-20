const { Router } = require("express");
const { nanoid } = require("nanoid");
const userRouter = Router();
const { userService } = require("../services");

// 유저 생성
userRouter.post("/", async (req, res, next) => {
  try {
    const { nick, email, password, totalScore } = req.body;

    const userInfo = { nick, email, password, id: nanoid(), totalScore };

    const user = await userService.addUser(userInfo);

    res.status(201).json({ userId: user.id });
  } catch (err) {
    next(err);
  }
});

// 유저의 보스레이드 기록 조회
userRouter.get("/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;
    const history = await userService.getHistory(userId);
    res.status(200).json(history);
  } catch (err) {
    next(err);
  }
});

module.exports = userRouter;
