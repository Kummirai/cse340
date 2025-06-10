const invModel = require("../models/inventory-model");
const Util = {};

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
        'details"><img src="' +
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
      grid += "</div>";
      grid += "</li>";
    });
    grid += "</ul>";
  } else {
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>';
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
      <a href="/inv/add-classification" title="Add a new vehicle">Add New Classification</a>
    </li>
    <li>
      <a href="/inv/add-vehicle" title="Delete a vehicle">Add New Vehicle</a>
      </li>
  </ul>`;
  return grid;
};

/* **************************************
 * Build classification view HTML
 * ************************************ */
Util.buildClassifications = async function () {
  let grid = `<form action="/inv/add-classification" method="post"></form>
    <label for="classification">Classification Name:</label>
    <input type="text" id="classification" name="classification" required>
    <button type="submit">Add Classification</button>`;
  return grid;
};

/* **************************************
 * Build vehicle view HTML
 * ************************************ */
Util.buildVehicleView = async function () {
  let grid = `<form class="add-vehicle-form" action="/inv/add-vehicle" method="post">

    <label for="classification"><span>Classification</span>
      <select id="classification" name="classification" required>
        <option value="">Select Classification</option>
        <!-- Options will be populated dynamically -->
      </select>
    <label for="make"><span>Make</span>
      <input type="text" id="make" name="make" required placeholder="Min of 3 characters">
    </label>
    <label for="model"><span>Model</span>
      <input type="text" id="model" name="model" required placeholder="Min of 3 characters">
    </label>

    <label for="description"><span>Description</span>
      <textarea id="description" rows="5" name="description" required></textarea>
    </label>

    <label for="image"><span>Image path</span>
      <input type="url" id="image" name="image" required>
    </label>
    <label for="thumbnail"><span>Thumbnail path</span>
      <input type="url" id="thumbnail" name="thumbnail" required>
    </label>

    <label for="price"><span>Price</span>
      <input type="number" id="price" name="price" required placeholder="Decimal or Integer">
    </label>
    
    <label for="year"><span>Year</span>
      <input type="number" id="year" name="year" required placeholder="4-digit year">
    </label>
    
    <label for="miles"><span>Miles</span>
      <input type="number" id="miles" name="miles" required placeholder="Digits only">
    </label>
    <label for="color"><span>Color</span>
      <input type="text" id="color" name="color" required>
      </label>
    <button type="submit">Add Vehicle</button>
  </form>`;
  return grid;
};

Util.handleErrors = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = Util;
