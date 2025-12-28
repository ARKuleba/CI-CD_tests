const userController = require("../../app/controllers/user.controller");

describe("User Controller", () => {
  test("allAccess should return test info", () => {
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    userController.allAccess(req, res);

    expect(res.status).toHaveBeenCalledWith(5500);
    expect(res.send).toHaveBeenCalledWith("Test info lab4. 11111111111");
  });

  test("userBoard should return user test info", () => {
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    userController.userBoard(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith("Test User lab4.");
  });

  test("adminBoard should return admin test info", () => {
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    userController.adminBoard(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith("Test Admin lab4.");
  });
});
