/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/

/* ***********************
 * Require Statements
 *************************/
const path = require("path")            // necessário para caminhos absolutos
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")

/* ***********************
 * View Engine and Templates
 *************************/

// Define explicitamente a pasta base das views
app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "layouts/layout")  // relativo à pasta views, sem './'

// Serve arquivos estáticos (CSS, JS, imagens)
app.use(express.static(path.join(__dirname, "public")))

/* ***********************
 * Routes
 *************************/
app.get("/", function(req, res) {
  res.render("index", { title: "Home" })
})

app.use(static)

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT || 3000
const host = process.env.HOST || "0.0.0.0"

/* ***********************
 * Log statement to confirm server operation
 *************************/

app.listen(port, () => {
  console.log(`App listening on ${host}:${port}`)
})
