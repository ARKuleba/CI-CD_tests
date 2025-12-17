const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models");
const User = db.user;
const BlacklistedToken = db.blacklistedToken;

const verifyToken = async (req, res, next) => {
  let token = req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send({
      message: "No token provided!",
    });
  }

  try {
    const isBlacklisted = await BlacklistedToken.findOne({
      where: { token: token },
    });

    if (isBlacklisted) {
      return res.status(401).send({
        message: "Token has been invalidated! Please login again.",
      });
    }

    jwt.verify(token, config.secret, (err, decoded) => {
      if (err) {
        return res.status(401).send({
          message: "Unauthorized!",
        });
      }
      req.userId = decoded.id;
      req.deviceId = decoded.deviceId;
      next();
    });
  } catch (err) {
    return res.status(500).send({
      message: "Error verifying token!",
    });
  }
};

const isAdmin = (req, res, next) => {
  User.findByPk(req.userId).then((user) => {
    user.getRoles().then((roles) => {
      for (let i = 0; i < roles.length; i++) {
        if (roles[i].name === "admin") {
          next();
          return;
        }
      }

      res.status(403).send({
        message: "Require Admin Role!",
      });
      return;
    });
  });
};

const verifyRefreshToken = async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(403).send({
      message: "No refresh token provided!",
    });
  }

  try {
    const isBlacklisted = await BlacklistedToken.findOne({
      where: { token: refreshToken },
    });

    if (isBlacklisted) {
      return res.status(401).send({
        message: "Refresh token has been invalidated!",
      });
    }

    jwt.verify(refreshToken, config.refreshSecret, (err, decoded) => {
      if (err) {
        return res.status(401).send({
          message: "Invalid refresh token!",
        });
      }
      req.userId = decoded.id;
      next();
    });
  } catch (err) {
    return res.status(500).send({
      message: "Error verifying refresh token!",
    });
  }
};

const authJwt = {
  verifyToken,
  isAdmin,
  verifyRefreshToken,
};

module.exports = authJwt;
