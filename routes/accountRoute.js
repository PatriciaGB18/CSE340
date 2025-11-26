// routes/accountRoute.js

// Needed Resources
const express = require("express");
const router = new express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities/");
const regValidate = require("../utilities/account-validation"); 


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

module.exports = router;