const app = require("./app");

if (process.env.NODE_ENV !== "test") {
  const db = require("./app/models");
  const authController = require("./app/controllers/auth.controller");

  console.log("🔧 Starting application...");
  console.log("Environment:", process.env.NODE_ENV);
  console.log("Database host:", process.env.DB_HOST ? "set" : "not set");

  const syncOptions =
    process.env.NODE_ENV === "production" ? { alter: true } : { force: false };

  db.sequelize
    .authenticate()
    .then(() => {
      console.log("✅ Database connection established");
      return db.sequelize.sync(syncOptions);
    })
    .then(() => {
      console.log(`✅ Database synced`);

      return db.role.findOrCreate({
        where: { id: 1 },
        defaults: { name: "user" },
      });
    })
    .then(() => {
      return db.role.findOrCreate({
        where: { id: 2 },
        defaults: { name: "admin" },
      });
    })
    .then(() => {
      const PORT = process.env.PORT || 8080;
      const server = app.listen(PORT, "0.0.0.0", () => {
        console.log(`🚀 Server is running on port ${PORT}`);
        console.log(`📊 Available routes:`);
        console.log(`   - GET  /`);
        console.log(`   - GET  /health`);
        console.log(`   - GET  /health/detailed`);
        console.log(`   - GET  /api/test/all`);
        console.log(`   - POST /api/auth/signup`);
        console.log(`   - POST /api/auth/signin`);
      });

      process.on("SIGTERM", () => {
        console.log("SIGTERM received, shutting down gracefully");
        server.close(() => {
          console.log("Process terminated");
        });
      });

      if (process.env.NODE_ENV === "production") {
        setInterval(() => {
          authController.cleanupBlacklistedTokens();
        }, 24 * 60 * 60 * 1000);
      }
    })
    .catch((error) => {
      console.error("❌ Startup failed:", error.message);
      process.exit(1);
    });
}
// test

module.exports = app;
