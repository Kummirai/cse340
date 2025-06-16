// accountRoute.js
const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountController");
const authController = require("../controllers/authController");
const regValidate = require("../utilities/validation");
const { authenticate, authorize } = require("../middleware/authMiddleware");

// Public routes
router.get("/register", accountController.showRegistrationForm);
router.get("/login", accountController.showLoginForm);

// Registration process
router.post(
  "/register",
  regValidate.registerRules(),
  regValidate.checkRegisterData,
  accountController.register
);

// Authentication routes
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  authController.login
);

router.get("/logout", authController.logout);

// Protected routes (require authentication)
router.get(
  "/management",
  authenticate,
  accountController.showAccountManagement
);

module.exports = router;
