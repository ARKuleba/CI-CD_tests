const request = require("supertest");
const app = require("../../app");

describe("Simple Auth API Tests", () => {
  test("GET / should return welcome message", async () => {
    const response = await request(app).get("/").expect(200);

    expect(response.body.message).toBe("Test lab 4! 9990");
  });

  test("GET /health should return status OK", async () => {
    const response = await request(app).get("/health").expect(200);

    expect(response.body.status).toBe("OK");
  });

  test("GET /api/test/all should return public content", async () => {
    const response = await request(app).get("/api/test/all").expect(200);

    expect(response.text).toBe("Test info lab4. 11111111111");
  });
});
