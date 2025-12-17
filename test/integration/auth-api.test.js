const request = require("supertest");
const app = require("../../app");
const db = require("../../app/models");

describe("Auth API Integration Tests", () => {
  beforeAll(async () => {
    jest.setTimeout(30000);

    // Синхронизируем тестовую БД
    await db.sequelize.sync({ force: true });

    // Создаем необходимые роли - используем db.role (с маленькой буквы)
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
    // Закрываем соединение с БД
    await db.sequelize.close();
  });

  test("POST /api/auth/signup - should register new user", async () => {
    const response = await request(app).post("/api/auth/signup").send({
      username: "testuser",
      email: "test@example.com",
      password: "password123",
    });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("User registered successfully!");
  }, 15000);

  test("POST /api/auth/signin - should authenticate user", async () => {
    // Сначала регистрируем пользователя
    await request(app).post("/api/auth/signup").send({
      username: "testuser2",
      email: "test2@example.com",
      password: "password123",
    });

    const response = await request(app).post("/api/auth/signin").send({
      username: "testuser2",
      password: "password123",
      deviceId: "test-device",
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("accessToken");
    expect(response.body).toHaveProperty("refreshToken");
  }, 15000);

  test("POST /api/auth/signin - should reject invalid password", async () => {
    const response = await request(app).post("/api/auth/signin").send({
      username: "testuser2",
      password: "wrongpassword",
      deviceId: "test-device",
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Invalid Password!");
  });
});
