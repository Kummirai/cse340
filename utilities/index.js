const invModel = require("../models/inventory-model");
const Util = {};
const validator = require("validator");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.checkLogin = (req, res, next) => {
  if (req.session?.user) {
    next();
  } else {
    req.flash("error", "You must be logged in to do that.");
    res.redirect("/account/login");
  }
};

/* ****************************************
 * Middleware to check token validity
 **************************************** */
Util.checkJWTToken = (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    req.user = null;
    next();
  }
};

/* ************************
 * Check current user
 ************************** */
Util.checkCurrentUser = async (req, res, next) => {
  const token = req.cookies?.jwt;

  if (token) {
    jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET,
      async (err, decodedToken) => {
        if (err) {
          console.error(err);
          res.locals.user = null;
        } else {
          const user = await user.findById(decodedToken.id);
          res.locals.user = user;
          next();
        }
      }
    );
  } else {
    res.locals.user = null;
    next();
  }
};

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function () {
  let data = await invModel.getClassifications();
  let list = "<ul>";
  list += '<li><a href="/" title="Home page">Home</a></li>';
  data.rows.forEach((row) => {
    list += "<li>";
    list +=
      '<a href="/inv/classification/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>";
    list += "</li>";
  });
  list += "</ul>";
  return list;
};

/* **************************************
 * Build the classification view HTML
 * ************************************ */
Util.buildClassificationGrid = async function (data) {
  let grid;
  if (data.length > 0) {
    grid = '<ul id="inv-display" class="vehicle-container">';
    data.forEach((vehicle) => {
      grid += "<li>";
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' details"><img src="' +
        vehicle.inv_thumbnail +
        '" alt="Image of ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' on CSE Motors" /></a>';
      grid += '<div class="namePrice">';
      grid += "<hr />";
      grid += "<h2>";
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' details">' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        "</a>";
      grid += "</h2>";
      grid +=
        "<span>$" +
        new Intl.NumberFormat("en-US").format(vehicle.inv_price) +
        "</span>";

      // ⭐ Star rating with count and link
      grid += '<div class="star-rating">';
      if (vehicle.avg_rating !== null && vehicle.review_count > 0) {
        const fullStars = Math.floor(vehicle.avg_rating);
        const halfStar = vehicle.avg_rating % 1 >= 0.5 ? 1 : 0;
        const emptyStars = 5 - fullStars - halfStar;

        grid += `<a href="/reviews/${vehicle.inv_id}" title="Read ${vehicle.review_count} reviews">`;

        for (let i = 0; i < fullStars; i++) {
          grid += '<span class="star full">&#9733;</span>'; // ★
        }
        if (halfStar) {
          grid += '<span class="star half">&#9734;</span>'; // ☆
        }
        for (let i = 0; i < emptyStars; i++) {
          grid += '<span class="star empty">&#9734;</span>';
        }

        grid += ` <span class="rating-number">(${vehicle.avg_rating} from ${
          vehicle.review_count
        } review${vehicle.review_count > 1 ? "s" : ""})</span>`;
        grid += "</a>";
      } else {
        grid += '<span class="no-reviews">No Reviews Yet</span>';
      }
      grid += "</div>";
    });
    grid += "</ul>";
  } else {
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  return grid;
};

/* **************************************
 * Detail view HTML
 * ************************************ */
Util.buildVehicleDetailHTML = async function (vehicle) {
  let html = `
    <div class="vehicle-detail">
      <div class="vehicle-image">
        <img src="${vehicle.inv_image}" alt="${vehicle.inv_make} ${
    vehicle.inv_model
  }">
      </div>
      <div class="vehicle-info">
        <h1>${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h1>
        <div class="price-mileage">
          <h2 class="price">$${new Intl.NumberFormat("en-US").format(
            vehicle.inv_price
          )}</h2>
          <p class="mileage">${new Intl.NumberFormat("en-US").format(
            vehicle.inv_miles
          )} miles</p>
        </div>
        <div class="vehicle-description">
          <h3>Description</h3>
          <p>${vehicle.inv_description}</p>
        </div>
        <div class="vehicle-specs">
          <h3>Specifications</h3>
          <ul>
            <li><strong>Color:</strong> ${vehicle.inv_color}</li>
          </ul>
        </div>

        <div class="review-button">
          <a href="/reviews/${
            vehicle.inv_id
          }" class="btn-review">Write a Review</a>
        </div>
      </div>
    </div>
  `;
  return html;
};

/* **************************************
 * Inventory Management view HTML
 * ************************************ */
Util.buildInventoryManagementGrid = async function () {
  let grid = `
  <ul class="vehicle-management">
    <li>
      <a href="/inv/add-classification" title="Add a new classificatio">Add New Classification</a>
    </li>
    <li>
      <a href="/inv/add-vehicle" title="Add a vehicle">Add New Vehicle</a>
      </li>
  </ul>`;
  return grid;
};

/* **************************************
 * Build classification list
 * ************************************ */
Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications();
  let classificationList =
    '<select name="classification_id" id="classificationList" required>';
  classificationList += "<option value=''>Choose a Classification</option>";
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"';
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      classificationList += " selected ";
    }
    classificationList += ">" + row.classification_name + "</option>";
  });
  classificationList += "</select>";
  return classificationList;
};

/* **************************************
 * Build classification view HTML
 * ************************************ */
Util.buildClassifications = async function () {
  let grid = `<form class="classification-form" method="post">
    <label for="classification"><span>Classification Name</span>
    <p class="notice classification-notice">Name must be alphabetic characters only.</p>
     <input autofocus autocomplete="off" type="text" id="classification" name="classification" required>
    </label>
    <button type="submit" id="classificationSubmit">Add Classification</button>
    </form>`;
  return grid;
};

/* **************************************
 * Build vehicle view HTML
 * ************************************ */
Util.buildVehicleView = async function () {
  let grid = `<form class="add-vehicle-form"  method="post">

    <label for="classification_id"><span>Classification</span>
      ${await Util.buildClassificationList()}
    </label>
     
    <label for="inv_make"><span>Make</span>
      <input type="text" id="inv_make" name="inv_make" required placeholder="Min of 3 characters">
    </label>
    <label for="inv_model"><span>Model</span>
      <input type="text" id="inv_model" name="inv_model" required placeholder="Min of 3 characters">
    </label>

    <label for="inv_description"><span>Description</span>
      <textarea id="inv_description" rows="5" name="inv_description" required></textarea>
    </label>

    <label for="inv_image"><span>Image path</span>
      <input type="text" id="inv_image" name="inv_image" required>
    </label>
    <label for="inv_thumbnail"><span>Thumbnail path</span>
      <input type="text" id="inv_thumbnail" name="inv_thumbnail" required>
    </label>

    <label for="inv_price"><span>Price</span>
      <input type="text" id="inv_price" name="inv_price" required placeholder="Decimal or Integer">
    </label>
    
    <label for="inv_year"><span>Year</span>
      <input type="text" id="inv_year" name="inv_year" required placeholder="4-digit year">
    </label>
    
    <label for="inv_miles"><span>Miles</span>
      <input type="text" id="inv_miles" name="inv_miles" required placeholder="Digits only">
    </label>
    <label for="inv_color"><span>Color</span>
      <input type="text" id="inv_color" name="inv_color" required>
      </label>
    <button id="add-vehicle" type="submit">Add Vehicle</button>
  </form>`;
  return grid;
};

/* **************************************
 * User registration view HTML
 * ************************************ */
Util.buildUserRegistrationView = async function () {
  let html = `
    <form class="registration-form" method="post">
      <label for="first_name"><span>First Name</span>
        <input type="text" id="first_name" name="first_name" required>
      </label>
      <label for="last_name"><span>Last Name</span>
        <input type="text" id="last_name" name="last_name" required>
      </label>
      <label for="email"><span>Email</span>
        <input type="email" id="email" name="email" required>
      </label>
      <label for="password"><span>Password</span>
        <input type="password" id="password" name="password" required minlength="8">
      </label>
      <button type="submit">Register</button>
      <p class="notice">Already have an account? <a href="/login">Login here</a>.</p>
    </form>`;
  return html;
};

/* **************************************
 * User login view HTML
 * ************************************ */
Util.buildUserLoginView = async function () {
  let html = `
    <form id="loginForm" action="/account/login" method="post">
      <label for="email"><span>Email</span>
        <input type="email" id="email" name="email" required>
      </label>
      <label for="password"><span>Password</span>
        <input type="password" id="password" name="password" required minlength="8">
      </label>
      <button type="submit">Login</button>
      <p class="notice">Don't have an account? <a href="/register">Register here</a>.</p>
    </form>`;
  return html;
};

//validator
Util.validateClassification = async function (req, res, next) {
  const { classification } = req.body;
  console.log(classification);

  if (!classification || !validator.isAlpha(classification)) {
    req.flash(
      "error",
      "Classification not added name must be alphabetic characters only."
    );
    return res.redirect("/inv");
  }

  next(); // pass control to next handler
};

Util.validateVehicle = async function (req, res, next) {
  const {
    classification_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
  } = req.body;

  if (
    !classification_id ||
    !inv_make ||
    !inv_model ||
    !inv_description ||
    !inv_image ||
    !inv_thumbnail ||
    !inv_price ||
    !inv_year ||
    !inv_miles ||
    !inv_color
  ) {
    return req.flash("error", "All fields are required.");
  }

  if (
    !validator.isNumeric(inv_price) ||
    !validator.isNumeric(inv_year) ||
    !validator.isNumeric(inv_miles)
  ) {
    req.flash(
      "error",
      "Vehicle NOT added, Price, Year, and Miles must be numeric values."
    );
    return res.redirect("/inv");
  }

  if (inv_make.length < 3 || inv_model.length < 3) {
    req.flash(
      "error",
      "Vehicle NOT added, Make and Model must be at least 3 characters long."
    );
    return res.redirect("/inv");
  }

  next(); // pass control to next handler
};

Util.checkJWTToken = (req, res, next) => {
  const token = req.cookies.jwt || req.headers.authorization?.split(" ")[1];
  if (!token) {
    return next();
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.error("JWT verification failed:", err);
      return next();
    }
    req.user = decoded;
    next();
  });
};

//validate user input
Util.validation = (req, res, next) => {
  const { first_name, last_name, email, password } = req.body;

  if (!first_name || !last_name || !email || !password) {
    req.flash("error", "All fields are required.");
    return res.redirect("/register");
  }

  if (!validator.isEmail(email)) {
    req.flash("error", "Invalid email format.");
    return res.redirect("/register");
  }

  if (password.length < 8) {
    req.flash("error", "Password must be at least 8 characters long.");
    return res.redirect("/register");
  }

  next();
};

Util.handleErrors = (fn) => (req, res, next) => {
  console.log("Before Handle erors!");

  Promise.resolve(fn(req, res, next)).catch(next);
  console.log("After Handle erors!");
};

module.exports = Util;
