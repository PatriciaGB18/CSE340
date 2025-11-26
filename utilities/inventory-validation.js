// utilities/inventory-validation.js

const { body, validationResult } = require("express-validator")
const utilities = require(".")
const validate = {}
const invModel = require("../models/inventory-model") 

/* **********************************
 * Add Classification Validation Rules
 * ********************************* */
validate.classificationRules = () => {
    return [
        // classification_name is required and must not contain spaces or special characters
        body("classification_name")
            .trim()
            .isLength({ min: 1 })
            .withMessage("Please provide a classification name.")
            // Custom validation to check for spaces and special characters
            .matches(/^\S+$/)
            .withMessage("Classification name must not contain spaces or special characters.")
            // Check if classification name already exists
            .custom(async (classification_name) => {
                const classificationExists = await invModel.checkExistingClassification(classification_name)
                // The checkExistingClassification model function returns rowCount (0 or > 0)
                if (classificationExists) {
                    throw new Error("Classification name already exists. Please choose a different name.")
                }
            }),
    ]
}

/* **********************************
 * Check data and return errors or continue to registration
 * ********************************* */
validate.checkClassificationData = async (req, res, next) => {
    const { classification_name } = req.body
    let errors = validationResult(req)
    let nav = await utilities.getNav()

    if (!errors.isEmpty()) {
        res.render("inventory/add-classification", {
            errors,
            title: "Add New Classification",
            nav,
            classification_name, // Stickiness
        })
        return
    }
    next()
}


/* **********************************
 * Add Inventory Validation Rules
 * ********************************* */
validate.inventoryRules = () => {
    return [
        body("classification_id")
            .trim()
            .isInt({ min: 1 }) // classification_id must be a valid integer
            .withMessage("Please select a classification."),

        body("inv_make")
            .trim()
            .isLength({ min: 3 })
            .withMessage("Please provide a vehicle make (min 3 characters)."),

        body("inv_model")
            .trim()
            .isLength({ min: 3 })
            .withMessage("Please provide a vehicle model (min 3 characters)."),

        body("inv_description")
            .trim()
            .isLength({ min: 5 })
            .withMessage("Please provide a description (min 5 characters)."),

        body("inv_image")
            .trim()
            .isLength({ min: 6 })
            .withMessage("Please provide an image path (min 6 characters).")
            .matches(/^\/images\/vehicles\/[^/]+\.(jpg|jpeg|png)$/) // Basic path validation
            .withMessage("Image path must be a valid path (e.g., /images/vehicles/file.png)."),

        body("inv_thumbnail")
            .trim()
            .isLength({ min: 6 })
            .withMessage("Please provide a thumbnail path (min 6 characters).")
            .matches(/^\/images\/vehicles\/[^/]+\.(jpg|jpeg|png)$/) // Basic path validation
            .withMessage("Thumbnail path must be a valid path (e.g., /images/vehicles/file-tn.png)."),

        body("inv_price")
            .trim()
            .isNumeric()
            .withMessage("Price must be a number.")
            .isFloat({ min: 1 })
            .withMessage("Price must be greater than zero."),

        body("inv_year")
            .trim()
            .isInt({ min: 1886, max: new Date().getFullYear() + 1 }) // Basic year range
            .withMessage("Please provide a valid year."),

        body("inv_miles")
            .trim()
            .isInt({ min: 0 })
            .withMessage("Miles must be a positive integer."),

        body("inv_color")
            .trim()
            .isLength({ min: 3 })
            .withMessage("Please provide a vehicle color (min 3 characters)."),
    ]
}

/* **********************************
 * Check data and return errors or continue to inventory registration
 * ********************************* */
validate.checkInventoryData = async (req, res, next) => {
    const { classification_id } = req.body
    let errors = validationResult(req)
    let nav = await utilities.getNav()

    if (!errors.isEmpty()) {
        const classificationList = await utilities.buildClassificationList(classification_id) // Rebuild for stickiness
        res.render("inventory/add-inventory", {
            errors,
            title: "Add New Vehicle",
            nav,
            classificationList,
            // Pass all form values back for stickiness using spread operator or explicit naming
            ...req.body, 
        })
        return
    }
    next()
}
/* ****************************************
 * Check data and return to edit view or proceed to update
 * Renders the EDIT-INVENTORY view upon failure.
 * *************************************** */
validate.checkUpdateData = async (req, res, next) => {
    // Coleta todos os dados, incluindo o inv_id oculto
    const { inv_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, classification_id } = req.body
    
    // Rebusca os dados necessários para renderizar a lista de classificação
    let classificationSelect = await utilities.buildClassificationList(classification_id)
    
    // Checa por erros de validação
    let errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        // Determina o nome do item para o título com base nos dados recebidos
        const itemName = `${inv_make} ${inv_model}` 
        
        // Renderiza a VIEW DE EDIÇÃO (Crucial: render 'edit-inventory')
        res.render("./inventory/edit-inventory", {
            title: "Edit " + itemName,
            nav,
            classificationSelect: classificationSelect,
            errors: errors.array(), // Passa os erros de validação
            // Passa de volta todos os campos do formulário (stickiness) incluindo inv_id
            inv_id, // IMPORTANTE: Garante que inv_id é passado de volta para o campo oculto
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
        return // Para a execução se forem encontrados erros
    }
    next() // Continua para a função do controlador (updateInventory) se não houver erros
}

// IMPORTANTE: Não se esqueça de adicionar 'checkUpdateData' ao módulo de exports
// no final do seu arquivo utilities/inventory-validation.js.
module.exports = validate