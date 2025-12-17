const config = require("../config/db.config.js");
const testConfig = require("../config/db.test.js");

// Используем тестовую конфигурацию в тестовой среде
const dbConfig = process.env.NODE_ENV === "test" ? testConfig : config;

const Sequelize = require("sequelize");

let sequelize;
if (dbConfig.dialect === "sqlite") {
  sequelize = new Sequelize({
    dialect: "sqlite",
    storage: dbConfig.storage || "database.sqlite",
    pool: dbConfig.pool,
    logging: dbConfig.logging,
  });
} else {
  sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    port: dbConfig.PORT,
    pool: {
      max: dbConfig.pool.max,
      min: dbConfig.pool.min,
      acquire: dbConfig.pool.acquire,
      idle: dbConfig.pool.idle,
    },
    logging: dbConfig.logging,
    dialectOptions: dbConfig.dialectOptions || {},
  });
}

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Импорт моделей
db.user = require("./user.model.js")(sequelize, Sequelize);
db.role = require("./role.model.js")(sequelize, Sequelize);
db.refreshToken = require("./refreshToken.model.js")(sequelize, Sequelize);
db.blacklistedToken = require("./blacklistedToken.model.js")(
  sequelize,
  Sequelize
);
db.deviceSession = require("./deviceSession.model.js")(sequelize, Sequelize);

// Ассоциации
db.role.belongsToMany(db.user, {
  through: "user_roles",
  foreignKey: "roleId",
  otherKey: "userId",
});

db.user.belongsToMany(db.role, {
  through: "user_roles",
  foreignKey: "userId",
  otherKey: "roleId",
});

db.user.hasMany(db.refreshToken, { foreignKey: "userId" });
db.refreshToken.belongsTo(db.user, { foreignKey: "userId" });

db.user.hasMany(db.blacklistedToken, { foreignKey: "userId" });
db.blacklistedToken.belongsTo(db.user, { foreignKey: "userId" });

db.ROLES = ["user", "admin"];

module.exports = db;
