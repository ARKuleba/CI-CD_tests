module.exports = (sequelize, Sequelize) => {
  const BlacklistedToken = sequelize.define("blacklisted_tokens", {
    token: {
      type: Sequelize.STRING,
      primaryKey: true,
    },
    userId: {
      type: Sequelize.INTEGER,
    },
    deviceId: {
      type: Sequelize.STRING,
    },
    tokenType: {
      type: Sequelize.ENUM("access", "refresh"),
    },
    expiresAt: {
      type: Sequelize.DATE,
    },
    reason: {
      type: Sequelize.STRING,
    },
  });

  return BlacklistedToken;
};
