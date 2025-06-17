// routes/accountRoute.js
const express = require("express");
const router = new express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities/");
const regValidate = require("../utilities/validation");
const Util = require("../utilities/");

// Apply JWT check to all account routes
router.use(utilities.checkJWTToken);
// router.use("*", Util.checkCurrentUser);

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

// Add these new routes
router.get(
  "/update/:account_id",
  utilities.checkJWTToken,
  utilities.handleErrors(accountController.buildUpdateView)
);

router.post(
  "/update-info",
  utilities.checkJWTToken,
  utilities.handleErrors(accountController.updateAccountInfo)
);

router.post(
  "/update-password",
  utilities.checkJWTToken,
  utilities.handleErrors(accountController.updatePassword)
);

module.exports = router;
