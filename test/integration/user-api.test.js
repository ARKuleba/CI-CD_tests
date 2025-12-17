const request = require("supertest");
const app = require("../../app");
const db = require("../../app/models");

describe("User API Integration Tests", () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });

    // Создаем роли
    await db.role.findOrCreate({
      where: { id: 1 },
      defaults: { name: "user" },
    });
    await db.role.findOrCreate({
      where: { id: 2 },
      defaults: { name: "admin" },
    });
  });

  afterAll(async () => {
    await db.sequelize.close();
  });

  test("GET /api/test/all should return public content", async () => {
    const response = await request(app).get("/api/test/all").expect(200);

    expect(response.text).toBe("Test info lab4. 11111111111");
  });

  test("GET /api/test/user should require authentication", async () => {
    const response = await request(app).get("/api/test/user").expect(403); // No token provided

    expect(response.body.message).toBe("No token provided!");
  });

  test("GET /api/test/admin should require admin role", async () => {
    const response = await request(app)
      .get("/api/test/admin")
      .set("x-access-token", "invalid-token")
      .expect(401); // Unauthorized - не 500!
  });
});
