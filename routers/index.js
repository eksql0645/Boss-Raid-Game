const { Router } = require("express");
const router = Router();
const userRouter = require("./user");
const bossRaidRouter = require("./bossRaid");

router.use("/users", userRouter);
router.use("/bossraids", bossRaidRouter);

module.exports = router;
