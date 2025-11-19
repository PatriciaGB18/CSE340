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
      .withMessage("A valid email is required."),

    
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


module.exports = validate


