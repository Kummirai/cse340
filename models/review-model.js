const pool = require("../database/"); // or wherever your db connection lives

async function addReview(userId, content, rating) {
  try {
    const sql = `
      INSERT INTO reviews (user_id, content, rating)
      VALUES ($1, $2, $3)
      RETURNING *`;
    const values = [userId, content, rating];
    const result = await pool.query(sql, values);
    return result.rows[0];
  } catch (err) {
    console.error("addReview error", err);
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
        ROUND(AVG(r.rating), 1) AS avg_rating
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

module.exports = { addReview, getAllReviews, getInventoryWithRatings };
