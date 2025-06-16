//Route accountRoute.js
const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities/index");
const regValidate = require("../utilities/validation");

// Process the login request
router.post(
  "/login",
  // regValidate.loginRules(),
  regValidate.checkLoginData,
  accountController.accountLogin
);

// Process the registration request
router.post(
  "/register",
  // regValidate.registerRules(),
  regValidate.checkRegisterData,
  utilities.handleErrors(accountController.registerAccount)
);

// render the registration page
router.get(
  "/register",
  utilities.handleErrors(accountController.buildRegister)
);

// render the login page
router.get("/login", utilities.handleErrors(accountController.buildLogin));

//render the management page
router.get(
  "/",
  utilities.handleErrors(accountController.buildManagement)
);

module.exports = router;
