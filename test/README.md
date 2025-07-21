# Testing Guide

This directory contains the test suite for the Plan My Hike application.

## Test Types

### Unit Tests

Unit tests are located in `test/*.test.js` files and test individual components in isolation.

**Run unit tests:**

```bash
npm test
```

**Run with watch mode:**

```bash
npm run test:watch
```

**Run with coverage:**

```bash
npm run test:coverage
```

### Browser Integration Tests

Browser integration tests verify the application works correctly in a real browser environment.

**Run browser tests:**

```bash
npm run test:browser
```

This will start a local server and provide instructions to open the test page in your browser.

**Manual browser testing:**

```bash
npm run serve
# Then open http://localhost:8000/test/browser-integration.html
```

## Test Coverage

### Unit Tests Cover:

- **Food Model** (`Food.js`): Nutrition calculations, database operations
- **Section Model** (`Section.js`): Hiking section management, progress tracking
- **Router** (`Router.js`): URL parsing, route matching, navigation
- **GPS Tracker** (`GPSTracker.js`): GPS calculations, mile tracking

### Browser Integration Tests Cover:

- Database connectivity (IndexedDB via Dexie)
- DOM manipulation and rendering
- Local storage functionality
- URL routing and navigation
- Model persistence and retrieval
- GPS distance calculations

## Test Setup

The test environment includes:

- **Jest** for unit testing with ES module support
- **jsdom** for DOM simulation in unit tests
- **Custom mocks** for IndexedDB, GPS, and browser APIs
- **Browser integration** for real-world testing

## Writing Tests

### Unit Test Example:

```javascript
import { describe, test, expect, beforeEach } from "@jest/globals"
import MyComponent from "../js/MyComponent.js"

describe("MyComponent", () => {
  test("should do something", () => {
    const component = new MyComponent()
    expect(component.method()).toBe(expectedValue)
  })
})
```

### Browser Test Example:

```javascript
async function testMyFeature() {
  try {
    // Test implementation
    const result = await myFeature()
    logResult("My Feature", true, "Feature working correctly")
  } catch (error) {
    logResult("My Feature", false, `Error: ${error.message}`)
  }
}
```

## Debugging

- Unit tests output detailed error messages and stack traces
- Browser tests show results visually in the browser
- Use `console.debug` statements in the source code for debugging
- Jest runs with `--verbose` for detailed output

## Continuous Integration

All tests should pass before merging changes. The test suite is designed to:

- Run quickly (< 5 seconds for unit tests)
- Be deterministic and reliable
- Provide clear error messages when failing
- Cover the core functionality of the application
