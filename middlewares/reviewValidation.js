const { body, validationResult } = require("express-validator");
const utilities = require("../utilities/");

/* **********************************
 * Review Submission Validation Rules
 * ********************************* */
const reviewRules = () => {
    return [
        // Review text is required and must not be empty
        body("review_text")
            .trim()
            .isLength({ min: 5 })
            .withMessage("Review text must be at least 5 characters long."),

        // Rating is required and must be an integer between 1 and 5
        body("review_rating")
            .isInt({ min: 1, max: 5 })
            .withMessage("A rating between 1 and 5 is required."),
    ];
};

/* **********************************
 * Check Review Data
 * ********************************* */
const checkReviewData = async (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    
    // If validation fails, we need to return to the vehicle detail view
    // The controller (reviewController.js) will handle re-rendering the detail view
    // Here we just attach the errors to the request object
    res.locals.errors = errors; 
    
    // We redirect back to the controller logic to handle the re-render of the detail view
    next(); 
};

module.exports = {
    reviewRules,
    checkReviewData,
};