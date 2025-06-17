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

// Add these new controller methods
accountController.buildUpdateView = async (req, res) => {
  let nav = await utilities.getNav();
  const accountId = req.params.account_id;

  try {
    const accountData = await accountModel.getAccountById(accountId);

    res.render("account/update", {
      title: "Update Account",
      nav,
      account_id: accountId,
      account_firstname: accountData.account_firstname,
      account_lastname: accountData.account_lastname,
      account_email: accountData.account_email,
    });
  } catch (error) {
    req.flash("error", "Sorry, we couldn't load your account information.");
    res.redirect("/account/management");
  }
};

accountController.updateAccountInfo = async (req, res) => {
  const { account_id, account_firstname, account_lastname, account_email } =
    req.body;

  try {
    const updatedAccount = await accountModel.updateAccountInfo(
      account_id,
      account_firstname,
      account_lastname,
      account_email
    );

    // Update session data
    req.session.user = {
      ...req.session.user,
      account_firstname,
      account_lastname,
      account_email,
    };

    // Update JWT token
    const token = jwt.sign(
      {
        id: account_id,
        firstname: account_firstname,
        lastname: account_lastname,
        email: account_email,
        type: req.session.user.account_type || "Client",
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600000,
      sameSite: "Lax",
      path: "/",
    });

    req.flash("notice", "Your account information has been updated.");
    res.redirect("/account/management");
  } catch (error) {
    req.flash("error", "Failed to update account information.");
    res.redirect(`/account/update/${account_id}`);
  }
};

accountController.updatePassword = async (req, res) => {
  const { account_id, current_password, new_password, confirm_password } =
    req.body;

  try {
    // Verify current password
    const accountData = await accountModel.getAccountById(account_id);
    const isMatch = await bcrypt.compare(
      current_password,
      accountData.account_password
    );

    if (!isMatch) {
      throw new Error("Current password is incorrect");
    }

    if (new_password !== confirm_password) {
      throw new Error("New passwords do not match");
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // Update password
    await accountModel.updatePassword(account_id, hashedPassword);

    // Update session if needed
    if (req.session.user) {
      req.session.user.account_password = hashedPassword;
    }

    req.flash("notice", "Your password has been updated.");
    res.redirect("/account/management");
  } catch (error) {
    req.flash("error", error.message || "Failed to update password.");
    res.redirect(`/account/update/${account_id}`);
  }
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
    // First check if email exists
    const existingAccount = await accountModel.getAccountByEmail(account_email);
    if (existingAccount) {
      req.flash("notice", "An account with this email already exists.");
      return res.status(400).render("account/register", {
        title: "Registration",
        nav,
        errors: null,
        account_firstname,
        account_lastname,
        account_email,
      });
    }

    const hashedPassword = await bcrypt.hash(account_password, 10);
    const user = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    );
    const token = accessToken(user.id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: 3600000 });

    if (user) {
      req.flash(
        "notice",
        `Congratulations ${account_firstname}, you're now registered and logged in!`
      );

      req.session.user = user;
      return res.redirect("/account/management");
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

  const nav = await utilities.getNav();
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

    // Compare password
    const isValidPassword = await bcrypt.compare(
      account_password,
      accountData.account_password
    );
    if (!isValidPassword) {
      req.flash("notice", "Please check your credentials and try again.");
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      });
    }

    // Create JWT payload
    const tokenPayload = {
      account_id: accountData.account_id,
      account_firstname: accountData.account_firstname,
      account_lastname: accountData.account_lastname,
      account_email: accountData.account_email,
      account_type: accountData.account_type || "Client",
    };

    // ✅ Generate token here (this was missing)
    const accessToken = jwt.sign(
      tokenPayload,
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "1h",
      }
    );

    // ✅ Set token in a secure HTTP-only cookie
    res.cookie("jwt", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600000,
      sameSite: "Lax",
      path: "/",
    });

    req.flash("notice", `Welcome back, ${tokenPayload.account_firstname}!`);
    return res.redirect("/account/");
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
accountController.accountManagement = async (req, res) => {
  console.log(req.session.user.rows[0]);

  let nav = await utilities.getNav();
  res.render("account/management", {
    title: "Account Management",
    nav,
    user: req.session.user.rows[0],
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
