const invModel = require("../models/inventory-model")
const utilities = require("../utilities/") 

const reviewModel = require("../models/review-model"); 

const invCont = {}

/* ****************************************
 * Deliver management view
 * Route: /inv/ 
 * * FIX: This function now includes the logic to fetch 
 * the classification list, resolving the EJS error.
 * *************************************** */
invCont.buildManagement = async function (req, res, next) {
    const nav = await utilities.getNav()
    // 1. Build the classification select list, needed for management view
    const classificationSelect = await utilities.buildClassificationList() 

    res.render("inventory/management", {
        title: "Inventory Management",
        nav,
        errors: null,
        classificationSelect, // Pass the select list to the view
    })
}

/* ****************************************
 * Deliver add classification view
 * Route: /inv/add-classification (GET)
 * *************************************** */
invCont.buildAddClassification = async function (req, res, next) {
    const nav = await utilities.getNav() 
    res.render("inventory/add-classification", {
        title: "Add New Classification",
        nav, 
        errors: null, 
        classification_name: "",
    })
}

invCont.buildByClassificationId = async function (req, res, next) {
    const classification_id = req.params.classificationId;
    const nav = await utilities.getNav(); 
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
            errors: null,
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

/* ***************************
 * Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
    // Collect classification_id from URL parameters and cast to integer
    const classification_id = parseInt(req.params.classification_id) 
    
    // Call the model function to fetch inventory data
    const invData = await invModel.getInventoryByClassificationId(classification_id)
    
    // Check if data was returned (inv_id on the first element ensures it's inventory data)
    if (invData.length > 0 && invData[0].inv_id) {
      return res.json(invData) // Return the data as a JSON object
    } else {
      // It's safer to throw an error via next() or return an empty JSON object, 
      // but following the original instruction's check:
      next(new Error("No data returned")) // Throw an error if no data is found
    }
}

/* ****************************************
 * Build vehicle detail view (MODIFIED for Reviews)
 * *************************************** */
invCont.buildVehicleDetailView = async function(req, res, next) {
    const inv_id = req.params.inv_id
    let nav = await utilities.getNav()

    // 1. Get vehicle data - O Model retorna um objeto único (data.rows[0])
    let vehicle;
    try {
        // Usando getInventoryById que retorna um objeto
        vehicle = await invModel.getInventoryById(inv_id) 
    } catch (error) {
        console.error("Error retrieving vehicle data:", error);
        throw new Error("Failed to retrieve vehicle details.");
    }
    
    // Check if vehicle data was found (se o veículo não existe ou tem dados incompletos)
    if (!vehicle || !vehicle.inv_make) {
        // Envia para o manipulador de erros 404
        const err = new Error(`Vehicle with ID ${inv_id} not found or data is missing.`)
        err.status = 404
        return next(err) 
    }

    // 2. Get reviews for this vehicle (NEW REQUIREMENT)
    const reviews = await reviewModel.getReviewsByInventoryId(inv_id); 

    // 3. Build HTML display
    const detailDisplay = utilities.wrapVehicleAsHTML(vehicle)
    
    // 4. Build Review HTML display 
    // CORREÇÃO FINAL: Passa reviews, inv_id e res.locals para acessar erros/sticky data
    const reviewSection = utilities.buildReviewSection(reviews, vehicle.inv_id, res.locals); 

    res.render("inventory/detail", {
        title: `${vehicle.inv_make} ${vehicle.inv_model}`,
        nav,
        detailDisplay, 
        reviewSection, 
        errors: null,
    })
}

/* ***************************
 * Build edit inventory view
 * ************************** */
invCont.buildEditInventoryView = async function (req, res, next) {
    
    const inv_id = parseInt(req.params.inv_id)
    
    const nav = await utilities.getNav()
    
    
    // NOTE: This uses getInventoryById, which is assumed to return a single object (rows[0])
    const itemData = await invModel.getInventoryById(inv_id)

    // Check for itemData existence
    if (!itemData || itemData.length === 0) {
        throw new Error("Item not found.")
    }

    // Since getInventoryById often returns an array, ensure we use the object from the array
    const item = Array.isArray(itemData) ? itemData[0] : itemData;
    
    
    const classificationSelect = await utilities.buildClassificationList(item.classification_id)
    
    
    const itemName = `${item.inv_make} ${item.inv_model}`
    
    
    res.render("./inventory/edit-inventory", {
        title: "Edit " + itemName, 
        nav,
        classificationSelect: classificationSelect,
        errors: null,
        
        inv_id: item.inv_id,
        inv_make: item.inv_make,
        inv_model: item.inv_model,
        inv_year: item.inv_year,
        inv_description: item.inv_description,
        inv_image: item.inv_image,
        inv_thumbnail: item.inv_thumbnail,
        inv_price: item.inv_price,
        inv_miles: item.inv_miles,
        inv_color: item.inv_color,
        classification_id: item.classification_id
    })
}

/* ***************************
 * Process inventory update
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
    // Collect all form data, including the hidden inv_id
    const {
        inv_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, classification_id
    } = req.body

    // Call the Model function to execute the UPDATE query
    const updateResult = await invModel.updateInventory(
        inv_id,
        inv_make,
        inv_model,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_year,
        inv_miles,
        inv_color,
        classification_id
    )

    // Check if the update was successful (updateResult will contain the updated row)
    if (updateResult) {
        const itemName = updateResult.inv_make + " " + updateResult.inv_model
        req.flash("notice", `The ${itemName} was successfully updated.`)
        // Redirect to the management view on success
        res.redirect("/inv/")
    } else {
        // If update failed (e.g., database error), retrieve necessary data to re-render the view
        const nav = await utilities.getNav()
        const classificationSelect = await utilities.buildClassificationList(classification_id)
        const itemName = `${inv_make} ${inv_model}` 
        
        req.flash("notice", "Sorry, the update failed.")
        
        // Render the edit view again, maintaining stickiness and error message
        res.status(501).render("./inventory/edit-inventory", {
            title: "Edit " + itemName,
            nav,
            classificationSelect: classificationSelect,
            errors: null, // Errors were caught by validation middleware
            inv_id,
            inv_make,
            inv_model,
            inv_year,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_miles,
            inv_color,
            classification_id
        })
    }
}

/* ***************************
 * Build delete inventory view
 * ************************** */
invCont.buildDeleteView = async function buildDeleteView(req, res, next) {
    const inv_id = await parseInt(req.params.inv_id)
    const nav = await utilities.getNav()
    const itemData = await invModel.getInventoryItemById(inv_id)
    
    // Check if itemData exists to avoid errors
    if (!itemData || itemData.length === 0) {
        req.flash("notice", "Sorry, no inventory item was found.")
        return res.redirect("/inv/")
    }

    const itemName = `${itemData.inv_make} ${itemData.inv_model}`
    
    // Render the delete confirmation view
    res.render("./inventory/delete-confirm", {
        title: "Delete " + itemName,
        nav,
        errors: null,
        inv_id: itemData.inv_id,
        inv_make: itemData.inv_make,
        inv_model: itemData.inv_model,
        inv_year: itemData.inv_year,
        inv_price: itemData.inv_price,
    })
}

/* ***************************
 * Process delete inventory item
 * ************************** */
invCont.deleteInventoryItem = async function deleteInventoryItem(req, res, next) {
    const inv_id = parseInt(req.body.inv_id) // Get the inv_id from the hidden input

    // Call the model function to perform the deletion
    const deleteResult = await invModel.deleteInventoryItem(inv_id)

    if (deleteResult) {
        // If successful, send a flash message and redirect to the management view
        req.flash("notice", `The item was successfully deleted.`)
        res.redirect("/inv/")
    } else {
        // If failed, send a flash failure message and re-render the delete view
        const nav = await utilities.getNav()
        req.flash("notice", "Sorry, the deletion failed.")
        // Redirect to rebuild the delete view with the inv_id
        res.redirect(`/inv/delete/${inv_id}`)
    }
}

// Function to trigger a 500 error for testing (required by a previous assignment)
invCont.triggerError = async function (req, res, next) {
    throw new Error("This is a 500 test error.");
}


module.exports = invCont