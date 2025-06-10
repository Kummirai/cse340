const pool = require("../database");

const invModel = {};

/* ***************************
 * Get inventory by classification_id
 * ************************** */
invModel.getInventoryByClassificationId = async function (classification_id) {
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
invModel.getClassifications = async function () {
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

/* ***************************
 * Add new vehicle
 * ************************** */
invModel.addVehicle = async function (vehicleData) {
  try {
    const {
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
    } = vehicleData;
    const query = `
      INSERT INTO public.inventory (inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`;
    const values = [
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error("addVehicle error " + error);
    throw error;
  }
};

/* ***************************
 * Add new classification
 * ************************** */
invModel.addClassification = async function (classificationName) {
  try {
    const query = `
      INSERT INTO public.classification (classification_name)
      VALUES ($1)
      RETURNING *`;
    const values = [classificationName];
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error("addClassification error " + error);
    throw error;
  }
};

module.exports = invModel;
