const { authJwt, verifySignUp } = require("../../app/middleware");

describe("Middleware", () => {
  test("authJwt should have required methods", () => {
    expect(typeof authJwt.verifyToken).toBe("function");
    expect(typeof authJwt.isAdmin).toBe("function");
    expect(typeof authJwt.verifyRefreshToken).toBe("function");
  });

  test("verifySignUp should have required methods", () => {
    expect(typeof verifySignUp.checkDuplicateUsernameOrEmail).toBe("function");
    expect(typeof verifySignUp.checkRolesExisted).toBe("function");
  });
});
