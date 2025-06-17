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

module.exports = { addReview, getAllReviews };
