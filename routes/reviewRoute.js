const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const utilities = require("../utilities/index");
const checkLogin = require("../utilities/index");

router.get("/add", reviewController.renderReviewForm);
router.post("/add", reviewController.submitReview);
router.get("/", reviewController.showAllReviews);
router.get("/:inv_id", reviewController.showVehicleReviews);
router.post("/:inv_id", reviewController.postReview);

module.exports = router;
