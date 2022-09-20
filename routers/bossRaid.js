const { Router } = require("express");
const bossRaidRouter = Router();
const { bossRaidService } = require("../services");

// 랭킹 조회
bossRaidRouter.get("/ranking/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;
    const redis = req.app.get("redis");

    // Redis에서 rankingList 확인
    let rankingList = await redis.json.get("rankingList");

    // Redis에 rankingList가 없으면 DB 조회 후 Redis에 캐싱
    if (!rankingList) {
      rankingList = await bossRaidService.getRankingList(redis);
    }

    // 유저랭킹조회는 DB 통해 진행
    const userRanking = await bossRaidService.getUserRanking(userId);
    const result = { ranking: rankingList, userRanking };

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

// 보스레이드 상태 조회
bossRaidRouter.get("/", async (req, res, next) => {
  try {
    const redis = req.app.get("redis");
    const bossRaidStatus = await bossRaidService.getBossRaidStatus(redis);
    res.status(200).json(bossRaidStatus);
  } catch (err) {
    next(err);
  }
});

// 보스레이드 게임 시작
bossRaidRouter.post("/", async (req, res, next) => {
  try {
    const { userId, level } = req.body;
    const redis = req.app.get("redis");

    const enterInfo = {
      userId,
      level: parseInt(level),
    };

    const enterStatus = await bossRaidService.getBossRaidEnterStatus(
      redis,
      enterInfo
    );

    res.status(201).json(enterStatus);
  } catch (err) {
    next(err);
  }
});

// 보스레이드 종료
bossRaidRouter.patch("/", async (req, res, next) => {
  try {
    const { userId, raidRecordId } = req.body;
    const historyInfo = { userId, raidRecordId };
    const redis = req.app.get("redis");

    await bossRaidService.addBossRaidHistory(redis, historyInfo);
    res.status(200).end();
  } catch (err) {
    next(err);
  }
});

module.exports = bossRaidRouter;
