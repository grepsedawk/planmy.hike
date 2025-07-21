import FoodPage from "../pages/food/FoodPage.js"
import SectionsPage from "../pages/sections/SectionsPage.js"
import NotFoundPage from "../pages/404/NotFoundPage.js"
import HomePage from "../pages/home/index.js"
import GearPage from "../pages/gear/GearPage.js"

class Router {
  static routes = {
    "/404": NotFoundPage,
    "/": HomePage,
    "/sections": SectionsPage,
    "/sections/:id/food": FoodPage,
    "/gear": GearPage,
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
        console.debug("params", params)
        
        return new this.routes[route](
          document.getElementById("content"),
          params,
        )
      }
    }
    return new this.routes["/404"](
      document.getElementById("content"),
      additionalParams,
    )
  }

  static async route() {
    const { path, urlParams } = this.parseUrl()
    const page = this.matchRoute(path, urlParams)
    console.debug("Routing to", path, page)

    return page
      .render()
      .catch((e) =>
        console.error(
          `Error Rendering [${window.location.hash}]: ${e.message}`,
        ),
      )
  }

  static async init() {
    console.debug("Starting Router.init()")
    window.addEventListener("hashchange", () =>
      this.route().catch((e) => console.error("Error routing:", e.message)),
    )
    await this.route()
    console.debug("Router.init() completed successfully!")
  }
}

export default Router
