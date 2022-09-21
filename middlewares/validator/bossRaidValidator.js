const { body, param } = require("express-validator");
const index = require("./index");
const errorCodes = require("../../utils/errorCodes");

const getRankingValidator = () => {
  return [
    param("userId")
      .notEmpty()
      .bail()
      .withMessage(errorCodes.required)
      .isLength({ max: 50 })
      .withMessage(errorCodes.tooLongString),
    index,
  ];
};

const getEnterStatusValidator = () => {
  return [
    body("userId")
      .notEmpty()
      .bail()
      .withMessage(errorCodes.required)
      .isLength({ max: 50 })
      .withMessage(errorCodes.tooLongString),
    body("level")
      .notEmpty()
      .bail()
      .withMessage(errorCodes.required)
      .isInt({ min: 0, max: 2 })
      .withMessage(errorCodes.canInputLevel),
    index,
  ];
};

const endRaidValidator = () => {
  return [
    body("userId")
      .notEmpty()
      .bail()
      .withMessage(errorCodes.required)
      .isLength({ max: 50 })
      .withMessage(errorCodes.tooLongString),
    body("raidRecordId")
      .notEmpty()
      .bail()
      .withMessage(errorCodes.required)
      .isLength({ max: 50 })
      .withMessage(errorCodes.tooLongString),
    index,
  ];
};

module.exports = {
  getRankingValidator,
  getEnterStatusValidator,
  endRaidValidator,
};
