//Route accountRoute.js
const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountController");
const Util = require("../utilities/index");
const { regValidate } = require("../utilities/validation");

// Process the login request
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
);

// Process the registration request
router.post(
  "/register",
  regValidate.registerRules(),
  regValidate.checkRegisterData,
  utilities.handleErrors(accountController.accountRegister)
);

module.exports = router;
