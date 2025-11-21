const accountModel = require("../models/account-model")
const utilities = require("./index"); 
const { body, validationResult } = require("express-validator");
const validate = {};

/* ****************************************
 * Registration Data Validation Rules
 * *************************************** */
validate.registrationRules = () => {
  return [
    
    body("account_firstname")
      .trim()
      .escape() 
      .notEmpty() 
      .withMessage("Please provide a first name."), 

    
    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a last name."),

    
    body("account_email")
      .trim()
      .escape()
      .notEmpty()
      .isEmail() 
      .normalizeEmail() 
      .withMessage("A valid email is required.")
      .custom(async (account_email) => { 
    const emailExists = await accountModel.checkExistingEmail(account_email)
    if (emailExists){
      throw new Error("Email exists. Please log in or use different email")
    }
  }),

    
    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      }) 
      .withMessage("Password does not meet requirements."),
  ];
};

/* ****************************************
 * Check data and return errors or continue
 * *************************************** */

/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
  
  const { account_firstname, account_lastname, account_email } = req.body
  let errors = []

  
  errors = validationResult(req)

  if (!errors.isEmpty()) { 
    let nav = await utilities.getNav()
    res.render("account/register", {
      errors, 
      title: "Registration",
      nav,
      
      account_firstname,
      account_lastname,
      account_email,
    })
    return 
  }
  next() 
}
/* ****************************************
 * Login Data Validation Rules
 * *************************************** */
validate.loginRules = () => {
  return [
    // O email é obrigatório, deve ser um email válido e será normalizado
    body("account_email")
      .trim()
      .escape()
      .notEmpty()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required."),

    // A senha é obrigatória
    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Password is required."),
  ]
}

/* ******************************
 * Check data and return errors or continue to login process
 * ***************************** */
validate.checkLoginData = async (req, res, next) => {
  const { account_email } = req.body
  let errors = validationResult(req)

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/login", {
      errors,
      title: "Login",
      nav,
      account_email, // Stickiness
    })
    return
  }
  next()
}

module.exports = validate


