const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications() {
  try {
    const result = await pool.query(
      "SELECT * FROM public.classification ORDER BY classification_name"
    )
    return result.rows  
  } catch (error) {
    console.error("getClassifications error:", error)
    throw error
  }
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
       JOIN public.classification AS c 
       ON i.classification_id = c.classification_id 
       WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getInventoryByClassificationId error:", error)
    throw error
  }
}

/* ***************************
 *  Get a single vehicle by inventory_id
 * ************************** */
async function getInventoryItemById(id) {
  try {
    const sql = `
      SELECT inv_id, inv_make, inv_model, inv_year, inv_price,
             inv_miles, inv_description, inv_image, inv_thumbnail,
             inv_color
      FROM public.inventory
      WHERE inv_id = $1
    `
    const result = await pool.query(sql, [id])
    return result.rows[0] || null
  } catch (error) {
    console.error("getInventoryItemById error:", error)
    throw error
  }
}

/* ***************************
 *  Add new classification
 * ************************** */
async function insertClassification(name) {
  try {
    const sql = `INSERT INTO public.classification (classification_name) VALUES ($1)`
    await pool.query(sql, [name])
  } catch (error) {
    console.error("insertClassification error:", error)
    throw error
  }
}

/* ***************************
 *  Add new vehicle
 * ************************** */
async function insertVehicle(data) {
  try {
    const {
      inv_make,
      inv_model,
      inv_year,
      inv_price,
      inv_miles,
      inv_color,
      inv_description,
      inv_image,
      inv_thumbnail,
      classification_id
    } = data

    const sql = `
      INSERT INTO public.inventory
      (inv_make, inv_model, inv_year, inv_price, inv_miles, inv_color, inv_description, inv_image, inv_thumbnail, classification_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `
    const result = await pool.query(sql, [
      inv_make,
      inv_model,
      inv_year,
      inv_price,
      inv_miles,
      inv_color,
      inv_description,
      inv_image,
      inv_thumbnail,
      classification_id
    ])

    return result.rows[0]
  } catch (error) {
    console.error("insertVehicle error:", error)
    throw error
  }
}


/* ***************************
 *  Export all functions
 * ************************** */
module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getInventoryItemById,
  insertClassification,
  insertVehicle,
}
