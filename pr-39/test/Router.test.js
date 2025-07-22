import { describe, test, expect, beforeEach, jest } from "@jest/globals"
import Router from "../js/Router.js"

// Mock the page classes
const MockHomePage = jest.fn()
const MockSectionsPage = jest.fn()
const MockFoodPage = jest.fn()
const MockNotFoundPage = jest.fn()

// Mock the imports
jest.unstable_mockModule("../pages/home/index.js", () => ({
  default: MockHomePage,
}))
jest.unstable_mockModule("../pages/sections/SectionsPage.js", () => ({
  default: MockSectionsPage,
}))
jest.unstable_mockModule("../pages/food/FoodPage.js", () => ({
  default: MockFoodPage,
}))
jest.unstable_mockModule("../pages/404/NotFoundPage.js", () => ({
  default: MockNotFoundPage,
}))

describe("Router", () => {
  let mockContentElement

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()

    // Mock DOM
    mockContentElement = {
      innerHTML: "",
      appendChild: jest.fn(),
      remove: jest.fn(),
    }

    // Mock document with Object.defineProperty to work with jsdom
    const mockGetElementById = jest.fn().mockReturnValue(mockContentElement)
    Object.defineProperty(document, "getElementById", {
      value: mockGetElementById,
      configurable: true,
    })

    // Mock window.location and addEventListener
    Object.defineProperty(window, "location", {
      value: { hash: "" },
      configurable: true,
      writable: true,
    })

    Object.defineProperty(window, "addEventListener", {
      value: jest.fn(),
      configurable: true,
    })

    // Mock console methods
    global.console = {
      debug: jest.fn(),
      error: jest.fn(),
    }

    // Update router routes to use mocks
    Router.routes = {
      "/404": MockNotFoundPage,
      "/": MockHomePage,
      "/sections": MockSectionsPage,
      "/sections/:id/food": MockFoodPage,
    }
  })

  describe("URL Parsing", () => {
    test("should parse simple hash path", () => {
      global.window.location.hash = "#/sections"

      const result = Router.parseUrl()

      expect(result.path).toBe("/sections")
      expect(result.params).toEqual({})
    })

    test("should parse hash with query parameters", () => {
      global.window.location.hash = "#/sections?sort=name&filter=active"

      const result = Router.parseUrl()

      expect(result.path).toBe("/sections")
      expect(result.params).toEqual({
        sort: "name",
        filter: "active",
      })
    })

    test("should handle empty hash", () => {
      global.window.location.hash = ""

      const result = Router.parseUrl()

      expect(result.path).toBe("/")
      expect(result.params).toEqual({})
    })

    test("should handle hash without #", () => {
      global.window.location.hash = "sections"

      const result = Router.parseUrl()

      expect(result.path).toBe("sections")
    })

    test("should handle malformed query parameters", () => {
      global.window.location.hash = "#/sections?invalidparam&key=value"

      const result = Router.parseUrl()

      expect(result.path).toBe("/sections")
      expect(result.params).toEqual({
        undefined: undefined,
        key: "value",
      })
    })
  })

  describe("Route Matching", () => {
    test("should match exact route", () => {
      const mockPageInstance = { render: jest.fn().mockResolvedValue() }
      MockHomePage.mockReturnValue(mockPageInstance)

      const page = Router.matchRoute("/")

      expect(MockHomePage).toHaveBeenCalledWith(mockContentElement, {})
      expect(page).toBe(mockPageInstance)
    })

    test("should match parameterized route", () => {
      const mockPageInstance = { render: jest.fn().mockResolvedValue() }
      MockFoodPage.mockReturnValue(mockPageInstance)

      const page = Router.matchRoute("/sections/123/food")

      expect(MockFoodPage).toHaveBeenCalledWith(mockContentElement, {
        id: "123",
      })
      expect(page).toBe(mockPageInstance)
    })

    test("should pass additional parameters", () => {
      const mockPageInstance = { render: jest.fn().mockResolvedValue() }
      MockFoodPage.mockReturnValue(mockPageInstance)
      const additionalParams = { sort: "name" }

      const page = Router.matchRoute("/sections/456/food", additionalParams)

      expect(MockFoodPage).toHaveBeenCalledWith(mockContentElement, {
        id: "456",
        sort: "name",
      })
    })

    test("should return 404 page for unknown route", () => {
      const mockPageInstance = { render: jest.fn().mockResolvedValue() }
      MockNotFoundPage.mockReturnValue(mockPageInstance)

      const page = Router.matchRoute("/unknown/route")

      expect(MockNotFoundPage).toHaveBeenCalledWith(mockContentElement, {})
      expect(page).toBe(mockPageInstance)
    })

    test("should handle multiple parameters in route", () => {
      // Add a route with multiple parameters for testing
      Router.routes["/trail/:trailId/section/:sectionId"] = MockSectionsPage

      const mockPageInstance = { render: jest.fn().mockResolvedValue() }
      MockSectionsPage.mockReturnValue(mockPageInstance)

      const page = Router.matchRoute("/trail/pct/section/a")

      expect(MockSectionsPage).toHaveBeenCalledWith(mockContentElement, {
        trailId: "pct",
        sectionId: "a",
      })
    })
  })

  describe("Routing Process", () => {
    test("should route to correct page", async () => {
      global.window.location.hash = "#/sections"
      const mockPageInstance = { render: jest.fn().mockResolvedValue() }
      MockSectionsPage.mockReturnValue(mockPageInstance)

      await Router.route()

      expect(global.document.getElementById).toHaveBeenCalledWith("content")
      expect(MockSectionsPage).toHaveBeenCalledWith(mockContentElement, {})
      expect(mockPageInstance.render).toHaveBeenCalled()
    })

    test("should handle rendering errors", async () => {
      global.window.location.hash = "#/sections"
      const mockError = new Error("Render failed")
      const mockPageInstance = {
        render: jest.fn().mockRejectedValue(mockError),
      }
      MockSectionsPage.mockReturnValue(mockPageInstance)

      await Router.route()

      expect(global.console.error).toHaveBeenCalledWith(
        "Error Rendering [#/sections]: Render failed",
      )
    })

    test("should parse URL parameters and pass to page", async () => {
      global.window.location.hash = "#/sections/789/food?category=snacks"
      const mockPageInstance = { render: jest.fn().mockResolvedValue() }
      MockFoodPage.mockReturnValue(mockPageInstance)

      await Router.route()

      expect(MockFoodPage).toHaveBeenCalledWith(mockContentElement, {
        id: "789",
        category: "snacks",
      })
    })
  })

  describe("Router Initialization", () => {
    test("should set up hash change listener and route initially", async () => {
      global.window.location.hash = "#/"
      const mockPageInstance = { render: jest.fn().mockResolvedValue() }
      MockHomePage.mockReturnValue(mockPageInstance)

      await Router.init()

      expect(global.window.addEventListener).toHaveBeenCalledWith(
        "hashchange",
        expect.any(Function),
      )
      expect(mockPageInstance.render).toHaveBeenCalled()
      expect(global.console.debug).toHaveBeenCalledWith(
        "Starting Router.init()",
      )
      expect(global.console.debug).toHaveBeenCalledWith(
        "Router.init() completed successfully!",
      )
    })

    test("should handle initialization errors", async () => {
      global.window.location.hash = "#/"
      const mockError = new Error("Init failed")
      const mockPageInstance = {
        render: jest.fn().mockRejectedValue(mockError),
      }
      MockHomePage.mockReturnValue(mockPageInstance)

      await Router.init()

      expect(global.console.error).toHaveBeenCalledWith(
        "Error Rendering [#/]: Init failed",
      )
    })

    test("should handle hash change events", async () => {
      let hashChangeHandler
      global.window.addEventListener = jest.fn((event, handler) => {
        if (event === "hashchange") {
          hashChangeHandler = handler
        }
      })

      await Router.init()

      // Simulate hash change
      global.window.location.hash = "#/sections"
      const mockPageInstance = { render: jest.fn().mockResolvedValue() }
      MockSectionsPage.mockReturnValue(mockPageInstance)

      await hashChangeHandler()

      expect(mockPageInstance.render).toHaveBeenCalled()
    })

    test("should handle hash change routing errors", async () => {
      let hashChangeHandler
      global.window.addEventListener = jest.fn((event, handler) => {
        if (event === "hashchange") {
          hashChangeHandler = handler
        }
      })

      await Router.init()

      // Simulate hash change with error
      global.window.location.hash = "#/sections"
      const mockError = new Error("Hash change error")
      const mockPageInstance = {
        render: jest.fn().mockRejectedValue(mockError),
      }
      MockSectionsPage.mockReturnValue(mockPageInstance)

      await hashChangeHandler()

      expect(global.console.error).toHaveBeenCalledWith(
        "Error Rendering [#/sections]: Hash change error",
      )
    })
  })

  describe("Edge Cases", () => {
    test("should handle null content element", () => {
      // Temporarily override getElementById to return null
      Object.defineProperty(document, "getElementById", {
        value: jest.fn().mockReturnValue(null),
        configurable: true,
      })

      const page = Router.matchRoute("/")

      expect(MockHomePage).toHaveBeenCalledWith(null, {})

      // Restore the original mock
      Object.defineProperty(document, "getElementById", {
        value: jest.fn().mockReturnValue(mockContentElement),
        configurable: true,
      })
    })

    test("should handle routes with special characters", () => {
      const mockPageInstance = { render: jest.fn().mockResolvedValue() }
      MockFoodPage.mockReturnValue(mockPageInstance)

      const page = Router.matchRoute("/sections/test-section-123/food")

      expect(MockFoodPage).toHaveBeenCalledWith(mockContentElement, {
        id: "test-section-123",
      })
    })

    test("should handle empty parameters object", () => {
      const mockPageInstance = { render: jest.fn().mockResolvedValue() }
      MockHomePage.mockReturnValue(mockPageInstance)

      const page = Router.matchRoute("/", {})

      expect(MockHomePage).toHaveBeenCalledWith(mockContentElement, {})
    })
  })
})
