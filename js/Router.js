import render from "../pages/food/index.js"

class Router {
  static routes = {
    404: {
        template: "/pages/404.html",
        title: "404",
        description: "Page not found",
    },
    "/": {
        template: "/pages/index.html",
        title: "Home",
        description: "This is the home page",
    },
    "/food": {
        template: "/pages/food/index.html",
        title: "Food Planner",
        description: "Plan food like an FKTer",
        after: () => render(),
    },
  }
  
  static async setContentExecutingScripts(html) {
    const scripts = []
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, "text/html")
    doc.querySelectorAll("script").forEach((script) => {
      if (script.src) {
        scripts.push({ src: script.src })
      } else {
        scripts.push({ content: script.textContent })
      }
      script.remove() 
    })

    document.getElementById("content").innerHTML = doc.body.innerHTML

    scripts.forEach((scriptInfo) => {
      const script = document.createElement("script")
      if (scriptInfo.src) {
        script.src = scriptInfo.src
        script.async = true
      } else {
        script.textContent = scriptInfo.content
      }

      document.getElementById("content").appendChild(script)
    })
    
    return doc.body.innerHTML
  }
 
  static async route() {
    var location = window.location.hash.replace("#", "")
    if (location.length == 0) {
        location = "/";
    }
 
    const route = this.routes[location] || this.routes["404"]
 
    const html = await fetch(route.template).then((response) => response.text())
    
    this.setContentExecutingScripts(html)
    route["after"]()
    document.title = route.title

    document
        .querySelector('meta[name="description"]')
        .setAttribute("content", route.description)
  }
  
  static async init() {
    try {
      this.route()
      window.addEventListener("hashchange", () => this.route())
    } catch (error) {                                                                                                                                                      
      console.error("Error initializing the router:", error)
    }
  }
}
export default Router