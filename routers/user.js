const { Router } = require("express");
const { nanoid } = require("nanoid");
const {
  userAddValidator,
  userGetValidator,
} = require("../middlewares/validator/userValidator");
const userRouter = Router();
const { userService } = require("../services");

// 유저 생성
userRouter.post("/", userAddValidator(), async (req, res, next) => {
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
userRouter.get("/:userId", userGetValidator(), async (req, res, next) => {
  try {
    const { userId } = req.params;
    const history = await userService.getHistory(userId);
    res.status(200).json(history);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * paths:
 *   /api/users:
 *    post:
 *      summary:  "유저 생성"
 *      description: "유저를 생성합니다."
 *      tags: [BossRaid]
 *      parameters :
 *         - in : body
 *           name : data
 *           required : true
 *           description : 생성할 데이터
 *           schema :
 *              type : object
 *              example :
 *                {nick: "test", email: "tes00@stest.com", password: "1234"}
 *      responses:
 *        "201":
 *          description: "생성된 userId를 반환합니다."
 *          content:
 *            application/json:
 *              schema:
 *                  type : object
 *                  example:
 *                          {
 *                               "userId": "ZkIDCwTiVwZZEQZ9oSqz8"
 *                          }
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
 *   /api/users/{userId}:
 *    get:
 *      summary:  "유저 보스레이드 기록 조회"
 *      description: "유저의 보스레이드 기록을 조회합니다."
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
 *          description: "유저의 보스레이드 기록을 반환합니다."
 *          content:
 *            application/json:
 *              schema:
 *                  type : object
 *                  example:
 *                        {
 *                            "totalScore": 60,
 *                            "BossRaidHistories": [
 *                                {
 *                                    "raidRecordId": "gWYKTGIKXlEFTtSKOfkX1",
 *                                    "score": 20,
 *                                    "enterTime": "2022-09-20T07:37:23.727Z",
 *                                    "endTime": "2022-09-20T16:37:32+09:00"
 *                                },
 *                                {
 *                                    "raidRecordId": "uHVYTVC21NCnBbe0REpOP",
 *                                    "score": 20,
 *                                    "enterTime": "2022-09-20T07:34:41.913Z",
 *                                    "endTime": "2022-09-20T16:34:52+09:00"
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

module.exports = userRouter;
