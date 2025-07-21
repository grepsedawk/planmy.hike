class Page {
  async renderPage() {
    try {
      this.parent.innerHTML = await this.templateContent()

      document.title = this.title

      document
        .querySelector('meta[name="description"]')
        .setAttribute("content", this.description)
    } catch (e) {
      console.error(`Error Rendering Page (${this.title}}: ${e.message}`)
    }
  }

  async templateContent() {
    if (this.template) {
      return await fetch(this.template).then((response) => response.text())
    } else {
      return ""
    }
  }
}

export default Page
