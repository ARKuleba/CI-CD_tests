const db = require("../app/models");

describe("Database Connection", () => {
  test("should connect to PostgreSQL database", async () => {
    try {
      await db.sequelize.authenticate();
      console.log("Database connection has been established successfully.");
      expect(true).toBe(true);
    } catch (error) {
      console.error("Unable to connect to the database:", error);
      throw error;
    }
  });

  test("should sync database models", async () => {
    try {
      await db.sequelize.sync({ force: false });
      console.log("Database synced successfully");
      expect(true).toBe(true);
    } catch (error) {
      console.error("Error syncing database:", error);
      throw error;
    }
  });
});
