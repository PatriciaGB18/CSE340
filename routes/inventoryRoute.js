// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController") // Using invController as confirmed
const utilities = require("../utilities")
const invValidate = require("../utilities/inventory-validation")

// --- Route for Management View (/inv/) ---
// Route to build the management view
router.get("/", utilities.handleErrors(invController.buildManagement)) 

// --- Routes for Adding Classification (Task 2) ---
// Route to deliver add classification view
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification))

// Route to process the new classification submission (Includes Server-side Validation)
router.post(
    "/add-classification",
    invValidate.classificationRules(), // Validation rules
    invValidate.checkClassificationData, // Check validation result and manage stickiness
    utilities.handleErrors(invController.registerClassification) // Controller function
)

// --- Routes for Adding Inventory Item (Vehicle) (Task 3) ---
// Route to deliver add inventory view
router.get("/add-inventory", utilities.handleErrors(invController.buildAddInventory))

// Route to process the new inventory submission (Includes Server-side Validation)
router.post(
    "/add-inventory",
    invValidate.inventoryRules(), // Validation rules
    invValidate.checkInventoryData, // Check validation result and manage stickiness
    utilities.handleErrors(invController.registerInventory) // Controller function
)

// --- Existing Routes (Keep for completeness) ---
// Route to build inventory by classification view
router.get("/type/:classificationId",
    utilities.handleErrors(invController.buildByClassificationId)
)

// Route to build vehicle detail view
router.get("/detail/:inv_id",
    utilities.handleErrors(invController.buildVehicleDetailView)
)

// Route to trigger a 500 error 
router.get("/trigger-error",
    utilities.handleErrors(invController.triggerError)
)

module.exports = router