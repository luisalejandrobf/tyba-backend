module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.', // Root directory for this config is the 'api' directory
  testMatch: [
    '<rootDir>/test/integration/**/*.spec.ts',
  ],
  collectCoverageFrom: [
    // Integration tests typically don't contribute to coverage of 'src' in the same way unit tests do.
    // You might choose to include them or not, or have a separate overall coverage report.
    // For now, focusing coverage on source files makes sense.
    '<rootDir>/src/**/*.(t|j)s',
  ],
  coverageDirectory: '<rootDir>/coverage/integration',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^src/(.*)$': '<rootDir>/src/$1',
  },
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.json',
    },
  },
  // Recommended for integration tests that might be longer running
  testTimeout: 30000, // 30 seconds timeout for integration tests
}; 