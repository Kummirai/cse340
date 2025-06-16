// routes/accountRoute.js
const express = require("express");
const router = new express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities/");
const regValidate = require("../utilities/validation");

// Registration routes
router.get(
  "/register",
  utilities.handleErrors(accountController.buildRegister)
);
router.post(
  "/register",
  utilities.handleErrors(accountController.registerAccount)
);

// Login routes
router.get("/login", utilities.handleErrors(accountController.buildLogin));
router.post("/login", utilities.handleErrors(accountController.accountLogin));

// Account management routes (protected)
router.get(
  "/",
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.buildAccountManagement)
);
router.get(
  "/management",
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.buildAccountManagement)
);

// Logout route
router.get("/logout", utilities.handleErrors(accountController.accountLogout));

module.exports = router;
