const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController") 
const utilities = require("../utilities")
const invValidate = require("../utilities/inventory-validation") // Assumed file for validation

// Helper to ensure utilities is available
const { checkAuthorization, handleErrors } = utilities; 

/* ************************************
 * Inventory Management Routes (RESTRICTED - Task 2)
 * All these routes require 'Employee' or 'Admin' access.
 * ************************************/

// Route to build the management view
router.get("/", checkAuthorization, handleErrors(invController.buildManagement)); 

// --- Routes for Adding Classification ---
// Route to deliver add classification view
router.get("/add-classification", checkAuthorization, handleErrors(invController.buildAddClassification));

// Route to process the new classification submission (Protected POST)
router.post(
    "/add-classification",
    checkAuthorization, // Authorization check here
    invValidate.classificationRules(), 
    invValidate.checkClassificationData, 
    handleErrors(invController.registerClassification)
);

// --- Routes for Adding Inventory Item (Vehicle) ---
// Route to deliver add inventory view
router.get("/add-inventory", checkAuthorization, handleErrors(invController.buildAddInventory));

// Route to process the new inventory submission (Protected POST)
router.post(
    "/add-inventory",
    checkAuthorization, // Authorization check here
    invValidate.inventoryRules(), 
    invValidate.checkInventoryData, 
    handleErrors(invController.registerInventory)
);

// --- Routes for Editing Inventory Item ---
// Route to deliver the edit inventory view (Protected GET)
router.get("/edit/:inv_id", checkAuthorization, handleErrors(invController.buildEditInventoryView));

// Route to process the update inventory data (Protected POST)
router.post(
    "/update",
    checkAuthorization, // Authorization check here
    invValidate.inventoryRules(), 
    invValidate.checkUpdateData, 
    handleErrors(invController.updateInventory)
);

// --- Routes for Deleting Inventory Item ---
// Route to build delete confirmation view (Protected GET)
router.get("/delete/:inv_id", checkAuthorization, handleErrors(invController.buildDeleteView));

// Route to handle the delete process (Protected POST)
router.post("/delete", checkAuthorization, handleErrors(invController.deleteInventoryItem));


/* ************************************
 * Public Routes (NO Authorization check needed - Task 2)
 * These are for general site visitors.
 * ************************************/

// Route to get inventory items by classification ID and return as JSON
router.get("/getInventory/:classification_id", handleErrors(invController.getInventoryJSON));

// Route to build inventory by classification view
router.get("/type/:classificationId",
    handleErrors(invController.buildByClassificationId)
);

// Route to build vehicle detail view
router.get("/detail/:inv_id",
    handleErrors(invController.buildVehicleDetailView)
);

// Route to trigger a 500 error 
router.get("/trigger-error",
    handleErrors(invController.triggerError)
);


module.exports = router;