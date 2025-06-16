// accountController.js
const utilities = require("../utilities/");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const pool = require("../database/");
require("dotenv").config();
const accountModel = require("../models/account-model");

const accountController = {};

/* ****************************************
 *  Deliver registration view
 * ************************************ */
accountController.buildRegister = async (req, res) => {
  let nav = await utilities.getNav();
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
    account_first_name: "",
    account_last_name: "",
    account_email: "",
  });
};

/* ****************************************
 *  Process Registration
 * *************************************** */
accountController.registerAccount = async (req, res) => {
  console.log("Registering account!");
  let nav = await utilities.getNav();
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_password,
  } = req.body;

  try {
    // Hash the password with bcrypt
    const hashedPassword = await bcrypt.hash(account_password, 10); // 10 salt rounds

    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword // Store the hashed password
    );

    console.log(regResult);

    if (regResult) {
      // Create JWT token for the new user
      const tokenPayload = {
        account_id: regResult.account_id,
        account_firstname: regResult.account_firstname,
        account_lastname: regResult.account_lastname,
        account_email: regResult.account_email,
        account_type: regResult.account_type || "Client", // Default to 'Client' if not set
      };

      const accessToken = jwt.sign(
        tokenPayload,
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1h" } // Token expires in 1 hour
      );

      // Set JWT as HTTP-only cookie
      res.cookie("jwt", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development", // Secure in production
        maxAge: 3600000, // 1 hour in milliseconds
        sameSite: "strict",
      });

      req.flash(
        "notice",
        `Congratulations ${account_firstname}, you're now registered and logged in!`
      );
      return res.redirect("/account/login");
    } else {
      throw new Error("Registration failed");
    }
  } catch (error) {
    console.error("Registration error:", error);
    req.flash("notice", "Sorry, the registration failed. Please try again.");
    return res.status(501).render("account/register", {
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    });
  }
};

/* ****************************************
 *  Process login request
 * ************************************ */
accountController.accountLogin = async function (req, res) {
  console.log("Trying to login a user!");

  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;
  const accountData = await accountModel.getAccountByEmail(account_email);

  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.");
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    });
    return;
  }

  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password;
      const accessToken = jwt.sign(
        accountData,
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: 3600 * 1000 }
      );

      res.cookie("jwt", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        maxAge: 3600 * 1000,
      });

      return res.redirect("/account/");
    } else {
      req.flash("notice", "Please check your credentials and try again.");
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      message: "An error occurred during login",
    });
  }
};

/* ****************************************
 *  Deliver login view
 * ************************************ */
accountController.buildLogin = async (req, res) => {
  let nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
    account_email: "",
  });
};

/* ****************************************
 *  Account management view
 * ************************************ */
accountController.buildManagement = async (req, res) => {
  let nav = await utilities.getNav();
  res.render("account/management", {
    title: "Account Management",
    nav,
    errors: null,
  });
};

module.exports = accountController;
