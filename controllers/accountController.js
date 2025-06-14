//accounyControler.js
const User = require("../models/userModel");
const utilities = require("../utilities/");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const accountController = {};

// Process the registration request
accountController.accountRegister = async function (req, res, next) {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Validate user input
    if (!firstName || !lastName || !email || !password) {
      req.flash("notice", "All fields are required");
      return res.redirect("/account/register");
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      req.flash("notice", "Email already registered");
      return res.redirect("/account/register");
    }

    // Create new user
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password,
    });

    // Generate JWT token
    const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Set token in cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      maxAge: 3600000, // 1 hour
    });

    // Redirect to home page
    req.flash("success", "Registration successful");
    res.redirect("/");
  } catch (error) {
    console.error("accountRegister error: " + error);
    req.flash("error", "An error occurred during registration");
    res.redirect("/account/register");
  }
};

// Process the login request
accountController.accountLogin = async function (req, res, next) {
  try {
    const { email, password } = req.body;

    // Validate user credentials
    const user = await User.validateUser(email, password);
    if (!user) {
      req.flash("notice", "Invalid email or password");
      return res.redirect("/account/login");
    }
    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    // Set token in cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      maxAge: 3600000, // 1 hour
    });
    // Redirect to home page
    req.flash("success", "Login successful");
    res.redirect("/");
  } catch (error) {
    console.error("accountLogin error: " + error);
    req.flash("error", "An error occurred during login");
    res.redirect("/account/login");
  }
};

module.exports = accountController;
