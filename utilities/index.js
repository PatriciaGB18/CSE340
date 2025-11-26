// utilities/index.js
const invModel = require("../models/inventory-model");
const Util = {};
const jwt = require("jsonwebtoken"); // Keep requires here
require("dotenv").config(); // Keep requires here

/* ************************
 * Constructs the nav HTML unordered list
 * ************************** */
Util.getNav = async function () {
    let data = await invModel.getClassifications();
    let list = "<ul>";
    list += '<li><a href="/" title="Home page">Home</a></li>';
    data.rows.forEach((row) => { 
        list += "<li>";
        list +=
            '<a href="/inv/type/' +
            row.classification_id +
            '" title="See our inventory of ' +
            row.classification_name +
            ' vehicles">' +
            row.classification_name +
            "</a>";
        list += "</li>";
    });
    // Link for Inventory Management (used by Task 3)
    list += '<li><a href="/inv" title="Manage the Inventory">Management</a></li>';
    list += "</ul>";
    return list;
};

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/* **************************************
 * Build the classification view HTML
 * ************************************ */
Util.buildClassificationGrid = async function(data){
    let grid;
    if(data.length > 0){
        grid = '<ul id="inv-display">';
        data.forEach(vehicle => { 
            grid += '<li>';
            grid +=   '<a href="../../inv/detail/'+ vehicle.inv_id 
            + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
            + ' details"><img src="' + vehicle.inv_thumbnail 
            +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
            +' on CSE Motors" /></a>';
            grid += '<div class="namePrice">';
            grid += '<hr />';
            grid += '<h2>';
            grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
            + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
            + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>';
            grid += '</h2>';
            grid += '<span>$' 
            + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>';
            grid += '</div>';
            grid += '</li>';
        });
        grid += '</ul>';
    } else { 
        grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>';
    }
    return grid;
};

/* **************************************
 * Helper functions for formatting
 * ************************************ */
Util.formatCurrencyUSD = function (value) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
};

Util.formatNumber = function (value) {
    return new Intl.NumberFormat('en-US').format(value);
};

/* **************************************
 * Build vehicle detail HTML
 * ************************************ */
Util.wrapVehicleAsHTML = function (vehicle) {
    const price = Util.formatCurrencyUSD(vehicle.inv_price || 0);
    const mileage = Util.formatNumber(vehicle.inv_miles) || 'N/A';
    const title = `${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}`;

    return `
      <div class="vehicle-detail">
        <div class="vehicle-image">
          <img src="${vehicle.inv_image}" alt="${title}" />
        </div>
        <div class="vehicle-info">
          <h1 class="vehicle-title">${vehicle.inv_make} ${vehicle.inv_model}</h1>
          <h2 class="vehicle-sub">${vehicle.inv_year} • ${price}</h2>
          <p class="vehicle-meta"><strong>Mileage:</strong> ${mileage}</p>
          <p class="vehicle-meta"><strong>Color:</strong> ${vehicle.inv_color || 'N/A'}</p>
          <div class="vehicle-desc">
            <h3>Description</h3>
            <p>${vehicle.inv_description || 'No description available.'}</p>
          </div>
        </div>
      </div>
    `;
};

/* ****************************************
 * Build classification select list 
 * ************************************ */
Util.buildClassificationList = async function (classification_id = null) {
    let data = await invModel.getClassifications(); 
    let classificationList =
        '<select name="classification_id" id="classificationList" required class="form-control">'; 
    classificationList += "<option value=''>Choose a Classification</option>";
    data.rows.forEach((row) => {
        classificationList += '<option value="' + row.classification_id + '"';
        if (
            classification_id != null &&
            Number(row.classification_id) === Number(classification_id) 
        ) {
            classificationList += " selected ";
        }
        classificationList += ">" + row.classification_name + "</option>";
    });
    classificationList += "</select>";
    return classificationList;
};


/* ****************************************
* Middleware to check token validity (Task 1, 3, 5, 6)
* This is the function used globally in server.js
**************************************** */
Util.checkJWT = (req, res, next) => {
    if (req.cookies.jwt) {
        // Verify the token
        jwt.verify(
            req.cookies.jwt,
            process.env.ACCESS_TOKEN_SECRET,
            function (err, accountData) {
                if (err) {
                    req.flash("notice", "Please log in");
                    res.clearCookie("jwt");
                    return res.redirect("/account/login");
                }
                // If verification is successful, store account data in res.locals
                res.locals.accountData = accountData;
                res.locals.loggedin = 1; // Set a flag indicating the user is logged in
                next();
            }
        );
    } else {
        res.locals.loggedin = 0; // User is not logged in
        next();
    }
};

/* ****************************************
* Check Login (Used to protect routes, Task 3, 5)
* *************************************** */
Util.checkLogin = (req, res, next) => {
    if (res.locals.loggedin) {
        next();
    } else {
        req.flash("notice", "Please log in.");
        return res.redirect("/account/login");
    }
};

/* ****************************************
* Check Account Type for Authorization (Task 2)
* *************************************** */
Util.checkAuthorization = (req, res, next) => {
    // Check if the user is logged in
    if (res.locals.loggedin) {
        const accountType = res.locals.accountData.account_type;

        // Check if the account type is 'Employee' or 'Admin'
        if (accountType === "Employee" || accountType === "Admin") {
            next(); // User is authorized, proceed
        } else {
            // User is logged in but not authorized for this area
            req.flash("notice", "You are not authorized to access the inventory management area.");
            // Redirect to account management view
            res.redirect("/account/");
        }
    } else {
        // User is not logged in
        req.flash("notice", "Please log in to access the inventory management area.");
        // Redirect to login view
        return res.redirect("/account/login");
    }
};


module.exports = Util;