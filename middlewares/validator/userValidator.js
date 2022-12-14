const { body, param } = require("express-validator");
const index = require("./index");
const errorCodes = require("../../utils/errorCodes");

function userAddValidator() {
  return [
    body("nick")
      .notEmpty()
      .bail()
      .withMessage(errorCodes.required)
      .trim()
      .isLength({ max: 15 })
      .withMessage(errorCodes.wrongFormat),
    body("email")
      .notEmpty()
      .bail()
      .withMessage(errorCodes.required)
      .trim()
      .isEmail()
      .bail()
      .withMessage(errorCodes.wrongEmailFormat)
      .isLength({ max: 25 })
      .withMessage(errorCodes.wrongFormat),
    body("password")
      .notEmpty()
      .bail()
      .withMessage(errorCodes.required)
      .trim()
      .isLength({ min: 8, max: 16 })
      .bail()
      .withMessage(errorCodes.wrongPwdFormat)
      .matches(/[A-za-z]/)
      .bail()
      .withMessage(errorCodes.wrongPwdFormat)
      .matches(/[~!@#$%^&*()_+|<>?:{}]/)
      .bail()
      .withMessage(errorCodes.wrongPwdFormat)
      .matches(/[0-9]/)
      .withMessage(errorCodes.wrongPwdFormat),
    index,
  ];
}

function userGetValidator() {
  return [
    param("userId")
      .notEmpty()
      .bail()
      .withMessage(errorCodes.required)
      .isLength({ max: 50 })
      .withMessage(errorCodes.tooLongString),
    index,
  ];
}

module.exports = { userAddValidator, userGetValidator };
