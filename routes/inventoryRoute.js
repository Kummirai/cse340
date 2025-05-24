// routes/inventoryRoute.js
const express = require("express");
const router = express.Router();
const invController = require("../controllers/invController");

// Route to build inventory by classification view
router.get(
  "/classification/:classificationId",
  invController.buildByClassificationId
);

// Route to get classifications
router.get("/get-classifications", invController.getClassifications);

module.exports = router;
