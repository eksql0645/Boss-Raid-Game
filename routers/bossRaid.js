const { Router } = require("express");
const {
  getEnterStatusValidator,
  getRankingValidator,
  endRaidValidator,
} = require("../middlewares/validator/bossRaidValidator");
const bossRaidRouter = Router();
const { bossRaidService } = require("../services");

// 랭킹 조회
bossRaidRouter.get(
  "/ranking/:userId",
  getRankingValidator(),
  async (req, res, next) => {
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
  }
);

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
bossRaidRouter.post("/", getEnterStatusValidator(), async (req, res, next) => {
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

    res.status(200).json(enterStatus);
  } catch (err) {
    next(err);
  }
});

// 보스레이드 종료
bossRaidRouter.patch("/", endRaidValidator(), async (req, res, next) => {
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

/**
 * @swagger
 * paths:
 *   /api/bossraids/{userId}:
 *    get:
 *      summary:  "보스레이드 랭킹 조회"
 *      description: "보스레이드 전체 및 유저 랭킹을 조회합니다."
 *      tags: [BossRaid]
 *      parameters :
 *         - in : path
 *           name : userId
 *           required : true
 *           description : 유저 id
 *           schema :
 *              type : String
 *      responses:
 *        "200":
 *          description: "보스레이드 전체 및 유저 랭킹을 반환합니다."
 *          content:
 *            application/json:
 *              schema:
 *                  type : object
 *                  example:
 *                        {
 *                            "ranking": [
 *                                {
 *                                    "ranking": 1,
 *                                    "userId": "NIq7FTQQ7cf_6X3N1Dti8",
 *                                    "totalScore": 4100
 *                                },
 *                                {
 *                                    "ranking": 2,
 *                                    "userId": "S1f4CvnbpUr2-dLcifzcS",
 *                                    "totalScore": 600
 *                                },
 *                                {
 *                                    "ranking": 3,
 *                                    "userId": "UPEj_StZ6ABw7dfCPtDqk",
 *                                    "totalScore": 300
 *                                },
 *                                {
 *                                    "ranking": 3,
 *                                    "userId": "-NyZapMP_MDfJeVs-C_HJ",
 *                                    "totalScore": 300
 *                                },
 *                            ],
 *                            "userRanking": [
 *                                {
 *                                    "ranking": 1,
 *                                    "userId": "NIq7FTQQ7cf_6X3N1Dti8",
 *                                    "totalScore": 4100
 *                                }
 *                            ]
 *                        }
 *        "400":
 *          description: Bad request
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                example :
 *                  {
 *                    error: [
 *                        {
 *                           message: error.message,
 *                           field: error.name
 *                        }
 *                     ]
 *                  }
 *
 */

/**
 * @swagger
 * paths:
 *   /api/bossraids:
 *    get:
 *      summary:  "보스레이드 상태 조회"
 *      description: "보스레이드 상태를 조회합니다."
 *      tags: [BossRaid]
 *      responses:
 *        "200":
 *          description: "보스레이드 상태를 반환합니다."
 *          content:
 *            application/json:
 *              schema:
 *                  type : object
 *                  example:
 *                    {
 *                        "canEnter": true,
 *                        "enteredUserId": null
 *                    }
 *        "400":
 *          description: Bad request
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                example :
 *                  {
 *                    error: [
 *                        {
 *                           message: error.message,
 *                           field: error.name
 *                        }
 *                     ]
 *                  }
 *
 */

/**
 * @swagger
 * paths:
 *   /api/bossraids:
 *    post:
 *      summary:  "보스레이드 시작"
 *      description: "보스레이드를 시작합니다."
 *      tags: [BossRaid]
 *      parameters :
 *         - in : body
 *           name : data
 *           required : true
 *           description : 생성할 데이터
 *           schema :
 *              type : object
 *              example :
 *                {userId: "wb7BO31yLajL4qT0QQAd5", level: 0}
 *      responses:
 *        "201":
 *          description: "보스레이드 입장 상태를 반환합니다."
 *          content:
 *            application/json:
 *              schema:
 *                  type : object
 *                  example:
 *                    {
 *                        "isEntered": true,
 *                        "raidRecordId": "wgbz0YgJQel6kZ-fUGv4i"
 *                    }
 *        "400":
 *          description: Bad request
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                example :
 *                  {
 *                    error: [
 *                        {
 *                           message: error.message,
 *                           field: error.name
 *                        }
 *                     ]
 *                  }
 *
 */

/**
 * @swagger
 * paths:
 *   /api/bossraids:
 *    patch:
 *      summary:  "보스레이드 종료"
 *      description: "보스레이드를 종료하고 정상 종료 시 보스레이드 기록을 생성하고 유저의 totalScore를 갱신합니다."
 *      tags: [BossRaid]
 *      parameters :
 *         - in : body
 *           name : data
 *           required : true
 *           description : 생성할 데이터
 *           schema :
 *              type : object
 *              example :
 *                {userId: "wb7BO31yLajL4qT0QQAd5", raidRecordId: "gWYKTGIKXlEFTtSKOfkX1"}
 *      responses:
 *        "200":
 *          description: "상태코드만 반환합니다."
 *        "400":
 *          description: Bad request
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                example :
 *                  {
 *                    error: [
 *                        {
 *                           message: error.message,
 *                           field: error.name
 *                        }
 *                     ]
 *                  }
 *
 */

module.exports = bossRaidRouter;
