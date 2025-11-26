const utilities = require("../utilities/");
const accountModel = require("../models/account-model");
const { body, validationResult } = require("express-validator");

/* **********************************
 * Account Update Data Validation Rules
 * ********************************* */
const updateRules = () => {
    return [
        body("account_firstname")
            .trim()
            .isLength({ min: 1 })
            .withMessage("Please provide a first name."),

        body("account_lastname")
            .trim()
            .isLength({ min: 2 })
            .withMessage("Please provide a last name."),

        body("account_email")
            .trim()
            .isEmail()
            .normalizeEmail()
            .withMessage("A valid email is required.")
            .custom(async (account_email, { req }) => {
                const account_id = req.body.account_id;
                const accountData = await accountModel.getAccountById(account_id);

                // Only check email if it has changed
                if (account_email != accountData.account_email) {
                    const emailExists = await accountModel.checkExistingEmail(account_email);
                    if (emailExists) {
                        throw new Error("Email exists. Please use a different email.");
                    }
                }
            }),
    ];
};

/* **********************************
 * Password Change Validation Rules
 * ********************************* */
const passwordRules = () => {
    return [
        body("account_password")
            .trim()
            .isLength({ min: 12 })
            .withMessage("Password does not meet requirements.")
            .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9\s])(?!.*\s).{12,}$/)
            .withMessage("Password must meet complexity requirements."),
    ];
};

/* **********************************
 * Check Update Data
 * ********************************* */
const checkUpdateData = async (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    // If validation errors exist, rebuild the update view
    let nav = await utilities.getNav();
    const account_id = req.body.account_id;
    // Re-verify the JWT to get the latest data, or use old data if update failed
    const accountData = res.locals.accountData; 
    
    // Replace the data in res.locals with the submitted data to keep it 'sticky'
    res.locals.accountData = {
        ...accountData,
        account_firstname: req.body.account_firstname,
        account_lastname: req.body.account_lastname,
        account_email: req.body.account_email
    };

    res.render("account/account-update", {
        title: "Account Update",
        nav,
        errors,
        // The sticky data is now in res.locals.accountData
    });
};

/* **********************************
 * Check Password Change
 * ********************************* */
const checkPassword = async (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    // If validation errors exist, rebuild the update view
    let nav = await utilities.getNav();
    const account_id = req.body.account_id;

    res.render("account/account-update", {
        title: "Account Update",
        nav,
        errors,
        // The data in res.locals.accountData remains sticky for the Account Update form
    });
};

module.exports = {
    // ... existing exports ...
    updateRules,
    passwordRules,
    checkUpdateData,
    checkPassword,
};