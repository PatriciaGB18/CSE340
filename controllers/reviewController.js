const reviewModel = require("../models/review-model");
const invController = require("./invController"); // To reuse the buildVehicleDetailView
const utilities = require("../utilities/");

/* ****************************************
 * Process New Review Submission
 * *************************************** */
async function submitNewReview(req, res, next) {
    const { review_text, review_rating, inv_id } = req.body;
    
    // 1. Get the account_id from the session (must be logged in)
    const account_id = res.locals.accountData.account_id;

    // 2. Check for validation errors passed from the middleware
    const errors = res.locals.errors;
    if (errors && !errors.isEmpty()) {
        req.flash("notice", "Review submission failed. Please check your entries.");
        res.locals.review_text = review_text;
        res.locals.review_rating = review_rating;
        req.params.inv_id = inv_id; 
        return invController.buildVehicleDetailView(req, res, next);
    }
    
    // 3. If no errors, save the review to the database
    const reviewResult = await reviewModel.submitReview(
        review_text,
        review_rating,
        inv_id,
        account_id
    );

    if (reviewResult) {
        req.flash("notice", "Review submitted successfully.");
    } else {
        req.flash("notice", "Sorry, review submission failed.");
    }
    
    // 4. Redirect back to the vehicle detail page to display the new review
    res.redirect(`/inv/detail/${inv_id}`);
}

/* ****************************************
 * Deliver delete confirmation view (GET)
 * *************************************** */
async function buildDeleteView(req, res, next) {
    const review_id = parseInt(req.params.reviewId);
    let nav = await utilities.getNav();
    
    const reviewData = await reviewModel.getReviewByReviewId(review_id);
    
    
    if (!reviewData) { 
        req.flash("notice", "Review not found.");
        return res.redirect("/account/"); 
    }
    
    
    if (reviewData.account_id !== res.locals.accountData.account_id) {
        req.flash("notice", "Access Denied. You can only delete your own reviews.");
        return res.redirect(`/inv/detail/${reviewData.inv_id}`);
    }

    res.render("review/delete-confirm", {
        title: "Delete Review",
        nav,
        review_id: reviewData.review_id,
        review_date: reviewData.review_date.toLocaleDateString('en-US'),
        review_text: reviewData.review_text,
        inv_id: reviewData.inv_id,
        errors: null
    });
}

/* ****************************************
 * Process review deletion (POST) 
 * *************************************** */
async function deleteReview(req, res, next) {
    const { review_id, inv_id } = req.body;
    const review_id_int = parseInt(review_id);
    
    
    const reviewData = await reviewModel.getReviewByReviewId(review_id_int);
    
    
    if (!reviewData || reviewData.account_id !== res.locals.accountData.account_id) {
        req.flash("notice", "Deletion failed: Authorization denied or review not found.");
        
        return res.redirect(`/inv/detail/${inv_id}`);
    }
    
    
    const deleteResult = await reviewModel.deleteReview(review_id_int);
    
    if (deleteResult) {
        req.flash("notice", `Review was successfully deleted.`);
    } else {
        req.flash("notice", "Review deletion failed (Server error).");
    }
    
    
    res.redirect(`/inv/detail/${inv_id}`);
}

module.exports = {
    submitNewReview,
    buildDeleteView, 
    deleteReview 
};