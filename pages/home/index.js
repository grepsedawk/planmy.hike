import Page from "../../js/Page.js"

class HomePage extends Page {
  constructor(parent, params) {
    super()
    this.parent = parent
    this.template = "./pages/home/index.html"
    this.title = "Plan My Hike"
    this.description = "plan hikes easier!"
  }

  async render() {
    await this.renderPage()
  }
}

export default HomePage
