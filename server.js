/* ***********************
 * Require Statements
 *************************/
const express = require("express");
const path = require("path");
const env = require("dotenv").config();
const app = express();
const static = require("./routes/static");
const inventoryRoute = require("./routes/inventoryRoute");
const accountRoute = require("./routes/accountRoute");
const expressLayouts = require("express-ejs-layouts");
const baseController = require("./controllers/baseController");
const utilities = require("./utilities/");
const session = require("express-session");
const pool = require("./database/");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const Util = require("./utilities/"); 

/* ***********************
 * Middleware
 *************************/
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

/* ***********************
 * Session Configuration
 *************************/
app.use(
  session({
    store: new (require("connect-pg-simple")(session))({
      createTableIfMissing: true,
      pool,
    }),
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    name: "sessionId",
  })
);

// Express Messages Middleware
app.use(require("connect-flash")());
app.use(function (req, res, next) {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

/* ***********************
 * JWT Middleware - MUST come after cookieParser and session
 *************************/
// In your main app.js/server.js
app.use(Util.checkJWTToken);

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
app.use("/account", accountRoute);
app.use("/inv", inventoryRoute);
app.get("/", utilities.handleErrors(baseController.buildHome));

app.use(async (req, res, next) => {
  next({ status: 404, message: "Sorry we appear to have lost the page!" });
});

/* ***********************
 * Express Error Handler
 * Place after all other middleware
 *************************/
app.use(async (err, req, res, next) => {
  const nav = await utilities.getNav();
  const status = err.status || 500; // Default to 500 if no status

  console.error(`💥 Error (${status}) at ${req.originalUrl}:`, err.message);

  const messages = {
    404: "The page you requested doesn't exist.",
    500: "Something went wrong on our end. We're working on it!",
  };

  res.status(status).render("errors/error", {
    title: `${status} - ${status === 404 ? "Not Found" : "Server Error"}`,
    message: messages[status] || err.message,
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
