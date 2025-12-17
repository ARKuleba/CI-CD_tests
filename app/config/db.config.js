const { parse } = require("pg-connection-string");

// Если есть DATABASE_URL, используем его, иначе используем отдельные переменные
let config;

if (process.env.DATABASE_URL) {
  const parsed = parse(process.env.DATABASE_URL);
  config = {
    HOST: parsed.host,
    USER: parsed.user,
    PASSWORD: parsed.password,
    DB: parsed.database,
    PORT: parsed.port,
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  };
} else {
  config = {
    HOST: process.env.DB_HOST || "localhost",
    USER: process.env.DB_USER || "root",
    PASSWORD: process.env.DB_PASSWORD || "09112004rdv",
    DB: process.env.DB_NAME || "web_services_lab4",
    PORT: process.env.DB_PORT || 5432,
    dialect: process.env.DB_DIALECT || "sqlite",
    storage: process.env.DB_STORAGE || "database.sqlite",
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    dialectOptions:
      process.env.NODE_ENV === "production"
        ? {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        }
        : {},
  };
}

module.exports = config;

