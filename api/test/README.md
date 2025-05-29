# Running Tests

All commands should be run from the `api` directory.

## Run All Tests

This command runs all `*.spec.ts` files found by the main Jest configuration (including unit and integration tests):

```bash
npm test
```

## Run Unit Tests Only

This command specifically runs unit tests (`src/**/*.spec.ts` and `test/unit/**/*.spec.ts`):

```bash
npm run test:unit
```

## Run Integration Tests Only

This command specifically runs integration tests (`test/integration/**/*.spec.ts`):

```bash
npm run test:integration
```

For watch mode, append `-- --watch` to the specific test command (e.g., `npm run test:unit -- --watch`).

### View Test Coverage

To generate and view a coverage report (after running tests):

```bash
npm run test:cov
```
Coverage reports will be generated in the `api/coverage` directory. You can open `api/coverage/lcov-report/index.html` in a browser to view the detailed report.

**Note on Integration Test Database:** Integration tests, particularly for authentication (`auth.controller.integration.spec.ts`), may interact with the database. Ensure your environment is configured to use a dedicated test database to prevent data loss or interference with development/production databases. 
