const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 *  Build vehicle detail view
 * ************************** */
/* ***************************
 * Build vehicle detail view
 * ************************** */
invCont.buildVehicleDetailView = async function (req, res, next) {
  const invId = req.params.inv_id
  try {
    const vehicle = await invModel.getInventoryItemById(invId)
    if (!vehicle) {
      const err = new Error("Vehicle not found")
      err.status = 404
      return next(err)
    }

    const nav = await utilities.getNav()
    // AQUI ESTÁ A MUDANÇA:
    // 1. Chamamos a nova função da utility para construir o HTML
    const vehicleDetail = utilities.wrapVehicleAsHTML(vehicle)

    res.render("inventory/detail", {
      title: `${vehicle.inv_make} ${vehicle.inv_model}`,
      nav,
      // 2. Passamos o HTML gerado para a view
      vehicleDetail,
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Build inventory management view
 * ************************** */
invCont.buildManagementView = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    message: null,
  })
}

/* ***************************
 *  Build Add Classification View
 * ************************** */
invCont.buildAddClassification = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("inventory/add-classification", {
    title: "Add New Classification",
    nav,
    errors: null
  })
}

// Handle form submission to add classification
invCont.addClassification = async function (req, res, next) {
  try {
    const { classification_name } = req.body;
    await invModel.insertClassification(classification_name);
    res.redirect("/inv/management");
  } catch (error) {
    next(error);
  }
}

/* ***************************
 *  Build Add Vehicle View
 * ************************** */
/* ***************************
 *  Build Add Vehicle View
 * ************************** */
invCont.buildAddVehicle = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()

    const classifications = await invModel.getClassifications()
    console.log("classifications:", classifications)

    const classificationSelect =
      await utilities.buildClassificationList(classifications)

    res.render("inventory/add-vehicle", {
      title: "Add New Vehicle",
      nav,
      classificationSelect,
      errors: null
    })
  } catch (error) {
    console.error("buildAddVehicle error:", error)
    next(error)
  }
}





// Handle form submission to add vehicle
invCont.addVehicle = async function (req, res, next) {
  try {
    const vehicleData = req.body
    await invModel.insertVehicle(vehicleData)
    res.redirect("/inv/management")
  } catch (error) {
    next(error)
  }
}

/* ***************************
 * Trigger an intentional 500 error (Task 3)
 * ************************** */
invCont.triggerError = async function (req, res, next) {
  // This will intentionally throw an error
  throw new Error("500 Error Test - This is an intentional error.")
}

module.exports = invCont
