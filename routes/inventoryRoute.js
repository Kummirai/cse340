// routes/inventoryRoute.js
const express = require("express");
const router = express.Router();
const invController = require("../controllers/invController");
const Util = require("../utilities/index");

//Route to trigger an error for testing
router.get("/trigger-error", invController.triggerError);

// Route to build inventory by classification view
router.get(
  "/classification/:classificationId",
  invController.buildByClassificationId
);

//Route to build vehicle detail view
router.get("/detail/:invId", invController.buildVehicleDetail);

// Route to get classifications
router.get("/get-classifications", invController.getClassifications);

//Route to inventory management view
router.get("/", invController.buildInventoryManagement);

//Route to add classification
router.get("/add-classification", invController.addClassification);

//Route to add vehicle
router.get("/add-vehicle", invController.addVehicle);

//Route add vehicle post//
router.post("/add-vehicle", Util.validateVehicle, invController.addVehiclePost);

//Route to add classification post//
router.post(
  "/add-classification",
  Util.validateClassification,
  invController.addClassificationPost
);

module.exports = router;
