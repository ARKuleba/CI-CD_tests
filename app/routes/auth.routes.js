const { verifySignUp, authJwt } = require("../middleware");
const controller = require("../controllers/auth.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/api/auth/signup",
    [
      verifySignUp.checkDuplicateUsernameOrEmail,
      verifySignUp.checkRolesExisted,
    ],
    controller.signup
  );

  app.post("/api/auth/signin", controller.signin);

  app.post("/api/auth/refreshtoken", controller.refreshToken);

  app.get(
    "/api/auth/devices",
    [authJwt.verifyToken],
    controller.getUserDevices
  );

  app.post(
    "/api/auth/logout-device",
    [authJwt.verifyToken],
    controller.logoutDevice
  );

  app.post(
    "/api/auth/logout-other-devices",
    [authJwt.verifyToken],
    controller.logoutOtherDevices
  );

  app.post(
    "/api/auth/logout-all",
    [authJwt.verifyToken],
    controller.logoutAllDevices
  );
};
