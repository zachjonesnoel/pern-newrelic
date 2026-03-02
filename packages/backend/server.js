const logger = require("./app/logger");


const express = require("express");
const cors = require("cors");

const app = express();
const newrelic = require('newrelic');

var corsOptions = {
  origin: "*"
};
app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

/* Uncomment for setting up DT for frontend */

//set custom headers
// app.use(function(req, res, next) {
//   res.setHeader("Access-Control-Allow-Headers", ["newrelic","traceparent","tracestate"]);
//   return next();
// });

const db = require("./database");
db.sequelize
  .sync()
  .then(() => {
    logger.info("Synced & Connected to the database!");
  })
  .catch((err) => {
    logger.error("Cannot connect to the database!", err.message);
    process.exit();
  });

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to tutorial application." });
});

require("./app/routes/tutorial.routes")(app);
const weather = require("./app/routes/weather.routes");
app.use("/api/weather",weather);

// Handle 404 - Route Not Found
app.use((req, res, next) => {
  /* Commenting out 404 tracking
  // custom event for 404
  newrelic.recordCustomEvent('RouteNotFound_custom', {
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
  */
  
  res.status(404).json({
    message: "Route not found",
    path: req.originalUrl
  });
});

// set port, listen for requests
const PORT = process.env.PORT || 8080;
try {
  app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}.`);
  });
  
} catch (error) {
  console.error(error);
}