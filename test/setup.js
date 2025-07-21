// Test setup file
import { jest } from '@jest/globals';

// Minimal IndexedDB mock
global.indexedDB = {
  open: jest.fn().mockReturnValue({
    onsuccess: null,
    onerror: null,
    result: {
      transaction: jest.fn().mockReturnValue({
        objectStore: jest.fn().mockReturnValue({
          get: jest.fn(),
          put: jest.fn(),
          delete: jest.fn()
        })
      })
    }
  })
};

global.IDBKeyRange = {
  bound: jest.fn(),
  only: jest.fn(),
  lowerBound: jest.fn(),
  upperBound: jest.fn()
};

// Mock Dexie for unit tests
global.Dexie = class MockDexie {
  constructor(name) {
    this.name = name;
    this._schemas = {};
  }
  
  version(num) {
    return {
      stores: (schemas) => {
        this._schemas = schemas;
        return this;
      }
    };
  }
  
  open() {
    return Promise.resolve();
  }
};

// Mock global database
global.db = {
  foods: {
    put: jest.fn().mockResolvedValue(1),
    get: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue(),
    toArray: jest.fn().mockResolvedValue([]),
    where: jest.fn().mockReturnValue({
      toArray: jest.fn().mockResolvedValue([])
    }),
    mapToClass: jest.fn()
  },
  sections: {
    put: jest.fn().mockResolvedValue(1),
    get: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue(),
    toArray: jest.fn().mockResolvedValue([]),
    mapToClass: jest.fn()
  }
};

// Mock GPS geolocation
global.navigator = {
  geolocation: {
    getCurrentPosition: jest.fn(),
    watchPosition: jest.fn(),
    clearWatch: jest.fn()
  }
};

// Mock DOM elements for testing
global.document = {
  getElementById: jest.fn().mockReturnValue({
    innerHTML: '',
    appendChild: jest.fn(),
    remove: jest.fn()
  })
};

// Mock fetch for API calls
global.fetch = jest.fn();

// Mock localStorage
global.localStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};