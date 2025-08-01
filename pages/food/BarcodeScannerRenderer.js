import Food from "../../js/Food.js"
import NewFood from "./NewFood.js"

/**
 * Optimized Barcode Scanner with performance and reliability improvements:
 * - Optimized FPS (30) for stable scanning across devices
 * - Rectangular scanning area optimized for 1D barcodes
 * - Simplified camera constraints for faster initialization
 * - Torch/flashlight support for low-light scanning
 * - Retry logic and enhanced user feedback
 */

class BarcodeScannerRenderer {
  config = {
    fps: 30, // Optimized for stability and battery life
    qrbox: (viewfinderWidth, viewfinderHeight) => {
      // Optimized rectangular area for barcode scanning
      const width = Math.min(Math.floor(viewfinderWidth * 0.8), 350)
      const height = Math.min(Math.floor(viewfinderHeight * 0.6), 350)
      return { width, height }
    },
    aspectRatio: 1.0,
    disableFlip: false,
  }

  constructor(section) {
    this.section = section
    this.isScannerStopped = false
    this.verbose = false
    this.torchEnabled = false
    this.scanAttempts = 0
    this.maxScanAttempts = 10 // Retry logic
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
    scannerContainer.style.cssText =
      "position: relative; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;"

    // Create close button
    let closeButton = document.createElement("button")
    closeButton.classList.add("btn", "btn-danger")
    closeButton.innerHTML = `<span class="material-icons">close</span> Close Scanner`
    closeButton.style.cssText =
      "position: absolute; top: 20px; right: 20px; z-index: 1001;"
    closeButton.addEventListener("click", () => {
      this.close()
    })

    // Create instruction text with torch toggle
    const instructions = document.createElement("div")
    instructions.style.cssText =
      "color: white; text-align: center; margin-bottom: 20px; padding: 0 20px;"
    instructions.innerHTML = `
      <h3 style="color: white; margin-bottom: 10px;">Barcode Scanner</h3>
      <p style="color: rgba(255,255,255,0.8); margin: 0;">Position the barcode horizontally within the frame</p>
      <p id="scanner-status" style="color: rgba(255,255,255,0.6); margin: 5px 0 0 0; font-size: 12px;">Starting camera...</p>
      <div style="margin-top: 15px;">
        <button id="torch-toggle" class="btn btn-outline btn-sm" style="margin-right: 10px; display: none;">
          <span class="material-icons">flash_off</span> Torch
        </button>
        <span id="scan-counter" style="color: rgba(255,255,255,0.4); font-size: 11px;"></span>
      </div>
    `

    let scanner = document.createElement("div")
    scanner.id = "scanner"
    scanner.style.cssText =
      "max-width: 400px; width: 90%; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.5);"

    scannerContainer.appendChild(closeButton)
    scannerContainer.appendChild(instructions)
    scannerContainer.appendChild(scanner)
    this.scannerDiv.appendChild(scannerContainer)
    document.body.appendChild(this.scannerDiv)

    this.html5QrCode = new Html5Qrcode("scanner")

    // Simplified camera constraints for faster initialization
    const cameraConfig = {
      facingMode: "environment",
    }

    this.html5QrCode
      .start(
        cameraConfig,
        this.config,
        (code, result) => {
          this.handleBarcodeDetection(code)
        },
        (errorMessage, error) => {
          this.handleScanError(errorMessage, error)
        },
      )
      .then(() => {
        this.onCameraReady()
      })
      .catch((err) => {
        this.onCameraError(err)
      })
  }

  onCameraReady() {
    const statusElement = document.getElementById("scanner-status")
    if (statusElement) {
      statusElement.textContent = "Camera ready - Point at barcode"
      statusElement.style.color = "rgba(255,255,255,0.6)"
    }
    this.setupTorchControl()
  }

  setupTorchControl() {
    // Check if torch is supported and set up toggle
    if (this.html5QrCode && this.html5QrCode.getRunningTrackCapabilities) {
      const capabilities = this.html5QrCode.getRunningTrackCapabilities()
      if (capabilities && capabilities.torch) {
        const torchButton = document.getElementById("torch-toggle")
        if (torchButton) {
          torchButton.style.display = "inline-block"
          torchButton.addEventListener("click", () => this.toggleTorch())
        }
      }
    }
  }

  toggleTorch() {
    if (!this.html5QrCode) return

    try {
      const torchButton = document.getElementById("torch-toggle")
      const icon = torchButton.querySelector(".material-icons")

      if (this.torchEnabled) {
        this.html5QrCode.applyVideoConstraints({ torch: false })
        this.torchEnabled = false
        icon.textContent = "flash_off"
        torchButton.classList.remove("btn-warning")
        torchButton.classList.add("btn-outline")
      } else {
        this.html5QrCode.applyVideoConstraints({ torch: true })
        this.torchEnabled = true
        icon.textContent = "flash_on"
        torchButton.classList.remove("btn-outline")
        torchButton.classList.add("btn-warning")
      }
    } catch (err) {
      console.warn("Torch control not supported:", err)
    }
  }

  handleBarcodeDetection(code) {
    // Update status and provide haptic feedback
    const statusElement = document.getElementById("scanner-status")
    if (statusElement) {
      statusElement.textContent = "Barcode detected! Processing..."
      statusElement.style.color = "rgba(106, 175, 80, 0.8)"
    }

    // Haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100])
    }

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
      .catch((e) => console.error("Error fetching/parsing barcode:", e.message))
    this.html5QrCode
      .stop()
      .then(() => {
        this.isScannerStopped = true
        this.cleanup()
      })
      .catch((err) => {
        console.error("Error stopping scanner:", err)
        this.cleanup()
      })
  }

  handleScanError(errorMessage, error) {
    // Enhanced error handling with retry logic
    if (
      error &&
      (error.name === "NotFoundException" ||
        errorMessage.includes("No QR code found"))
    ) {
      // Normal "no barcode detected" errors
      this.scanAttempts++
      this.updateScanCounter()
      return
    }
    if (this.verbose) {
      console.warn("QR Code scan error:", errorMessage)
    }
  }

  updateScanCounter() {
    const counterElement = document.getElementById("scan-counter")
    if (counterElement && this.scanAttempts > 0) {
      const remaining = Math.max(0, this.maxScanAttempts - this.scanAttempts)
      if (remaining > 0) {
        counterElement.textContent = `Scanning... (${remaining} attempts remaining)`
      } else {
        counterElement.textContent =
          "Try adjusting lighting or barcode position"
        counterElement.style.color = "rgba(255, 193, 7, 0.8)"
      }
    }
  }

  onCameraError(err) {
    console.error("Unable to start scanning:", err)
    const statusElement = document.getElementById("scanner-status")
    if (statusElement) {
      statusElement.textContent = "Camera error - Please check permissions"
      statusElement.style.color = "rgba(203, 36, 49, 0.8)"
    }
  }

  close() {
    if (this.html5QrCode && !this.isScannerStopped) {
      this.html5QrCode
        .stop()
        .then(() => {
          this.isScannerStopped = true
          this.cleanup()
        })
        .catch(() => {
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
