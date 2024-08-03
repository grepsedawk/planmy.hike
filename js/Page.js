class Page {
  async renderPage() {
    if (this.template) {
      this.parent.innerHTML = await templateContent()
    }

    document.title = this.title

    document
      .querySelector('meta[name="description"]')
      .setAttribute("content", this.description)
  }

  async templateContent() {
    return await fetch(this.template).then((response) => response.text())
  }
}

export default Page
