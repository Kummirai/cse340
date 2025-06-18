const pool = require("../database/");

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications() {
  return await pool.query(
    "SELECT * FROM public.classification ORDER BY classification_name"
  );
}

/* ***************************
 *  Get all inventory items by classification_id
 * ************************** */
// In your invModel.js
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT 
         i.*, 
         c.classification_name,
         COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) AS avg_rating,
         COUNT(r.review_id) AS review_count
       FROM 
         public.inventory AS i 
       JOIN 
         public.classification AS c 
         ON i.classification_id = c.classification_id 
       LEFT JOIN 
         public.reviews AS r 
         ON i.inv_id = r.inv_id
       WHERE 
         i.classification_id = $1
       GROUP BY 
         i.inv_id, c.classification_name
       ORDER BY
         i.inv_make, i.inv_model`,
      [classification_id]
    );
    return data.rows;
  } catch (error) {
    console.error("getInventoryByClassificationId error: " + error);
    throw error;
  }
}

/*Get inventory item by inv_id
 * ************************** */
async function getInventoryItemById(inv_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory 
       WHERE inv_id = $1`,
      [inv_id]
    );
    return data.rows[0];
  } catch (error) {
    console.error("getInventoryItemById error: " + error);
    throw error;
  }
}

/* ***************************
 *  Export functions
 * ************************** */
module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getInventoryItemById,
};
