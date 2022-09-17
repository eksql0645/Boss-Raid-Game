const { Router } = require("express");
const userRouter = Router();
const { userService } = require("../services");

// 유저 생성
userRouter.post("/", async (req, res, next) => {
  try {
    const { nick, email, password } = req.body;

    const userInfo = { nick, email, password };

    const user = await userService.addUser(userInfo);

    res.status(201).json({ userId: user.id });
  } catch (err) {
    next(err);
  }
});

module.exports = userRouter;
