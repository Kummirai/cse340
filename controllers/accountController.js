// accountController.js
const accountModel = require("../models/account-model");
const utilities = require("../utilities");
const bcrypt = require("bcrypt");

module.exports = {
  /* ****************************************
   *  Display Registration View
   * ************************************ */
  async showRegistrationForm(req, res) {
    try {
      const nav = await utilities.getNav();
      res.render("account/register", {
        title: "Register",
        nav,
        errors: null,
        formData: req.flash("formData")[0] || {
          account_firstname: "",
          account_lastname: "",
          account_email: "",
        },
        messages: {
          notice: req.flash("notice"),
          error: req.flash("error"),
        },
      });
    } catch (error) {
      utilities.logError(error);
      res.status(500).render("errors/error", {
        title: "Server Error",
        nav: await utilities.getNav(),
        status: 500,
        message: "Error displaying registration form",
        error,
      });
    }
  },

  /* ****************************************
   *  Process Registration
   * ************************************ */
  async register(req, res) {
    try {
      const {
        account_firstname,
        account_lastname,
        account_email,
        account_password,
      } = req.body;

      // Validate password complexity
      const passwordErrors = utilities.validatePassword(account_password);
      if (passwordErrors.length > 0) {
        req.flash("error", passwordErrors.join(" "));
        req.flash("formData", req.body);
        return res.redirect("/account/register");
      }

      // Check if email already exists
      const existingAccount = await accountModel.getAccountByEmail(
        account_email
      );
      if (existingAccount) {
        req.flash(
          "error",
          "Email already exists. Please login or use a different email."
        );
        req.flash("formData", req.body);
        return res.redirect("/account/register");
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(account_password, 10);

      // Create new account
      const registrationResult = await accountModel.createAccount({
        account_firstname,
        account_lastname,
        account_email,
        account_password: hashedPassword,
        account_type: "Client", // Default account type
      });

      if (registrationResult) {
        req.flash(
          "notice",
          `Congratulations ${account_firstname}, your account has been created. Please log in.`
        );
        return res.redirect("/account/login");
      } else {
        throw new Error("Account creation failed");
      }
    } catch (error) {
      utilities.logError(error);
      req.flash("error", "Registration failed. Please try again.");
      req.flash("formData", req.body);
      return res.redirect("/account/register");
    }
  },

  /* ****************************************
   *  Display Login View
   * ************************************ */
  async showLoginForm(req, res) {
    try {
      const nav = await utilities.getNav();
      res.render("account/login", {
        title: "Login",
        nav,
        errors: null,
        formData: {
          account_email: req.flash("email")[0] || "",
        },
        messages: {
          notice: req.flash("notice"),
          error: req.flash("error"),
        },
      });
    } catch (error) {
      utilities.logError(error);
      res.status(500).render("errors/error", {
        title: "Server Error",
        nav: await utilities.getNav(),
        status: 500,
        message: "Error displaying login form",
        error,
      });
    }
  },

  /* ****************************************
   *  Display Account Management View
   * ************************************ */
  async showAccountManagement(req, res) {
    try {
      const nav = await utilities.getNav();
      const accountData = await accountModel.getAccountById(req.user.id);

      res.render("account/account-management", {
        title: "Account Management",
        nav,
        account: accountData,
        messages: {
          notice: req.flash("notice"),
        },
      });
    } catch (error) {
      utilities.logError(error);
      res.status(500).render("errors/error", {
        title: "Server Error",
        nav: await utilities.getNav(),
        status: 500,
        message: "Error displaying account management",
        error,
      });
    }
  },

  /* ****************************************
   *  Display Account Update View
   * ************************************ */
  async showUpdateAccountForm(req, res) {
    try {
      const nav = await utilities.getNav();
      const accountData = await accountModel.getAccountById(req.user.id);

      res.render("account/update-account", {
        title: "Update Account",
        nav,
        account: accountData,
        errors: null,
        messages: {
          notice: req.flash("notice"),
          error: req.flash("error"),
        },
      });
    } catch (error) {
      utilities.logError(error);
      res.status(500).render("errors/error", {
        title: "Server Error",
        nav: await utilities.getNav(),
        status: 500,
        message: "Error displaying update form",
        error,
      });
    }
  },

  /* ****************************************
   *  Process Account Update
   * ************************************ */
  async updateAccount(req, res) {
    try {
      const { account_firstname, account_lastname, account_email } = req.body;

      const updateResult = await accountModel.updateAccount(req.user.id, {
        account_firstname,
        account_lastname,
        account_email,
      });

      if (updateResult) {
        req.flash("notice", "Account updated successfully");
        return res.redirect("/account/management");
      } else {
        throw new Error("Account update failed");
      }
    } catch (error) {
      utilities.logError(error);
      req.flash("error", "Account update failed");
      return res.redirect("/account/update");
    }
  },
};
