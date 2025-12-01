const express = require("express");
const router = new express.Router();
const utilities = require("../utilities/");
const reviewController = require("../controllers/reviewController");
const reviewValidate = require("../middlewares/reviewValidation");

// Route to process a new review submission
// Requires login and validation
router.post(
    "/submit",
    utilities.checkLogin, // Only logged-in users can submit a review
    reviewValidate.reviewRules(),
    reviewValidate.checkReviewData,
    utilities.handleErrors(reviewController.submitNewReview)
);


/* ****************************************
 * Routes for Review Deletion (NOVO)
 * *************************************** */

// Route to deliver delete confirmation view
// Requires login and uses :reviewId parameter
router.get(
    "/delete/:reviewId",
    utilities.checkLogin, 
    utilities.handleErrors(reviewController.buildDeleteView)
);

// Route to process the delete request
// Requires login and uses POST method for the final action
router.post(
    "/delete",
    utilities.checkLogin, 
    utilities.handleErrors(reviewController.deleteReview)
);
module.exports = router;