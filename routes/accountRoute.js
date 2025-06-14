//Route accountRoute.js
const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountController");
const Util = require("../utilities/index");
const { validateLogin, validateRegister } = require("../utilities/validation");

// Process the login request
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
);

module.exports = router;
