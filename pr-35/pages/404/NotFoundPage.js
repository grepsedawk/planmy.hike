import Page from "../../js/Page.js"

class NotFoundPage extends Page {
  constructor(parent, params) {
    super()
    this.parent = parent
    this.template = "./pages/404/index.html"
    this.title = "Page Not Found"
    this.description = "Oh no! The page wasn't found!"
  }

  async render() {
    await this.renderPage()
  }
}

export default NotFoundPage
