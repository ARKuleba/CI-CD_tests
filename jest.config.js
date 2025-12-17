module.exports = {
  testEnvironment: "node",
  coverageDirectory: "coverage",
  collectCoverageFrom: [
    "app/**/*.js",
    "!app/**/*.test.js",
    "!app/models/index.js",
    "!server.js",
  ],
  testMatch: ["**/test/unit/**/*.test.js", "**/test/integration/**/*.test.js"],
  setupFilesAfterEnv: ["<rootDir>/test/jest.setup.js"],
  testTimeout: 30000,
  forceExit: true,
  detectOpenHandles: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  testPathIgnorePatterns: ["/node_modules/", "/build/", "/dist/"],
};
