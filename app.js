const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware для логирования запросов
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Рабочие маршруты
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    uptime: process.uptime(),
  });
});

app.get("/health/detailed", async (req, res) => {
  try {
    const db = require("./app/models");
    await db.sequelize.authenticate();

    res.status(200).json({
      status: "OK",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      uptime: process.uptime(),
      database: "connected",
    });
  } catch (error) {
    res.status(503).json({
      status: "ERROR",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      error: error.message,
      database: "disconnected",
    });
  }
});

app.get("/", (req, res) => {
  res.json({ message: "Test lab 4! 8880" });
});

// ДИАГНОСТИКА ЗАГРУЗКИ МАРШРУТОВ
console.log("=".repeat(60));
console.log("НАЧАЛО ИНИЦИАЛИЗАЦИИ ПРИЛОЖЕНИЯ");
console.log("=".repeat(60));

// Загрузка auth.routes с обработкой ошибок
try {
  console.log("\n1. Загрузка auth.routes.js...");
  const authRoutes = require("./app/routes/auth.routes");
  console.log("   ✓ Модуль загружен");

  if (typeof authRoutes === "function") {
    authRoutes(app);
    console.log("   ✓ Маршруты зарегистрированы");
  } else {
    console.log("   ✗ ОШИБКА: модуль не является функцией");
  }
} catch (error) {
  console.error("   ✗ КРИТИЧЕСКАЯ ОШИБКА:", error.message);
  console.error("   Stack trace:", error.stack);

  // Создаем временные маршруты при ошибке
  console.log("   Создаю временные маршруты...");
  app.post("/api/auth/signup", (req, res) => {
    res.json({ message: "Временный signup (ошибка загрузки модуля)" });
  });

  app.post("/api/auth/signin", (req, res) => {
    res.json({ message: "Временный signin (ошибка загрузки модуля)" });
  });
}

// Загрузка user.routes с обработкой ошибок
try {
  console.log("\n2. Загрузка user.routes.js...");
  const userRoutes = require("./app/routes/user.routes");
  console.log("   ✓ Модуль загружен");

  if (typeof userRoutes === "function") {
    userRoutes(app);
    console.log("   ✓ Маршруты зарегистрированы");
  } else {
    console.log("   ✗ ОШИБКА: модуль не является функцией");
  }
} catch (error) {
  console.error("   ✗ ОШИБКА:", error.message);
}

// ВЫВОД ВСЕХ ЗАРЕГИСТРИРОВАННЫХ МАРШРУТОВ
console.log("\n" + "=".repeat(60));
console.log("ЗАРЕГИСТРИРОВАННЫЕ МАРШРУТЫ:");
console.log("=".repeat(60));

const routes = [];
app._router.stack.forEach((middleware) => {
  if (middleware.route) {
    const methods = Object.keys(middleware.route.methods).join(',').toUpperCase();
    routes.push(`${methods} ${middleware.route.path}`);
  }
});

if (routes.length > 0) {
  routes.forEach((route, i) => {
    console.log(`${i + 1}. ${route}`);
  });
} else {
  console.log("НЕТ ЗАРЕГИСТРИРОВАННЫХ МАРШРУТОВ!");
}

console.log("=".repeat(60));

// Обработчик 404
app.use("*", (req, res) => {
  console.log(`404: Маршрут не найден - ${req.method} ${req.originalUrl}`);

  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    availableRoutes: routes // Динамический список
  });
});

console.log("\nПриложение готово к работе!");
console.log("=".repeat(60) + "\n");

module.exports = app;