// accountController.js
const utilities = require("../utilities/");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const pool = require("../database/");
require("dotenv").config();

// Import your account model (adjust path as needed)
// const accountModel = require("../models/account-model");

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
 *  Process registration request
 * ************************************ */
accountController.accountRegister = async (req, res) => {
  let nav = await utilities.getNav();
  const {
    account_first_name,
    account_last_name,
    account_email,
    account_password,
  } = req.body;

  // Check if the email already exists
  const existingAccount = await accountModel.getAccountByEmail(account_email);
  if (existingAccount) {
    req.flash("notice", "An account with that email already exists.");
    return res.status(400).render("account/register", {
      title: "Register",
      nav,
      errors: null,
      account_first_name,
      account_last_name,
      account_email,
    });
  }

  // Hash the password
  const hashedPassword = await utilities.hashPassword(account_password);

  // Create the new account
  const newAccount = {
    account_first_name,
    account_last_name,
    account_email,
    account_password: hashedPassword,
  };

  try {
    const result = await accountModel.createAccount(newAccount);
    if (result) {
      req.flash("success", "Registration successful. Please log in.");
      return res.redirect("/account/login");
    }
  } catch (error) {
    console.error("Error creating account:", error);
    req.flash("error", "An error occurred while creating your account.");
    return res.status(500).render("account/register", {
      title: "Register",
      nav,
      errors: null,
      account_first_name,
      account_last_name,
      account_email,
    });
  }
};

/* ****************************************
 *  Process login request
 * ************************************ */
accountController.accountLogin = async (req, res) => {
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;
  const accountData = await accountModel.getAccountByEmail(account_email);

  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.");
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    });
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
    }

    req.flash("notice", "Please check your credentials and try again.");
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    });
  } catch (error) {
    console.error("Login error:", error);
    req.flash("error", "Access Forbidden");
    return res.status(500).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
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

module.exports = accountController;
