const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");

router.get("/add", reviewController.renderReviewForm);
router.post("/add", reviewController.submitReview);
router.get("/", reviewController.showAllReviews);

module.exports = router;

