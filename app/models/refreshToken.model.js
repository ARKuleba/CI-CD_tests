module.exports = (sequelize, Sequelize) => {
  const RefreshToken = sequelize.define("refresh_tokens", {
    token: {
      type: Sequelize.STRING,
    },
    userId: {
      type: Sequelize.INTEGER,
    },
    deviceId: {
      type: Sequelize.STRING,
    },
    expiresAt: {
      type: Sequelize.DATE,
    },
  });

  return RefreshToken;
};
