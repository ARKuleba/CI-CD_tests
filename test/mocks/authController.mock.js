jest.mock("../../app/controllers/auth.controller", () => ({
  cleanupBlacklistedTokens: jest.fn(),
  signup: jest.fn((req, res) => {
    res.status(200).send({ message: "User registered successfully!" });
  }),
  signin: jest.fn((req, res) => {
    if (req.body.password === "password123") {
      res.status(200).send({
        id: 1,
        username: req.body.username,
        email: "test@example.com",
        roles: ["ROLE_USER"],
        accessToken: "mock-access-token",
        refreshToken: "mock-refresh-token",
        deviceId: req.body.deviceId || "default",
      });
    } else {
      res.status(401).send({
        accessToken: null,
        message: "Invalid Password!",
      });
    }
  }),
}));
