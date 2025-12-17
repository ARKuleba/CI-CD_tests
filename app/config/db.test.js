module.exports = {
  HOST: "localhost",
  USER: "test_user",
  PASSWORD: "test_password",
  DB: "web_services_lab4_test",
  dialect: "sqlite",
  storage: ":memory:",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  logging: false,
};
