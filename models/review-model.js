const pool = require("../database/")

/* ***************************
 * Insert a new review into the database
 * ************************** */
async function submitReview(review_text, review_rating, inv_id, account_id) {
    try {
        const sql = "INSERT INTO review (review_text, review_rating, inv_id, account_id) VALUES ($1, $2, $3, $4) RETURNING *";
        const result = await pool.query(sql, [review_text, review_rating, inv_id, account_id]);
        return result.rows[0];
    } catch (error) {
        console.error("submitReview model error: " + error);
        return null;
    }
}

/* ***************************
 * Get reviews for a specific vehicle by inv_id
 * ************************** */
async function getReviewsByInventoryId(inv_id) {
    try {
        // Query joins review data with account firstname to display who wrote the review
        const sql = `
            SELECT
                r.*,
                a.account_firstname
            FROM review r
            JOIN account a
                ON r.account_id = a.account_id
            WHERE r.inv_id = $1
            ORDER BY r.review_date DESC;
        `;
        const result = await pool.query(sql, [inv_id]);
        return result.rows;
    } catch (error) {
        console.error("getReviewsByInventoryId model error: " + error);
        throw new Error("Could not retrieve reviews.");
    }
}

/* ***************************
 * Get review details by review_id
 * ************************** */
async function getReviewByReviewId(review_id) {
    try {
        const sql = "SELECT * FROM review WHERE review_id = $1";
        const result = await pool.query(sql, [review_id]);
        return result.rows[0];
    } catch (error) {
        console.error("getReviewByReviewId model error: " + error);
        throw new Error("Could not retrieve review details.");
    }
}

/* ***************************
 * Delete a specific review by review_id (NOVO)
 * ************************** */
async function deleteReview(review_id) {
    try {
        const sql = "DELETE FROM review WHERE review_id = $1";
        const result = await pool.query(sql, [review_id]);
        return result.rowCount; // Returns 1 if successful, 0 otherwise
    } catch (error) {
        console.error("deleteReview model error: " + error);
        throw new Error("Failed to delete review.");
    }
}

module.exports = {
    submitReview,
    getReviewsByInventoryId,
    getReviewByReviewId, 
    deleteReview 
};