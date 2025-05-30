/* ***********************
 * Require Statements
 *************************/
const express = require("express");
const path = require("path");
const env = require("dotenv").config();
const app = express();
const static = require("./routes/static");
const inventoryRoute = require("./routes/inventoryRoute");
const expressLayouts = require("express-ejs-layouts");
const baseController = require("./controllers/baseController");
const utilities = require("./utilities/");

/* ***********************
 * Middleware
 *************************/
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

/* ***********************
 * View Engine Setup
 *************************/
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layouts");

/* ***********************
 * Routes
 *************************/
app.use(static);
app.use("/inv", inventoryRoute);
app.get("/", baseController.buildHome);

app.use(async (req, res, next) => {
  next({ status: 404, message: "Sorry we appear to have lost the page!" });
});

/* ***********************
 * Express Error Handler
 * Place after all other middleware
 *************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav();
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);
  res.render("errors/error", {
    title: err.status || "Server Error",
    message: err.message,
    nav,
  });
});

/* ***********************
 * Server Configuration
 *************************/
const port = process.env.PORT || 5500;
const host = process.env.HOST || "localhost";

app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`);
});
