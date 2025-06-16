// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");

const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      req.flash("notice", "Please log in to access this page");
      return res.redirect("/account/login");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.account_id,
      firstname: decoded.account_firstname,
      lastname: decoded.account_lastname,
      email: decoded.account_email,
      type: decoded.account_type,
    };
    next();
  } catch (error) {
    res.clearCookie("jwt");
    req.flash("notice", "Session expired. Please log in again.");
    return res.redirect("/account/login");
  }
};

const authorize = (...allowedTypes) => {
  return (req, res, next) => {
    if (!req.user || !allowedTypes.includes(req.user.type)) {
      req.flash("notice", "Unauthorized access");
      return res.redirect("/account/management");
    }
    next();
  };
};

module.exports = { authenticate, authorize };
