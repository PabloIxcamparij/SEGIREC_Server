/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": ["ts-jest", {}],
  },
  silent: true,
  testMatch: [
    "**/__tests__/**/*.test.ts"
  ],
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/index.ts",
    "!src/**/*.d.ts"
  ],
  coverageDirectory: "coverage",
  verbose: true
};