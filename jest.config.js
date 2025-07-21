export default {
  testEnvironment: "jsdom",
  testMatch: ["**/test/**/*.test.js"],
  transform: {},
  setupFilesAfterEnv: ["<rootDir>/test/setup.js"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  collectCoverageFrom: [
    "js/**/*.js",
    "!js/dexie.min.js",
    "!js/html5-qrcode.min.js",
  ],
  coverageReporters: ["text", "lcov", "html"],
  verbose: true,
}
