const authController = require("../../app/controllers/auth.controller");
const db = require("../../app/models");
const jwt = require("jsonwebtoken");

describe("Auth Controller Unit Tests", () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await db.sequelize.close();
  });

  test("should hash password correctly", () => {
    const bcrypt = require("bcryptjs");
    const password = "testpassword";
    const hashedPassword = bcrypt.hashSync(password, 8);

    expect(bcrypt.compareSync(password, hashedPassword)).toBe(true);
  });

  test("should generate valid JWT token", () => {
    const payload = { id: 1, deviceId: "test" };
    const token = jwt.sign(payload, "test-lab4-secret-key", {
      expiresIn: "15m",
    });

    const decoded = jwt.verify(token, "test-lab4-secret-key");
    expect(decoded.id).toBe(1);
  });
});
