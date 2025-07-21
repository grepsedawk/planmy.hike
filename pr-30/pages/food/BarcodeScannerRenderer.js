import Food from "../../js/Food.js"
import NewFood from "./NewFood.js"

class BarcodeScannerRenderer {
  config = { fps: 10, qrbox: { width: 250, height: 250 } }

  constructor(section) {
    this.section = section
    this.isScannerStopped = false
  }

  static renderTrigger(parent, section) {
    const button = document.createElement("button")
    button.classList.add("btn", "btn-outline", "btn-sm")
    button.innerHTML = `<span class="material-icons">qr_code_scanner</span> Scan Barcode`
    button.addEventListener("click", () =>
      new BarcodeScannerRenderer(section).start(),
    )

    parent.appendChild(button)
  }

  start() {
    this.scannerDiv = document.createElement("div")
    this.scannerDiv.classList.add("modal-overlay")
    this.scannerDiv.style.background = "black"
    
    // Create scanner container
    const scannerContainer = document.createElement("div")
    scannerContainer.style.cssText = "position: relative; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;"
    
    // Create close button
    let closeButton = document.createElement("button")
    closeButton.classList.add("btn", "btn-danger")
    closeButton.innerHTML = `<span class="material-icons">close</span> Close Scanner`
    closeButton.style.cssText = "position: absolute; top: 20px; right: 20px; z-index: 1001;"
    closeButton.addEventListener("click", () => {
      this.close()
    })
    
    // Create instruction text
    const instructions = document.createElement("div")
    instructions.style.cssText = "color: white; text-align: center; margin-bottom: 20px; padding: 0 20px;"
    instructions.innerHTML = `
      <h3 style="color: white; margin-bottom: 10px;">Barcode Scanner</h3>
      <p style="color: rgba(255,255,255,0.8); margin: 0;">Position the barcode within the frame to scan</p>
    `
    
    let scanner = document.createElement("div")
    scanner.id = "scanner"
    scanner.style.cssText = "max-width: 400px; width: 90%; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.5);"
    
    scannerContainer.appendChild(closeButton)
    scannerContainer.appendChild(instructions)
    scannerContainer.appendChild(scanner)
    this.scannerDiv.appendChild(scannerContainer)
    document.body.appendChild(this.scannerDiv)

    this.html5QrCode = new Html5Qrcode("scanner")
    this.html5QrCode.start(
      { facingMode: "environment" },
      this.config,
      (code, result) => {
        this.cachedBarcodeLookup(code)
          .then((r) => r.json())
          .then((data) => {
            console.debug(data)
            let food = new Food()

            food.name = `${data["product"]["brands"]} ${data["product"]["product_name"]}`
            food.calories = data["product"]["nutriments"]["energy-kcal_serving"]
            food.carbs = data["product"]["nutriments"]["carbohydrates_serving"]
            food.protein = data["product"]["nutriments"]["proteins_serving"]
            food.fat = data["product"]["nutriments"]["fat_serving"]
            food.servingSize = data["product"]["serving_quantity"]
            food.netWeight = data["product"]["product_quantity"]

            return new NewFood(this.section, food).render()
          })
          .catch((e) =>
            console.error("Error fetching/parsing barcode:", e.message),
          )
        this.html5QrCode
          .stop()
          .then(() => {
            this.isScannerStopped = true
            this.cleanup()
          })
          .catch((err) => {})
      },
    )
  }

  close() {
    if (this.html5QrCode && !this.isScannerStopped) {
      this.html5QrCode.stop().then(() => {
        this.isScannerStopped = true
        this.cleanup()
      }).catch(() => {
        this.isScannerStopped = true
        this.cleanup()
      })
    } else {
      this.cleanup()
    }
  }

  cleanup() {
    if (this.scannerDiv) {
      this.scannerDiv.remove()
      this.scannerDiv = null
    }
    this.html5QrCode = null
    this.isScannerStopped = true
  }

  cachedBarcodeLookup(code) {
    const url = `https://world.openfoodfacts.org/api/v3/product/${code}.json`
    return caches
      .open("barcodes_v1")
      .then((cache) =>
        cache
          .match(url)
          .then((r) => r || cache.add(url).then((r) => cache.match(url))),
      )
  }
}

export default BarcodeScannerRenderer
