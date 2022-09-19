const { Router } = require("express");
const bossRaidRouter = Router();
const { bossRaidService } = require("../services");

// 랭킹 조회
bossRaidRouter.get("/ranking/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;
    const redis = req.app.get("redis");

    const rankingList = await bossRaidService.getRankingList(userId, redis);

    res.status(200).json(rankingList);
  } catch (err) {
    next(err);
  }
});

module.exports = bossRaidRouter;
