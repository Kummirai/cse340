const pool = require('../database');

const invModel = {};

/* ***************************
 * Get inventory by classification_id
 * ************************** */
invModel.getInventoryByClassificationId = async function(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
       JOIN public.classification AS c 
       ON i.classification_id = c.classification_id 
       WHERE i.classification_id = $1`,
      [classification_id]
    );
    return data.rows;
  } catch (error) {
    console.error("getInventoryByClassificationId error " + error);
    throw error;
  }
};

/* ***************************
 * Get all classifications
 * ************************** */
invModel.getClassifications = async function() {
  try {
    const data = await pool.query(
      `SELECT * FROM public.classification ORDER BY classification_name`
    );
    return data.rows;
  } catch (error) {
    console.error("getClassifications error " + error);
    throw error;
  }
};

module.exports = invModel;