const invModel = require("../models/inventory-model");
const inventoryModel = require("../models/invModel");
const utilities = require("../utilities/");
const pool = require("../database/");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classificationId;
    const data = await invModel.getInventoryByClassificationId(
      classification_id
    );

    if (!data || data.length === 0) {
      req.flash("notice", "No vehicles found in this classification");
      return res.redirect("/inv");
    }

    const grid = await utilities.buildClassificationGrid(data);
    let nav = await utilities.getNav();
    const className = data[0].classification_name;

    res.render("./inventory/classification", {
      title: className + " vehicles",
      nav,
      grid,
    });
  } catch (error) {
    console.error("buildByClassificationId error: " + error);
    next(error);
  }
};

invCont.viewClassification = async (req, res) => {
  try {
    const vehicleData = await invModel.getInventoryWithRatings();
    const grid = await Util.buildClassificationGrid(vehicleData);
    res.render("inventory/classification", {
      title: "Browse Inventory",
      nav: await utilities.getNav(),
      grid,
    });
  } catch (error) {
    console.error("Error rendering classification view:", error);
    res.status(500).send("Server error");
  }
};

/* ***************************
 *  Get all classifications for nav
 * ************************** */
invCont.getClassifications = async function (req, res, next) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.classification ORDER BY classification_name`
    );

    return data.rows;
  } catch (error) {
    console.error("getClassifications error " + error);
    next(error);
  }
};

/* ***************************
 *  Get inventory by classification_id
 * ************************** */
invCont.getInventoryByClassificationId = async function (classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    );
    console.log("getInventoryByClassificationId data: ", data.rows);

    return data.rows;
  } catch (error) {
    console.error("getInventoryByClassificationId error " + error);
    throw error;
  }
};

/* ***************************
 *  Build vehicle detail view
 * ************************** */
invCont.buildVehicleDetail = async function (req, res, next) {
  try {
    const inv_id = req.params.invId;
    const vehicle = await invModel.getInventoryItemById(inv_id);

    if (!vehicle) {
      req.flash("notice", "Vehicle not found");
      return res.redirect("/inv");
    }

    const detailHTML = await utilities.buildVehicleDetailHTML(vehicle);
    let nav = await utilities.getNav();

    res.render("./inventory/detail", {
      title: `${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}`,
      nav,
      detailHTML,
    });
  } catch (error) {
    console.error("buildVehicleDetail error: " + error);
    next(error);
  }
};

/* ***************************
 *  Inventory Management View
 * ************************** */
invCont.buildInventoryManagement = async function (req, res, next) {
  const grid = await utilities.buildInventoryManagementGrid();

  res.render("./inventory/management", {
    grid,
    title: "Vehicle Management",
    nav: await utilities.getNav(),
  });
};

/* ***************************
 *  Add Classification View
 * ************************** */
invCont.addClassification = async function (req, res, next) {
  const classifications = await utilities.buildClassifications();

  res.render("./inventory/add-classification", {
    classifications,
    title: "Add New Classification",
    nav: await utilities.getNav(),
  });
};
/* ***************************
 *  Add new vehicle View
 * ************************** */
invCont.addVehicle = async function (req, res, next) {
  const newVehicle = await utilities.buildVehicleView();

  res.render("./inventory/add-vehicle", {
    newVehicle,
    title: "Add New Vehicle",
    nav: await utilities.getNav(),
  });
};

/* ***************************
 *  Add new vehicle POST
 * ************************** */
invCont.addVehiclePost = async function (req, res, next) {
  try {
    const vehicleData = req.body;
    const result = await inventoryModel.addVehicle(vehicleData);

    if (result.rowCount === 0) {
      req.flash("notice", "Failed to add vehicle");
      return res.redirect("/inv/add-vehicle");
    }

    req.flash("success", "Vehicle added successfully");
    res.redirect("/inv");
  } catch (error) {
    console.error("addVehiclePost error: " + error);
    next(error);
  }
};

/* ***************************
 *  Add new classification POST
 * ************************** */
invCont.addClassificationPost = async function (req, res, next) {
  try {
    const classificationName = req.body.classification;
    const result = await inventoryModel.addClassification(classificationName);

    if (result.rowCount === 0) {
      req.flash("notice", "Failed to add classification");
      return res.redirect("/inv/add-classification");
    }

    req.flash("success", "Vehicle classification added successfully");
    res.redirect("/inv");
  } catch (error) {
    console.error("addClassificationPost error: " + error);
    next(error);
  }
};

//Error handling route for testing purposes
invCont.triggerError = async function (req, res, next) {
  try {
    throw new Error("This is a test 500 error");
  } catch (error) {
    next(error);
  }
};

module.exports = invCont;
