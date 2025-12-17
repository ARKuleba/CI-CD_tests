const db = require("../../app/models");

describe("Debug Models", () => {
  test("should have all models defined", async () => {
    console.log("Available models:", Object.keys(db));

    expect(db.sequelize).toBeDefined();
    expect(db.Sequelize).toBeDefined();
    expect(db.user).toBeDefined();
    expect(db.role).toBeDefined();
    expect(db.refreshToken).toBeDefined();
    expect(db.blacklistedToken).toBeDefined();

    await db.sequelize.sync({ force: true });
    console.log("Database synced successfully");

    const role1 = await db.role.create({ id: 1, name: "user" });
    const role2 = await db.role.create({ id: 2, name: "admin" });

    expect(role1.name).toBe("user");
    expect(role2.name).toBe("admin");

    await db.sequelize.close();
  });
});
