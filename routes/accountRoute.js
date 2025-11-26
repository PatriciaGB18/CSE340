// routes/accountRoute.js

// Needed Resources
const express = require("express");
const router = new express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities/");
const regValidate = require("../utilities/account-validation"); 
const accountValidate = require("../middlewares/accountValidation");


/* ****************************************
 * Deliver Login View (GET)
 * *************************************** */
router.get("/login", utilities.handleErrors(accountController.buildLogin));

/* ****************************************
 * Deliver Registration View (GET)
 * *************************************** */
router.get("/register", utilities.handleErrors(accountController.buildRegister))


// Route to build account management view
router.get(
  "/", 
  utilities.handleErrors(accountController.buildAccountManagement) 
)
/* ****************************************
 * Process Registration (POST)
 * *************************************** */
router.post(
  "/register",
  regValidate.registrationRules(), 
  regValidate.checkRegData, 
  utilities.handleErrors(accountController.registerAccount) 
);

/* ****************************************
 * Process the login attempt (POST)
 * *************************************** */
router.post(
  "/login",
  regValidate.loginRules(), 
  regValidate.checkLoginData, 
  utilities.handleErrors(accountController.accountLogin) 
)
// Route to handle logout request
router.get("/logout", utilities.handleErrors(accountController.accountLogout));

// Requires checkLogin to ensure only logged-in users can access
router.get("/update/:accountId", utilities.checkLogin, utilities.handleErrors(accountController.buildUpdateView));

// Route to process the account update form submission
router.post("/update/",
    utilities.checkLogin,
    accountValidate.updateRules(),
    accountValidate.checkUpdateData,
    utilities.handleErrors(accountController.updateAccount)
);

// Route to process the password change form submission
router.post("/change-password/",
    utilities.checkLogin,
    accountValidate.passwordRules(),
    accountValidate.checkPassword,
    utilities.handleErrors(accountController.updatePassword)
);
module.exports = router;