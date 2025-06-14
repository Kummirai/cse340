//Route accountRoute.js
const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountController");
const Util = require("../utilities/index");
const { validateLogin, validateRegister } = require("../utilities/validation");

// Route to build the login view
router.get("/login", accountController.buildLogin);

// Route to build the register view
router.get("/register", accountController.buildRegister);

// Route to handle login
router.post("/login", Util.validateLogin, accountController.handleLogin);

// Route to handle registration
router.post(
  "/register",
  Util.validateRegister,
  accountController.handleRegister
);
// Route to handle logout
router.get("/logout", accountController.handleLogout);

// Route to build the account management view
router.get(
  "/manage",
  Util.checkLogin,
  accountController.buildAccountManagement
);

// Route to update account information
router.post(
  "/update",
  Util.checkLogin,
  Util.validateUpdateAccount,
  accountController.updateAccount
);

module.exports = router;
