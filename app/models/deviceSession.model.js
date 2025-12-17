module.exports = (sequelize, Sequelize) => {
  const DeviceSession = sequelize.define("device_sessions", {
    userId: {
      type: Sequelize.INTEGER,
      primaryKey: true,
    },
    deviceId: {
      type: Sequelize.STRING,
      primaryKey: true,
    },
    sessionId: {
      type: Sequelize.STRING,
    },
    expiresAt: {
      type: Sequelize.DATE,
    },
  });

  return DeviceSession;
};
