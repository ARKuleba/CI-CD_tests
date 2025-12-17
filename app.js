const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
  console.log("Health check called");
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    uptime: process.uptime(),
  });
});

app.get("/health/detailed", async (req, res) => {
  try {
    const db = require("./app/models");
    await db.sequelize.authenticate();

    res.status(200).json({
      status: "OK",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      uptime: process.uptime(),
      database: "connected",
    });
  } catch (error) {
    res.status(503).json({
      status: "ERROR",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      error: error.message,
      database: "disconnected",
    });
  }
});

app.get("/", (req, res) => {
  res.json({ message: "Test lab 4! 4533333333" });
});

require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app);

app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
    availableRoutes: [
      "/",
      "/health",
      "/health/detailed",
      "/api/test/all",
      "/api/auth/signup",
      "/api/auth/signin",
      "/api/auth/refreshtoken",
      "/api/auth/devices",
      "/api/auth/logout-device",
      "/api/auth/logout-other-devices",
      "/api/auth/logout-all",
    ],
  });
});

module.exports = app;
