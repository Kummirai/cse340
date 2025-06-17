// accountController.js
const utilities = require("../utilities/");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();
const accountModel = require("../models/account-model");

const accountController = {};

/* ****************************************
 *  Create jwt token
 * ************************************ */
const accessToken = (id) => {
  return jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1h",
  });
};

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
    const hashedPassword = await bcrypt.hash(account_password, 10);

    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    );
    const token = accessToken(regResult.id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: 3600000 });

    if (regResult) {
      req.flash(
        "notice",
        `Congratulations ${account_firstname}, you're now registered! Please log in.`
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

  try {
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

    if (await bcrypt.compare(account_password, accountData.account_password)) {
      // Create token payload (remove sensitive data)
      const tokenPayload = {
        account_id: accountData.account_id,
        account_firstname: accountData.account_firstname,
        account_lastname: accountData.account_lastname,
        account_email: accountData.account_email,
        account_type: accountData.account_type || "Client",
      };

      // Set cookie
      res.cookie("jwt", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 3600000,
        sameSite: "Lax",
        path: "/",
      });

      req.flash("notice", `Welcome back, ${tokenPayload.account_firstname}!`);

      // Redirect to account page - middleware will handle setting res.locals.user
      return res.redirect("/account/");
    } else {
      req.flash("notice", "Please check your credentials and try again.");
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      });
    }
  } catch (error) {
    console.error("Login error:", error);
    req.flash("notice", "An error occurred during login.");
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

/* ****************************************
 *  Account management view
 * ************************************ */
accountController.buildAccountManagement = async function (req, res) {
  let nav = await utilities.getNav();

  console.log("Current user data:", res.locals.user); // Debug log

  if (!res.locals.user) {
    req.flash("notice", "Please log in to access your account.");
    return res.redirect("/account/login");
  }

  res.render("account/management", {
    title: "Account Management",
    nav,
    errors: null,
    ...res.locals.user,
  });
};

/* ****************************************
 *  Handle logout
 * ************************************ */
accountController.accountLogout = async (req, res) => {
  res.clearCookie("jwt");
  res.locals.user = null;
  res.locals.loggedin = 0;
  req.flash("notice", "You have been logged out.");
  res.redirect("/");
};

module.exports = accountController;
