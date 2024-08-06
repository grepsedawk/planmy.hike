import FoodPage from "../pages/food/FoodPage.js"
import SectionsPage from "../pages/sections/SectionsPage.js"
class Router {
  static routes = {
    404: FoodPage, // NotFoundPage,
    "/": SectionsPage, // HomePage,
    "/sections": SectionsPage,
    "/sections/:id/food": FoodPage,
  }

  static parseUrl() {
    const hash = window.location.hash.replace("#", "")
    const [path, ...paramPairs] = hash.split("?")
    const params = paramPairs
      .join("?")
      .split("&")
      .reduce((acc, param) => {
        const [key, value] = param.split("=")
        acc[key] = value
        return acc
      }, {})

    return { path: path || "/", params }
  }

  static matchRoute(path, additionalParams = {}) {
    for (const route in this.routes) {
      const routePattern = route.replace(/:\w+/g, "([^/]+)")
      const regex = new RegExp(`^${routePattern}$`)
      const match = path.match(regex)
      if (match) {
        const paramValues = match.slice(1)
        const paramKeys = (route.match(/:\w+/g) || []).map((key) =>
          key.substring(1),
        )
        const params = paramKeys.reduce((acc, key, index) => {
          acc[key] = paramValues[index]
          return acc
        }, additionalParams)
        return new this.routes[route](
          document.getElementById("content"),
          params,
        )
      }
    }
    return new this.routes["404"](
      document.getElementById("content"),
      additionalParams,
    )
  }

  static async route() {
    try {
      const { path, urlParams } = this.parseUrl()
      const page = this.matchRoute(path, urlParams)

      await page.render()
    } catch (e) {
      console.error(`Error Routing [${window.location.hash}]: ${e.message}`)
    }
  }

  static async init() {
    window.addEventListener("hashchange", () => this.route())
    this.route()
  }
}

export default Router
