// routes/accountRoute.js
const express = require("express");
const router = new express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities/");
const regValidate = require("../utilities/validation");
const Util = require("../utilities/");

router.use(utilities.checkJWTToken);

router.get(
  "/register",
  utilities.handleErrors(accountController.buildRegister)
);
router.post(
  "/register",
  utilities.handleErrors(accountController.registerAccount)
);

router.get("/login", utilities.handleErrors(accountController.buildLogin));
router.post("/login", utilities.handleErrors(accountController.accountLogin));

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

router.get("/logout", utilities.handleErrors(accountController.accountLogout));

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
