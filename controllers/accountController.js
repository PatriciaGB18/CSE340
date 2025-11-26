const bcrypt = require("bcryptjs")
const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const jwt = require("jsonwebtoken")
require("dotenv").config()
/* ****************************************
 * Deliver login view
 * *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
  })
}

/* ****************************************
 * Deliver registration view
 * *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  })
}

/* ****************************************
 * Process Registration
 * *************************************** */


/* ****************************************
 * Process Registration
 * *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // 1. Hash the password before storing
  let hashedPassword
  try {
    
    hashedPassword = await bcrypt.hash(account_password, 10) 
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
      account_firstname,
      account_lastname,
      account_email,
    })
    return 
  }

  
  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword 
  )

  
  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      
    })
  }
}

/* ****************************************
 * Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)

  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }

  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })

      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }

      return res.redirect("/account/")
    }
    else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

/* ****************************************
 * Build account management view
 * ************************************ */
async function buildAccountManagement(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/account-management", { 
    title: "Account Management",
    nav,
   
    errors: null, 
  })
}

/* ****************************************
 * Process account logout
 * *************************************** */
async function accountLogout(req, res, next) {
  // Clear the JWT cookie from the client's browser
  res.clearCookie("jwt");
  // Redirect the client to the home view
  res.redirect("/");
}

/* ****************************************
 * Deliver account update view
 * *************************************** */
async function buildUpdateView(req, res, next) {
    const account_id = parseInt(req.params.accountId);
    let nav = await utilities.getNav();
    const accountData = await accountModel.getAccountById(account_id);

    // If the account ID from the URL does not match the logged-in user, redirect to management view
    if (accountData.account_id !== res.locals.accountData.account_id) {
        req.flash("notice", "Unauthorized access attempt.");
        return res.redirect("/account/");
    }

    // Since checkJWT already loaded the data into res.locals.accountData, 
    // we don't need to pass the data explicitly to the view; it's already available.
    res.render("account/account-update", {
        title: "Account Update",
        nav,
        errors: null,
    });
}


/* ****************************************
 * Process account update
 * *************************************** */
async function updateAccount(req, res, next) {
    const { account_firstname, account_lastname, account_email, account_id } = req.body;

    const updateResult = await accountModel.updateAccount(
        account_firstname,
        account_lastname,
        account_email,
        account_id
    );

    if (updateResult) {
        req.flash("notice", `Account details updated successfully.`);

        // 1. Re-query the database to get the NEW account data
        const accountData = await accountModel.getAccountById(account_id);

        // 2. Create a new JWT token with the NEW data
        const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 });

        // 3. Set the new token in the cookie (resets the logged-in data)
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
        
        // 4. Update the res.locals for the immediate view render
        res.locals.accountData = accountData;

        // Deliver the management view where the updated information will be displayed
        res.redirect("/account/");
    } else {
        req.flash("notice", "Sorry, the account update failed.");
        let nav = await utilities.getNav();
        const accountData = await accountModel.getAccountById(account_id);
        
        // Use submitted data as sticky data for the update view in case of failure
        res.locals.accountData = {
            ...accountData,
            account_firstname,
            account_lastname,
            account_email
        };

        res.render("account/account-update", {
            title: "Account Update",
            nav,
            errors: null, // Errors are already handled by checkUpdateData middleware
        });
    }
}


/* ****************************************
 * Process password change
 * *************************************** */
async function updatePassword(req, res, next) {
    const { account_password, account_id } = req.body;

    // Hash the new password before updating
    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hash(account_password, 10);
    } catch (error) {
        req.flash("notice", 'Sorry, there was an error processing the password.');
        return res.redirect("/account/");
    }

    const updateResult = await accountModel.updatePassword(
        hashedPassword,
        account_id
    );

    if (updateResult) {
        req.flash("notice", `Password updated successfully.`);
        // Redirect to management view
        res.redirect("/account/");
    } else {
        req.flash("notice", "Sorry, the password change failed.");
        let nav = await utilities.getNav();
        
        // Redirect to management view after failure to show message
        res.redirect("/account/");
    }
}

module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildAccountManagement, accountLogout,
  buildUpdateView,updateAccount,updatePassword, }