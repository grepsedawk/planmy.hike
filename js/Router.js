import FoodPage from "../pages/food/FoodPage.js"

class Router {
  static routes = {
    404: FoodPage, // NotFoundPage,
    "/": FoodPage, // HomePage,
    "/food": FoodPage,
  }

  static async route() {
    var location = window.location.hash.replace("#", "")
    if (location.length == 0) {
      location = "/"
    }

    const page = this.routes[location] || this.routes["404"]

    try {
      const pageRenderer = new page(document.getElementById("content"))

      pageRenderer.render()
    } catch (e) {
      console.error(`Error Rendering ${page}: ${e.message}`)
    }
  }

  static async init() {
    window.addEventListener("hashchange", () => this.route())
    this.route()
  }
}

export default Router
