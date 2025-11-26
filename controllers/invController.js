const invModel = require("../models/inventory-model")
const utilities = require("../utilities/") 

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


/* ***************************
 * Build edit inventory view
 * ************************** */
invCont.buildEditInventoryView = async function (req, res, next) {
    // Coleta o inv_id da URL e converte para inteiro
    const inv_id = parseInt(req.params.inv_id)
    
    const nav = await utilities.getNav()
    
    // Chama o modelo para obter os dados do item
    const itemData = await invModel.getInventoryById(inv_id)

    // Constrói o menu suspenso de classificações, pré-selecionando a classificação atual do item
    const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
    
    // Cria o nome para o título da página
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`
    
    // Renderiza a view de edição
    res.render("./inventory/edit-inventory", {
        title: "Edit " + itemName, // Título da página
        nav,
        classificationSelect: classificationSelect,
        errors: null,
        // Passa todos os dados do item para preencher o formulário (stickiness)
        inv_id: itemData.inv_id,
        inv_make: itemData.inv_make,
        inv_model: itemData.inv_model,
        inv_year: itemData.inv_year,
        inv_description: itemData.inv_description,
        inv_image: itemData.inv_image,
        inv_thumbnail: itemData.inv_thumbnail,
        inv_price: itemData.inv_price,
        inv_miles: itemData.inv_miles,
        inv_color: itemData.inv_color,
        classification_id: itemData.classification_id
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
module.exports = invCont