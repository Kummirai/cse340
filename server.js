/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")
const expressLayouts = require("express-ejs-layouts")

/* ***********************
 * Routes
 *************************/
app.use(static)

app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layouts") // not at views root


app.get("/", (req, res) => {
  res.render("index", {
    title: "Home",
    description: "This is the home page",
  })
})

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT || 5500
const host = process.env.HOST || "localhost"

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
