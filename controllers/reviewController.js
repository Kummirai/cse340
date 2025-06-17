const reviewModel = require("../models/review-model");

exports.renderReviewForm = (req, res) => {
  res.render("reviews/add", {
    title: "Add a Review",
    nav: req.nav,
  });
};

exports.submitReview = async (req, res) => {
  const { content, rating } = req.body;
  const userId = req.session.user.user_id;
  try {
    await reviewModel.addReview(userId, content, parseInt(rating));
    res.redirect("/reviews");
  } catch (err) {
    res.status(500).send("Error submitting review.");
  }
};

exports.showAllReviews = async (req, res) => {
  try {
    const reviews = await reviewModel.getAllReviews();
    res.render("reviews/index", {
      title: "Customer Reviews",
      nav: req.nav,
      reviews,
    });
  } catch (err) {
    res.status(500).send("Error loading reviews.");
  }
};
