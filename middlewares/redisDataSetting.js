const requestPromise = require("request-promise");

// BossRaid 상태값 초기 설정
module.exports = async (req, res, next) => {
  try {
    const redis = await req.app.get("redis");

    const options = {
      url: process.env.URL,
      method: "GET",
    };

    // Redis에 bossRaid가 없다면 데이터 추가
    if (!(await redis.json.get("bossRaid"))) {
      let bossRaid = await requestPromise(options);
      await redis.json.set("bossRaid", "$", bossRaid);
    }

    // Redis에 bossRaidStatus가 없다면 데이터 추가
    if (!(await redis.json.get("bossRaidStatus"))) {
      const bossRaidStatus = {
        canEnter: true,
        enteredUserId: null,
      };
      await redis.json.set("bossRaidStatus", "$", bossRaidStatus);
    }

    if (!(await redis.json.get("enteredBossRaid"))) {
      await redis.json.set("enteredBossRaid", "$", {});
    }
    next();
  } catch (err) {
    next(err);
  }
};
