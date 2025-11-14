// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities")

// Route to build inventory by classification view
router.get("/type/:classificationId",
  utilities.handleErrors(invController.buildByClassificationId)
)

router.get("/detail/:inv_id",
  utilities.handleErrors(invController.buildVehicleDetailView)
)

router.get("/", utilities.handleErrors(invController.buildManagementView))
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification))
router.post("/add-classification", utilities.handleErrors(invController.addClassification))
router.get("/add-vehicle", utilities.handleErrors(invController.buildAddVehicle))
router.post("/add-vehicle", utilities.handleErrors(invController.addVehicle))

router.get("/management", utilities.handleErrors(invController.buildManagementView))

// Route to trigger a 500 error (Task 3)
router.get("/trigger-error",
  utilities.handleErrors(invController.triggerError)
)

module.exports = router
