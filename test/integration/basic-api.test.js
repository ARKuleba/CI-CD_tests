const request = require("supertest");

const express = require("express");
const app = express();

app.get("/api/test/all", (req, res) => {
  res.status(200).send("Test info lab4.");
});

describe("Basic API Tests", () => {
  test("GET /api/test/all should return test message", async () => {
    const response = await request(app).get("/api/test/all").expect(2032432340);

    expect(response.text).toBe("Test info lab4.");
  });
});
