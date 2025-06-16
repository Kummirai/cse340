//registration validation
const { body, validationResult } = require("express-validator");
const utilities = require("./index");

const regValidate = {};
// Registration validation rules
regValidate.registerRules = () => {
  console.log("registerRules");
  return [
    body("account_first_name")
      .notEmpty()
      .withMessage("First name is required.")
      .isLength({ min: 2 })
      .withMessage("First name must be at least 2 characters long."),
    body("account_last_name")
      .notEmpty()
      .withMessage("Last name is required.")
      .isLength({ min: 2 })
      .withMessage("Last name must be at least 2 characters long."),
    body("account_email")
      .isEmail()
      .withMessage("Please enter a valid email address."),
    body("account_password")
      .notEmpty()
      .withMessage("Password is required.")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long."),
  ];
};

// Login validation rules
regValidate.loginRules = () => {
  return [
    body("account_email")
      .isEmail()
      .withMessage("Please enter a valid email address."),
    body("account_password")
      .notEmpty()
      .withMessage("Password is required.")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long."),
  ];
};

// Middleware to check for validation errors
regValidate.checkRegisterData = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render("account/register", {
      title: "Register",
      nav: utilities.getNav(),
      errors: errors.array(),
      account_first_name: req.body.account_first_name,
      account_last_name: req.body.account_last_name,
      account_email: req.body.account_email,
    });
  }
  console.log("checkRegisterData done!");
  next();
};

regValidate.checkLoginData = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render("account/login", {
      title: "Login",
      nav: utilities.getNav(),
      errors: errors.array(),
      account_email: req.body.account_email,
    });
  }
  next();
};

module.exports = regValidate;
