// accountController.js
const utilities = require("../utilities/");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const accountModel = require("../models/account-model");
require("dotenv").config();

// Password validation function
const validatePassword = (password) => {
  const minLength = password.length >= 12;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  return {
    valid: minLength && hasUpperCase && hasNumber && hasSpecialChar,
    requirements: {
      minLength,
      hasUpperCase,
      hasNumber,
      hasSpecialChar,
    },
  };
};

const accountController = {};

/* ****************************************
 *  Deliver registration view
 * ************************************ */
accountController.buildRegister = async (req, res) => {
  let nav = await utilities.getNav();
  res.render("account/register", {
    title: "Registration",
    message: req.flash("notice"),
    nav,
    errors: null,
    account_firstname: "",
    account_lastname: "",
    account_email: "",
  });
};

/* ****************************************
 *  Process Registration
 * *************************************** */
accountController.registerAccount = async (req, res) => {
  let nav = await utilities.getNav();
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_password,
  } = req.body;

  // Validate password complexity
  const passwordValidation = validatePassword(account_password);
  if (!passwordValidation.valid) {
    req.flash(
      "notice",
      "Password must be at least 12 characters with 1 uppercase letter, 1 number, and 1 special character"
    );
    return res.status(400).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
      account_firstname,
      account_lastname,
      account_email,
    });
  }

  try {
    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(account_password, 10);

    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    );

    if (regResult) {
      // Generate JWT token for immediate login after registration
      const accountData = await accountModel.getAccountByEmail(account_email);
      delete accountData.account_password;

      const accessToken = jwt.sign(
        accountData,
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1h" }
      );

      res.cookie("jwt", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        maxAge: 3600000, // 1 hour
      });

      req.flash(
        "notice",
        `Congratulations, you're registered ${account_firstname}. You are now logged in.`
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
      errors: null,
      account_firstname,
      account_lastname,
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

    // Compare hashed password with input password
    const passwordMatch = await bcrypt.compare(
      account_password,
      accountData.account_password
    );
    if (!passwordMatch) {
      req.flash("notice", "Please check your credentials and try again.");
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      });
    }

    // Create JWT token
    delete accountData.account_password;
    const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "1h",
    });

    // Set cookie with token
    res.cookie("jwt", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      maxAge: 3600000, // 1 hour
    });

    return res.redirect("/account/");
  } catch (error) {
    console.error("Login error:", error);
    req.flash("notice", "An error occurred during login. Please try again.");
    return res.status(500).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    });
  }
};

/* ****************************************
 *  Deliver account management view
 * ************************************ */
accountController.buildAccountManagement = async (req, res) => {
  let nav = await utilities.getNav();
  res.render("account/account-management", {
    title: "Account Management",
    nav,
    account: req.user,
  });
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
    message: req.flash("notice"),
  });
};

/* ****************************************
 *  Process logout request
 * ************************************ */
accountController.accountLogout = async (req, res) => {
  res.clearCookie("jwt");
  req.flash("notice", "You have been logged out.");
  res.redirect("/");
};

module.exports = accountController;
