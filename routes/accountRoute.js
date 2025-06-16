const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountController");
const authController = require("../controllers/authController");
const { authenticate } = require("../middleware/authMiddleware");
const regValidate = require("../utilities/validation"); // Make sure this path is correct

// GET Routes
router.get("/register", accountController.showRegistrationForm);
router.get("/login", accountController.showLoginForm);
router.get("/logout", authController.logout);
router.get(
  "/management",
  authenticate,
  accountController.showAccountManagement
);
router.get("/update", authenticate, accountController.showUpdateAccountForm);

// POST Routes
router.post(
  "/register",
  regValidate.registerRules(),
  regValidate.checkRegisterData,
  accountController.register // Make sure this matches your controller method name
);

router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  authController.login // Make sure this exists in authController
);

router.post("/update", authenticate, accountController.updateAccount);

module.exports = router;
