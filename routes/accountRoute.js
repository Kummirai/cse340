// routes/accountRoute.js
const express = require("express");
const router = new express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities/");
const regValidate = require("../utilities/validation");

// Apply JWT check to all account routes
router.use(utilities.checkJWTToken);

// Registration routes (public)
router.get(
  "/register",
  utilities.handleErrors(accountController.buildRegister)
);
router.post(
  "/register",
  utilities.handleErrors(accountController.registerAccount)
);

// Login routes (public)
router.get("/login", utilities.handleErrors(accountController.buildLogin));
router.post("/login", utilities.handleErrors(accountController.accountLogin));

// Account management routes (protected)
router.get(
  "/",
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountManagement)
);

router.get(
  "/management",
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountManagement)
);

// Logout route
router.get("/logout", utilities.handleErrors(accountController.accountLogout));

module.exports = router;
