const resetData = async (redis) => {
  await redis.json.set("bossRaidStatus", "$", {
    canEnter: true,
    enteredUserId: null,
  });
  await redis.json.set("enteredBossRaid", "$", {});
};

module.exports = resetData;
