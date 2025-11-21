// invController.js

const invModel = require("../models/inventory-model")
const utilities = require("../utilities/") 

const invCont = {}

/* ****************************************
 * Deliver management view
 * Route: /inv/ 
 * *************************************** */
invCont.buildManagement = async function (req, res, next) {
    const nav = await utilities.getNav()
    res.render("inventory/management", {
        title: "Inventory Management",
        // Assumes nav is available via res.locals.nav (from app.js middleware)
        nav,
        errors: null,
    })
}

/* ****************************************
 * Deliver add classification view
 * Route: /inv/add-classification (GET)
 * *************************************** */
invCont.buildAddClassification = async function (req, res, next) {
    const nav = await utilities.getNav() // CORREÇÃO: Buscando 'nav'
    res.render("inventory/add-classification", {
        title: "Add New Classification",
        nav, // Passando a NAV obtida
        errors: null, 
        classification_name: "",
    })
}

invCont.buildByClassificationId = async function (req, res, next) {
    const classification_id = req.params.classificationId;
    const nav = await utilities.getNav(); // Injetando NAV
    const data = await invModel.getInventoryByClassificationId(classification_id);
    const grid = await utilities.buildClassificationGrid(data);

    let className = data.length > 0 ? data[0].classification_name : "Vehicle";

    res.render("./inventory/classification", {
        title: className + " vehicles",
        nav,
        grid,
        errors: null,
    });
};


/* ****************************************
 * Process new classification submission
 * Route: /inv/add-classification (POST)
 * *************************************** */
invCont.registerClassification = async function (req, res) {
    // Note: The validation middleware runs first. If validation fails, it re-renders the view.
    const { classification_name } = req.body

    const classificationResult = await invModel.registerClassification(classification_name)

    if (classificationResult) {
        req.flash(
            "notice",
            `Congratulations, the new classification "${classification_name}" has been added.`
        )
        // SUCCESS: Rebuild navigation to show the new classification immediately
        const nav = await utilities.getNav() 
        res.render("inventory/management", {
            title: "Inventory Management",
            nav, // Pass the newly built navigation
        })
    } else {
        // FAILURE:
        req.flash("notice", "Sorry, the registration failed.")
        const nav = await utilities.getNav() // Get nav just in case
        res.status(501).render("inventory/add-classification", {
            title: "Add New Classification",
            nav,
            errors: null, // Errors handled by validation middleware, not here
            classification_name, // Stickiness
        })
    }
}

/* ****************************************
 * Deliver add inventory view
 * Route: /inv/add-inventory (GET)
 * *************************************** */
invCont.buildAddInventory = async function (req, res, next) {
    // Build the classification list dynamically for the select element
    const nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList()
    res.render("inventory/add-inventory", {
        title: "Add New Vehicle",
        nav,
        classificationList, // Pass the dynamically built list
        errors: null,
        // Initial setup for sticky data
        inv_make: "", inv_model: "", inv_description: "", inv_image: "/images/vehicles/no-image.png", inv_thumbnail: "/images/vehicles/no-image-tn.png", inv_price: "", inv_year: "", inv_miles: "", inv_color: "", classification_id: "",
    })
}

/* ****************************************
 * Process new inventory submission
 * Route: /inv/add-inventory (POST)
 * *************************************** */
invCont.registerInventory = async function (req, res) {
    // Note: The validation middleware runs first. If validation fails, it handles stickiness.
    const { 
        inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, classification_id
    } = req.body

    const inventoryResult = await invModel.registerInventory(
        inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, classification_id
    )

    if (inventoryResult) {
        // SUCCESS: Display message on the Management View
        req.flash(
            "notice",
            `Success! The ${inv_make} ${inv_model} has been added to the inventory.`
        )
        // Redirect to the management view (Task 3 requirement)
        res.redirect("/inv/") 
    } else {
        // FAILURE: Re-render the form with error message and stickiness
        const nav = await utilities.getNav()
        const classificationList = await utilities.buildClassificationList(classification_id) // Rebuild for stickiness
        
        req.flash("notice", "Sorry, adding the vehicle failed.")
        res.status(501).render("inventory/add-inventory", {
            title: "Add New Vehicle",
            nav,
            classificationList,
            errors: null,
            // Pass all form values back for stickiness
            inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, classification_id,
        })
    }
}

// ... Keep your existing functions (like buildByClassificationId) ...

module.exports = invCont