// models/inventoryModel.js

const pool = require("../database/")

/* ***************************
 * Get all classification data
 * ************************** */
async function getClassifications() {
  try {
    const result = await pool.query(
      "SELECT * FROM public.classification ORDER BY classification_name"
    )
    // IMPORTANT: The utilities/index.js (buildClassificationList) expects the result object, 
    // which has a 'rows' property. We return the whole result here, or just result.rows depending 
    // on how utilities.js is implemented. Based on the guide's example, it expects the whole object:
    // let data = await invModel.getClassifications()
    return result 
  } catch (error) {
    console.error("getClassifications error:", error)
    throw error
  }
}

/* ***************************
 * Get all inventory items and classification_name by classification_id
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
 * Get a single vehicle by inventory_id
 * ************************** */
async function getInventoryItemById(id) {
  try {
    const sql = `
      SELECT inv_id, inv_make, inv_model, inv_year, inv_price,
             inv_miles, inv_description, inv_image, inv_thumbnail,
             inv_color, classification_id
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

/* ****************************************
 * Insert a new classification into the database (TASK 2)
 * *************************************** */
async function registerClassification(classification_name) {
    try {
        const sql = "INSERT INTO classification (classification_name) VALUES ($1) RETURNING *"
        return await pool.query(sql, [classification_name])
    } catch (error) {
        console.error("registerClassification error: " + error)
        // Return error object on failure, as controller checks for truthiness
        return false
    }
}

/* ****************************************
 * Check for existing classification (Needed by validation middleware)
 * *************************************** */
async function checkExistingClassification(classification_name) {
    try {
        const sql = "SELECT * FROM classification WHERE classification_name = $1"
        const classification = await pool.query(sql, [classification_name])
        // Returns count > 0 if classification exists
        return classification.rowCount
    } catch (error) {
        console.error("checkExistingClassification error: " + error)
        return 0 // Assume not existing if database check fails (though error handling middleware should catch this)
    }
}

/* ****************************************
 * Insert a new inventory item into the database (TASK 3)
 * *************************************** */
async function registerInventory(
    inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, classification_id
) {
    try {
        const sql = 
            "INSERT INTO inventory (inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, classification_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *"
        return await pool.query(sql, [
            inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, classification_id
        ])
    } catch (error) {
        console.error("registerInventory error: " + error)
        // Return error object on failure, as controller checks for truthiness
        return false
    }
}
/* **************************************
 * Get inventory item data by inventory Id
 * ************************************ */
async function getInventoryById(inv_id) {
    try {
        // SQL query to join inventory and classification tables and filter by inv_id
        const data = await pool.query(
            "SELECT * FROM public.inventory AS i JOIN public.classification AS c ON i.classification_id = c.classification_id WHERE i.inv_id = $1",
            [inv_id]
        )
        // Returns the first (and should be only) row found
        return data.rows[0]
    } catch (error) {
        console.error("getInventoryById error: " + error)
    }
}
/* *****************************
* Update Inventory Data
* ***************************** */
async function updateInventory(
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
) {
    try {
        // SQL query to update a single inventory item based on inv_id
        // $1 through $10 are the updated values, and $11 is the inv_id for the WHERE clause
        const sql =
            "UPDATE public.inventory SET inv_make = $1, inv_model = $2, inv_description = $3, inv_image = $4, inv_thumbnail = $5, inv_price = $6, inv_year = $7, inv_miles = $8, inv_color = $9, classification_id = $10 WHERE inv_id = $11 RETURNING *"
        
        // Array of values corresponding to the SQL placeholders
        const data = await pool.query(sql, [
            inv_make,
            inv_model,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_year,
            inv_miles,
            inv_color,
            classification_id,
            inv_id // inv_id is the eleventh parameter
        ])
        
        // Returns the updated row data (if update was successful and one row was updated)
        return data.rows[0]

    } catch (error) {
        console.error("model error: " + error) // Log the error to the console
        throw new Error(error) // Throw an error for the controller to catch
    }
}
/* ***************************
 * Export all functions
 * ************************** */
module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getInventoryItemById,
  registerClassification,
  checkExistingClassification,
  registerInventory,
  getInventoryById,
  updateInventory,
}