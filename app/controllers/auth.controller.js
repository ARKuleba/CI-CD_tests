const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;
const Role = db.role;
const RefreshToken = db.refreshToken;
const BlacklistedToken = db.blacklistedToken;

const Op = db.Sequelize.Op;

let jwt = require("jsonwebtoken");
let bcrypt = require("bcryptjs");

const addToBlacklist = async (token, userId, deviceId, tokenType, reason) => {
  try {
    const decoded = jwt.decode(token);
    const expiresAt =
      decoded && decoded.exp
        ? new Date(decoded.exp * 1000)
        : new Date(Date.now() + 15 * 60 * 1000);

    await BlacklistedToken.create({
      token: token,
      userId: userId,
      deviceId: deviceId,
      tokenType: tokenType,
      expiresAt: expiresAt,
      reason: reason,
    });
  } catch (error) {
    console.error("Error adding token to blacklist:", error);
  }
};

exports.signup = (req, res) => {
  User.create({
    username: req.body.username,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8),
  })
    .then((user) => {
      if (req.body.roles) {
        Role.findAll({
          where: {
            name: {
              [Op.or]: req.body.roles,
            },
          },
        }).then((roles) => {
          user.setRoles(roles).then(() => {
            res.send({ message: "User registered successfully!" });
          });
        });
      } else {
        user.setRoles([1]).then(() => {
          res.send({ message: "User registered successfully!" });
        });
      }
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.signin = (req, res) => {
  User.findOne({
    where: {
      username: req.body.username,
    },
  })
    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }

      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!",
        });
      }

      const deviceId = req.body.deviceId || "default";

      const accessToken = jwt.sign(
        {
          id: user.id,
          deviceId: deviceId,
          type: "access",
        },
        config.secret,
        {
          algorithm: "HS256",
          allowInsecureKeySizes: true,
          expiresIn: 900, // 15 minutes
        }
      );

      const refreshToken = jwt.sign(
        {
          id: user.id,
          deviceId: deviceId,
          type: "refresh",
        },
        config.refreshSecret,
        {
          algorithm: "HS256",
          allowInsecureKeySizes: true,
          expiresIn: 86400, // 24 hours
        }
      );

      RefreshToken.create({
        token: refreshToken,
        userId: user.id,
        deviceId: deviceId,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      });

      var authorities = [];
      user.getRoles().then((roles) => {
        for (let i = 0; i < roles.length; i++) {
          authorities.push("ROLE_" + roles[i].name.toUpperCase());
        }
        res.status(200).send({
          id: user.id,
          username: user.username,
          email: user.email,
          roles: authorities,
          accessToken: accessToken,
          refreshToken: refreshToken,
          deviceId: deviceId,
        });
      });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.refreshToken = async (req, res) => {
  const { refreshToken, deviceId } = req.body;

  if (!refreshToken) {
    return res.status(403).send({ message: "Refresh Token is required!" });
  }

  try {
    const isBlacklisted = await BlacklistedToken.findOne({
      where: { token: refreshToken },
    });

    if (isBlacklisted) {
      return res.status(403).send({ message: "Refresh token is invalid!" });
    }

    const tokenRecord = await RefreshToken.findOne({
      where: {
        token: refreshToken,
        deviceId: deviceId || "default",
      },
      include: [
        {
          model: User,
          as: "user",
        },
      ],
    });

    if (!tokenRecord) {
      return res.status(403).send({ message: "Invalid refresh token!" });
    }

    if (tokenRecord.expiresAt < new Date()) {
      await addToBlacklist(
        refreshToken,
        tokenRecord.userId,
        tokenRecord.deviceId,
        "refresh",
        "expired"
      );
      await RefreshToken.destroy({ where: { token: refreshToken } });
      return res.status(403).send({ message: "Refresh token expired!" });
    }

    jwt.verify(refreshToken, config.refreshSecret, async (err, decoded) => {
      if (err) {
        return res.status(403).send({ message: "Invalid refresh token!" });
      }

      await addToBlacklist(
        refreshToken,
        decoded.id,
        decoded.deviceId,
        "refresh",
        "refreshed"
      );

      await RefreshToken.destroy({ where: { token: refreshToken } });

      const newAccessToken = jwt.sign(
        {
          id: decoded.id,
          deviceId: decoded.deviceId,
          type: "access",
        },
        config.secret,
        {
          algorithm: "HS256",
          allowInsecureKeySizes: true,
          expiresIn: 900, // 15 minutes
        }
      );

      const newRefreshToken = jwt.sign(
        {
          id: decoded.id,
          deviceId: decoded.deviceId,
          type: "refresh",
        },
        config.refreshSecret,
        {
          algorithm: "HS256",
          allowInsecureKeySizes: true,
          expiresIn: 86400, // 24 hours
        }
      );

      await RefreshToken.create({
        token: newRefreshToken,
        userId: decoded.id,
        deviceId: decoded.deviceId,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      res.status(200).send({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.getUserDevices = (req, res) => {
  RefreshToken.findAll({
    where: {
      userId: req.userId,
      expiresAt: {
        [db.Sequelize.Op.gt]: new Date(),
      },
    },
    attributes: ["id", "deviceId", "createdAt", "expiresAt"],
  })
    .then((devices) => {
      res.status(200).send(devices);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.logoutDevice = async (req, res) => {
  const { deviceId, accessToken } = req.body;

  try {
    if (accessToken) {
      await addToBlacklist(
        accessToken,
        req.userId,
        deviceId,
        "access",
        "logout"
      );
    }

    const refreshTokens = await RefreshToken.findAll({
      where: {
        userId: req.userId,
        deviceId: deviceId,
      },
    });

    const blacklistPromises = refreshTokens.map((token) =>
      addToBlacklist(
        token.token,
        token.userId,
        token.deviceId,
        "refresh",
        "logout"
      )
    );

    await Promise.all(blacklistPromises);

    await RefreshToken.destroy({
      where: {
        userId: req.userId,
        deviceId: deviceId,
      },
    });

    res.status(200).send({ message: "Successfully logged out from device" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.logoutOtherDevices = async (req, res) => {
  const { currentDeviceId, currentAccessToken } = req.body;

  try {
    const refreshTokens = await RefreshToken.findAll({
      where: {
        userId: req.userId,
        deviceId: {
          [db.Sequelize.Op.ne]: currentDeviceId,
        },
      },
    });

    const blacklistPromises = refreshTokens.map((token) =>
      addToBlacklist(
        token.token,
        token.userId,
        token.deviceId,
        "refresh",
        "logout_other"
      )
    );

    await Promise.all(blacklistPromises);

    await RefreshToken.destroy({
      where: {
        userId: req.userId,
        deviceId: {
          [db.Sequelize.Op.ne]: currentDeviceId,
        },
      },
    });

    res
      .status(200)
      .send({ message: "Successfully logged out from other devices" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.logoutAllDevices = async (req, res) => {
  const { accessToken } = req.body;

  try {
    if (accessToken) {
      const decoded = jwt.decode(accessToken);
      await addToBlacklist(
        accessToken,
        req.userId,
        decoded.deviceId,
        "access",
        "logout_all"
      );
    }

    const refreshTokens = await RefreshToken.findAll({
      where: {
        userId: req.userId,
      },
    });

    const blacklistPromises = refreshTokens.map((token) =>
      addToBlacklist(
        token.token,
        token.userId,
        token.deviceId,
        "refresh",
        "logout_all"
      )
    );

    await Promise.all(blacklistPromises);

    await RefreshToken.destroy({
      where: {
        userId: req.userId,
      },
    });

    res
      .status(200)
      .send({ message: "Successfully logged out from all devices" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.cleanupBlacklistedTokens = async () => {
  try {
    await BlacklistedToken.destroy({
      where: {
        expiresAt: {
          [db.Sequelize.Op.lt]: new Date(),
        },
      },
    });
    console.log("Cleaned up expired blacklisted tokens");
  } catch (err) {
    console.error("Error cleaning up blacklisted tokens:", err);
  }
};
