//accounyControler.js
const User = require("../models/userModel");
const utilities = require("../utilities/");
const accountController = {};

//buildLogin function
accountController.buildLogin = async function (req, res) {
  const nav = await utilities.getNav();
  res.render("account/login", { title: "Login", nav });
};

accountController.buildRegister = async function (req, res) {
  const nav = await utilities.getNav();
  res.render("account/register", { title: "Register", nav });
};

//handleLogin function
accountController.handleLogin = async function (req, res) {
  const { email, password } = req.body;
  const user = await User.find({ email });
  if (!user) {
    req.flash("error", "Invalid email or password.");
    return res.redirect("/account/login");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    req.flash("error", "Invalid email or password.");
    return res.redirect("/account/login");
  }

  req.session.userId = user._id;
  req.flash("success", "Login successful!");
  res.redirect("/");
};

//handleRegister function
accountController.handleRegister = async function (req, res) {
  const { email, password } = req.body;
  const existingUser = await User.find({ email });
  if (existingUser) {
    req.flash("error", "Email already registered.");
    return res.redirect("/account/register");
  }
  const newUser = new User({ email, password });
  await newUser.save();
  req.session.userId = newUser._id;
  req.flash("success", "Registration successful! You can now log in.");
  res.redirect("/account/login");
};

//handleLogout function
accountController.handleLogout = function (req, res) {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error during logout:", err);
      req.flash("error", "Logout failed. Please try again.");
      return res.redirect("/");
    }
    req.flash("success", "You have been logged out successfully.");
    res.redirect("/");
  });
};

//buildAccountManagement function
accountController.buildAccountManagement = async function (req, res) {
  const nav = await utilities.getNav();
  const user = await User.findById(req.session.userId);
  if (!user) {
    req.flash("error", "You must be logged in to manage your account.");
    return res.redirect("/account/login");
  }
  res.render("account/manage", {
    title: "Account Management",
    nav,
    user,
  });
};

module.exports = accountController;
