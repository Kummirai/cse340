// authController.js
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const accountModel = require("../models/account-model");
const utilities = require("../utilities");

module.exports = {
  /* ****************************************
   *  Process Login Request
   * ************************************ */
  async login(req, res) {
    try {
      const { account_email, account_password } = req.body;
      const account = await accountModel.getAccountByEmail(account_email);

      // Validate credentials
      if (!account) {
        req.flash("error", "Invalid email or password");
        req.flash("email", account_email);
        return res.redirect("/account/login");
      }

      const passwordMatch = await bcrypt.compare(
        account_password,
        account.account_password
      );

      if (!passwordMatch) {
        req.flash("error", "Invalid email or password");
        req.flash("email", account_email);
        return res.redirect("/account/login");
      }

      // Create JWT token payload (exclude sensitive data)
      const tokenPayload = {
        id: account.account_id,
        firstname: account.account_firstname,
        lastname: account.account_lastname,
        email: account.account_email,
        type: account.account_type,
      };

      // Generate JWT
      const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      // Set secure HTTP-only cookie
      res.cookie("jwt", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 3600000, // 1 hour
        sameSite: "strict",
      });

      // Redirect based on account type
      if (tokenPayload.type === "Employee" || tokenPayload.type === "Admin") {
        req.flash("notice", `Welcome back, ${tokenPayload.firstname}!`);
        return res.redirect("/inventory/manage");
      }

      req.flash("notice", `Welcome back, ${tokenPayload.firstname}!`);
      return res.redirect("/account/management");
    } catch (error) {
      utilities.logError(error);
      req.flash("error", "Login failed. Please try again.");
      return res.redirect("/account/login");
    }
  },

  /* ****************************************
   *  Process Logout Request
   * ************************************ */
  logout(req, res) {
    try {
      res.clearCookie("jwt", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      req.flash("notice", "You have been successfully logged out.");
      return res.redirect("/account/login");
    } catch (error) {
      utilities.logError(error);
      req.flash("error", "Logout failed. Please try again.");
      return res.redirect("/account/management");
    }
  },

  /* ****************************************
   *  Verify JWT Token Middleware
   * ************************************ */
  verifyToken(req, res, next) {
    try {
      const token = req.cookies.jwt;

      if (!token) {
        req.flash("error", "Please log in to access this page");
        return res.redirect("/account/login");
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      utilities.logError(error);
      res.clearCookie("jwt");
      req.flash("error", "Session expired. Please log in again.");
      return res.redirect("/account/login");
    }
  },

  /* ****************************************
   *  Check Account Type Authorization
   * ************************************ */
  checkAccountType(...allowedTypes) {
    return (req, res, next) => {
      try {
        if (!allowedTypes.includes(req.user.type)) {
          req.flash("error", "Unauthorized access");
          return res.redirect("/account/management");
        }
        next();
      } catch (error) {
        utilities.logError(error);
        req.flash("error", "Authorization check failed");
        return res.redirect("/account/login");
      }
    };
  },
};
