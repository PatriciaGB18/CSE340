/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/

/* ***********************
 * Require Statements
 *************************/
const path = require("path")
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
require("dotenv").config()

const app = express()

// Controllers & Routes
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")
const utilities = require("./utilities")

/* ***********************
 * View Engine and Templates
 *************************/
app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "layouts/layout")

/* ***********************
 * Static Files
 *************************/
app.use(express.static(path.join(__dirname, "public")))
/* ***********************
 * Body Parsers (important!)
 *************************/
app.use(express.urlencoded({ extended: true })) // <- Mova para cá
app.use(express.json()) 

/* ***********************
 * Routes
 *************************/
// Home route
app.get("/", utilities.handleErrors(baseController.buildHome))

// Inventory routes
app.use("/inv", inventoryRoute)


/* ***********************
 * 404 Handler
 *************************/
app.use(async (req, res, next) => {
  const err = new Error("Sorry, we appear to have lost that page.")
  err.status = 404
  next(err)
})

/* ***********************
 * Error Handler (last middleware)
 *************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  
  const status = err.status || 500
  const message = (status === 404)
    ? err.message
    : "Oh no! There was a crash. Maybe try a different route?"
  
  res.status(status).render("errors/error", {
    title: `${status} - Error`,
    message,
    nav,
    status,
    stack: (app.get("env") === "development") ? err.stack : null
  })
})

/* ***********************
 * Start Server
 *************************/
const port = process.env.PORT || 3000
const host = process.env.HOST || "0.0.0.0"

app.listen(port, host, () => {
  console.log(`App listening on http://${host}:${port}`)
})
