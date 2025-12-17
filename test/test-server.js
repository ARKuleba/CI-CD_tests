const app = require("../app");
const db = require("../app/models");

let server;

const startTestServer = async () => {
  await db.sequelize.sync({ force: true });
  await db.Role.bulkCreate([
    { id: 1, name: "user" },
    { id: 2, name: "admin" },
  ]);

  return new Promise((resolve) => {
    server = app.listen(0, () => {
      resolve(server);
    });
  });
};

const stopTestServer = async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await db.sequelize.close();
};

module.exports = { startTestServer, stopTestServer };
