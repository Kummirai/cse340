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

/* ***********************
 * Error Handling
 *************************/
app.use(async (req, res) => {
  res.status(404).render("404", {
    title: "404 Not Found",
    nav: await utilities.getNav(),
  });
});

app.use(async (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("500", {
    title: "500 Server Error",
    nav: await utilities.getNav(),
    error: process.env.NODE_ENV === "development" ? err : null,
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
