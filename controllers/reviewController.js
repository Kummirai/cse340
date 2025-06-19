const reviewModel = require("../models/review-model");
const inventoryModel = require("../models/inventory-model");
const utilities = require("../utilities");

exports.renderReviewForm = async (req, res) => {
  let nav = await utilities.getNav();
  res.render("reviews/add", {
    title: "Add a Review",
    nav,
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

exports.postReview = async (req, res) => {
  const { rating, content } = req.body;
  const { inv_id } = req.params;
  const account_id = parseInt(res.locals.user?.account_id);

  console.log(parseInt(res.locals.user.account_id));

  if (!rating || !content || !account_id) {
    req.flash("error", "All fields are required.");
    return res.redirect(`/reviews/${inv_id}`);
  }

  try {
    await reviewModel.addReview({
      inv_id,
      account_id,
      rating: parseInt(rating),
      content,
    });
    req.flash("notice", "Review submitted successfully!");
    res.redirect(`/reviews/${inv_id}`);
  } catch (err) {
    console.error("Error posting review:", err);
    req.flash("error", "Could not submit your review.");
    res.redirect(`/reviews/${inv_id}`);
  }
};

exports.showVehicleReviews = async (req, res) => {
  const invId = req.params.inv_id;
  try {
    const vehicle = await inventoryModel.getInventoryItemById(invId);
    const reviews = await reviewModel.getReviewsByVehicle(invId);

    res.render("reviews/vehicle", {
      title: `${vehicle.inv_make} ${vehicle.inv_model} Reviews`,
      nav: await utilities.getNav(),
      vehicle,
      reviews,
    });
  } catch (err) {
    console.error("Error loading vehicle reviews:", err);
    res.status(500).send("Could not load reviews.");
  }
};

exports.showAllReviews = async (req, res) => {
  let nav = await utilities.getNav();
  try {
    const reviews = await reviewModel.getAllReviews();
    res.render("reviews/index", {
      title: "Customer Reviews",
      nav,
      reviews,
    });
  } catch (err) {
    res.status(500).send("Error loading reviews.");
  }
};

exports.showVehicleReviews = async (req, res) => {
  const invId = req.params.inv_id;
  try {
    const vehicle = await inventoryModel.getInventoryItemById(invId);
    const reviews = await reviewModel.getReviewsByVehicle(invId);
    res.render("reviews/vehicle", {
      title: `${vehicle.inv_make} ${vehicle.inv_model} Reviews`,
      nav: await utilities.getNav(),
      vehicle,
      reviews,
    });
  } catch (err) {
    console.error("Error loading vehicle reviews", err);
    res.status(500).send("Could not load reviews.");
  }
};
