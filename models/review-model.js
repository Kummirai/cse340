const pool = require("../database/"); // or wherever your db connection lives

async function addReview({ inv_id, account_id, rating, content }) {
  try {
    const sql = `
      INSERT INTO reviews (inv_id, account_id, rating, content)
      VALUES ($1, $2, $3, $4)
    `;
    await pool.query(sql, [inv_id, account_id, rating, content]);
  } catch (err) {
    console.error("Error adding review:", err);
    throw err;
  }
}

async function getAllReviews() {
  try {
    const sql = `SELECT r.content, r.rating, r.review_date, u.first_name
                 FROM reviews r JOIN users u ON r.user_id = u.user_id
                 ORDER BY r.review_date DESC`;
    const result = await pool.query(sql);
    return result.rows;
  } catch (err) {
    console.error("getAllReviews error", err);
    throw err;
  }
}

async function getInventoryWithRatings() {
  try {
    const sql = `
      SELECT 
        i.inv_id,
        i.inv_make,
        i.inv_model,
        i.inv_price,
        i.inv_thumbnail,
        ROUND(AVG(r.rating), 1) AS avg_rating,
        COUNT(r.review_id) AS review_count
        FROM inventory i
        LEFT JOIN reviews r ON i.inv_id = r.inv_id
        GROUP BY i.inv_id, i.inv_make, i.inv_model, i.inv_price, i.inv_thumbnail
        ORDER BY i.inv_make, i.inv_model;
    `;
    const result = await pool.query(sql);
    return result.rows;
  } catch (error) {
    console.error("Error getting inventory with ratings", error);
    throw error;
  }
}

async function getReviewsByVehicle(inv_id) {
  try {
    const sql = `
      SELECT 
        r.review_id,
        r.rating,
        r.content,
        r.review_date,
        u.first_name || ' ' || u.last_name AS reviewer
      FROM reviews r
      JOIN users u ON r.user_id = u.user_id
      WHERE r.inv_id = $1
      ORDER BY r.review_date DESC
    `;
    const result = await pool.query(sql, [inv_id]);
    return result.rows;
  } catch (err) {
    console.error("Error fetching reviews by vehicle:", err);
    throw err;
  }
}

module.exports = {
  addReview,
  getAllReviews,
  getInventoryWithRatings,
  getReviewsByVehicle,
};
