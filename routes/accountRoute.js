// routes/accountRoute.js

// Needed Resources
const express = require("express");
const router = new express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities/"); // <-- MANTER APENAS ESTA LINHA
const regValidate = require("../utilities/account-validation"); 

// --- Rotas de Inventário (Removidas para limpar este arquivo) ---
// Note: As linhas abaixo pertencem ao arquivo inventoryRoute.js e foram removidas daqui:
// const invController = require("../controllers/inventoryController") 
// router.get("/", utilities.handleErrors(invController.buildManagement))
// -------------------------------------------------------------------

/* ****************************************
 * Deliver Login View (GET)
 * *************************************** */
router.get("/login", utilities.handleErrors(accountController.buildLogin));

/* ****************************************
 * Deliver Registration View (GET)
 * *************************************** */
router.get("/register", utilities.handleErrors(accountController.buildRegister))


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
  utilities.handleErrors(accountController.accountLogin) // NOTE: O controller para login geralmente é 'accountLogin' ou similar, não 'registerAccount'
)

module.exports = router;