module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.', // Root directory for this config is the 'api' directory
  testMatch: [
    '<rootDir>/src/**/*.spec.ts',
    '<rootDir>/test/unit/**/*.spec.ts',
  ],
  collectCoverageFrom: [
    '<rootDir>/src/**/*.(t|j)s',
  ],
  coverageDirectory: '<rootDir>/coverage/unit',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1', // For @/ path alias if you use it
    '^src/(.*)$': '<rootDir>/src/$1', // For src/ path alias
    // Add other module name mappers if needed for your project structure
  },
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.json',
    },
  },
}; 