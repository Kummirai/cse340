// routes/inventoryRoute.js
const express = require("express");
const router = express.Router();
const invController = require("../controllers/invController");

// Route to build inventory by classification view
router.get(
  "/classification/:classificationId",
  invController.buildByClassificationId
);

//Route to build vehicle detail view
router.get("/detail/:invId", invController.buildVehicleDetail);

// Route to get classifications
router.get("/get-classifications", invController.getClassifications);

//Route to trigger an error for testing
router.get("/trigger-error", invController.triggerError);

module.exports = router;
