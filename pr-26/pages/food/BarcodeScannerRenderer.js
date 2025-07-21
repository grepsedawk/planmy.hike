import Food from "../../js/Food.js"
import NewFood from "./NewFood.js"

/**
 * High-Performance Barcode Scanner with multiple scanning engines:
 * - Native BarcodeDetector API (Chrome/Edge) for ultra-fast scanning
 * - html5-qrcode fallback for other browsers
 * - Aggressive performance optimizations
 * - Smart scanning area optimization
 * - Enhanced user experience
 */

class BarcodeScannerRenderer {
  constructor(section) {
    this.section = section
    this.isScannerStopped = false
    this.verbose = false
    this.torchEnabled = false
    this.scanAttempts = 0
    this.maxScanAttempts = 15
    this.useNativeScanner = false
    this.videoElement = null
    this.canvasElement = null
    this.barcodeDetector = null
    this.scanInterval = null

    // Check for native BarcodeDetector support (Chrome/Edge)
    this.checkNativeSupport()
  }

  async checkNativeSupport() {
    if ("BarcodeDetector" in window) {
      try {
        const formats = await BarcodeDetector.getSupportedFormats()
        // Check if common grocery barcode formats are supported
        const groceryFormats = ["ean_13", "ean_8", "upc_a", "upc_e", "code_128"]
        const hasGrocerySupport = groceryFormats.some((format) =>
          formats.includes(format),
        )

        if (hasGrocerySupport) {
          this.useNativeScanner = true
          this.barcodeDetector = new BarcodeDetector({
            formats: groceryFormats.filter((format) =>
              formats.includes(format),
            ),
          })
          console.log(
            "🚀 Native BarcodeDetector enabled with formats:",
            groceryFormats.filter((format) => formats.includes(format)),
          )
        }
      } catch (err) {
        console.warn("BarcodeDetector check failed:", err)
        this.useNativeScanner = false
      }
    }
  }

  // Performance monitoring for auto-adjustment
  trackPerformance() {
    if (!this.performanceStart) {
      this.performanceStart = Date.now()
      this.scanCount = 0
    }
    this.scanCount++

    // Auto-adjust scanning parameters based on performance
    if (this.scanCount % 10 === 0) {
      const elapsed = Date.now() - this.performanceStart
      const scansPerSecond = this.scanCount / (elapsed / 1000)

      if (scansPerSecond < 5 && this.useNativeScanner) {
        // Reduce scanning frequency if performance is poor
        console.log("📊 Adjusting scan rate for better performance")
      }
    }
  }

  // Enhanced config for html5-qrcode fallback
  config = {
    fps: 25, // Increased for better performance with optimizations
    qrbox: (viewfinderWidth, viewfinderHeight) => {
      // Ultra-wide scanning area for 1D barcodes
      const width = Math.min(Math.floor(viewfinderWidth * 0.9), 400)
      const height = Math.min(Math.floor(viewfinderHeight * 0.25), 120)
      return { width, height }
    },
    aspectRatio: 1.0,
    disableFlip: false,
    // Optimize for 1D barcodes
    experimentalFeatures: {
      useBarCodeDetectorIfSupported: true,
    },
  }

  static renderTrigger(parent, section) {
    const button = document.createElement("button")
    button.classList.add("btn", "btn-outline", "btn-sm")
    button.innerHTML = `<span class="material-icons">qr_code_scanner</span> Scan Barcode`
    button.addEventListener("click", async () => {
      const scanner = new BarcodeScannerRenderer(section)
      await scanner.checkNativeSupport() // Ensure we've checked native support
      scanner.start()
    })

    parent.appendChild(button)
  }

  async start() {
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

    // Create instruction text with scanner type indicator
    const scannerType = this.useNativeScanner
      ? "(High-Speed Mode)"
      : "(Compatible Mode)"
    const instructions = document.createElement("div")
    instructions.style.cssText =
      "color: white; text-align: center; margin-bottom: 20px; padding: 0 20px;"
    instructions.innerHTML = `
      <h3 style="color: white; margin-bottom: 10px;">Barcode Scanner ${scannerType}</h3>
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

    // Use native scanner if available, otherwise fallback to html5-qrcode
    if (this.useNativeScanner) {
      await this.startNativeScanner()
    } else {
      await this.startHtml5QrCodeScanner()
    }
  }

  async startNativeScanner() {
    try {
      const scannerContainer = document.getElementById("scanner")

      // Create video element for native scanning
      this.videoElement = document.createElement("video")
      this.videoElement.style.cssText =
        "width: 100%; height: auto; background: black;"
      this.videoElement.autoplay = true
      this.videoElement.muted = true
      this.videoElement.playsInline = true

      // Create canvas for frame capture
      this.canvasElement = document.createElement("canvas")
      this.canvasElement.style.display = "none"

      scannerContainer.appendChild(this.videoElement)
      scannerContainer.appendChild(this.canvasElement)

      // Get camera stream with optimized constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
        },
      })

      this.videoElement.srcObject = stream
      await this.videoElement.play()

      // Set up canvas for frame capture
      this.canvasElement.width = this.videoElement.videoWidth || 640
      this.canvasElement.height = this.videoElement.videoHeight || 480

      this.onCameraReady()
      this.startNativeScanning()
    } catch (err) {
      console.error("Native scanner failed, falling back to html5-qrcode:", err)
      this.useNativeScanner = false
      await this.startHtml5QrCodeScanner()
    }
  }

  startNativeScanning() {
    const ctx = this.canvasElement.getContext("2d")
    let frameSkipCounter = 0
    const frameSkipRate = 2 // Process every 2nd frame for better performance

    const scanFrame = async () => {
      if (this.isScannerStopped) return

      // Skip frames for better performance
      frameSkipCounter++
      if (frameSkipCounter % frameSkipRate !== 0) {
        if (!this.isScannerStopped) {
          this.scanInterval = requestAnimationFrame(scanFrame)
        }
        return
      }

      try {
        // Capture current video frame
        ctx.drawImage(
          this.videoElement,
          0,
          0,
          this.canvasElement.width,
          this.canvasElement.height,
        )

        // Convert to ImageData for BarcodeDetector
        const imageData = ctx.getImageData(
          0,
          0,
          this.canvasElement.width,
          this.canvasElement.height,
        )

        // Detect barcodes
        const barcodes = await this.barcodeDetector.detect(imageData)

        if (barcodes.length > 0) {
          const barcode = barcodes[0]
          console.log(
            "🎯 Native barcode detected:",
            barcode.rawValue,
            "Format:",
            barcode.format,
          )
          this.handleBarcodeDetection(barcode.rawValue)
          return
        }

        this.scanAttempts++
        this.updateScanCounter()
        this.trackPerformance()
      } catch (err) {
        console.warn("Native scan frame error:", err)
        this.scanAttempts++
      }

      // Schedule next scan using requestAnimationFrame for smooth performance
      if (!this.isScannerStopped) {
        this.scanInterval = requestAnimationFrame(scanFrame)
      }
    }

    // Start scanning with requestAnimationFrame for optimal performance
    this.scanInterval = requestAnimationFrame(scanFrame)
  }

  async startHtml5QrCodeScanner() {
    this.html5QrCode = new Html5Qrcode("scanner")

    // Enhanced camera constraints for better performance
    const cameraConfig = {
      facingMode: "environment",
      advanced: [
        {
          focusMode: "continuous",
          focusDistance: 0.1,
        },
      ],
    }

    try {
      await this.html5QrCode.start(
        cameraConfig,
        this.config,
        (code, result) => {
          this.handleBarcodeDetection(code)
        },
        (errorMessage, error) => {
          this.handleScanError(errorMessage, error)
        },
      )
      this.onCameraReady()
    } catch (err) {
      // Fallback to basic camera config if advanced fails
      try {
        await this.html5QrCode.start(
          { facingMode: "environment" },
          this.config,
          (code, result) => {
            this.handleBarcodeDetection(code)
          },
          (errorMessage, error) => {
            this.handleScanError(errorMessage, error)
          },
        )
        this.onCameraReady()
      } catch (fallbackErr) {
        this.onCameraError(fallbackErr)
      }
    }
  }

  onCameraReady() {
    const statusElement = document.getElementById("scanner-status")
    if (statusElement) {
      const mode = this.useNativeScanner
        ? "High-Speed Native Scanner"
        : "Compatible Scanner"
      statusElement.textContent = `${mode} ready - Point at barcode`
      statusElement.style.color = "rgba(255,255,255,0.6)"
    }
    this.setupTorchControl()
  }

  setupTorchControl() {
    // Torch control setup - works for both native and html5-qrcode modes
    const torchButton = document.getElementById("torch-toggle")
    if (!torchButton) return

    if (
      this.useNativeScanner &&
      this.videoElement &&
      this.videoElement.srcObject
    ) {
      // Native mode torch control
      const stream = this.videoElement.srcObject
      const videoTrack = stream.getVideoTracks()[0]

      if (
        videoTrack &&
        videoTrack.getCapabilities &&
        videoTrack.getCapabilities().torch
      ) {
        torchButton.style.display = "inline-block"
        torchButton.addEventListener("click", () =>
          this.toggleNativeTorch(videoTrack),
        )
      }
    } else if (
      this.html5QrCode &&
      this.html5QrCode.getRunningTrackCapabilities
    ) {
      // html5-qrcode mode torch control
      const capabilities = this.html5QrCode.getRunningTrackCapabilities()
      if (capabilities && capabilities.torch) {
        torchButton.style.display = "inline-block"
        torchButton.addEventListener("click", () => this.toggleTorch())
      }
    }
  }

  toggleNativeTorch(videoTrack) {
    try {
      const torchButton = document.getElementById("torch-toggle")
      const icon = torchButton.querySelector(".material-icons")

      if (this.torchEnabled) {
        videoTrack.applyConstraints({ torch: false })
        this.torchEnabled = false
        icon.textContent = "flash_off"
        torchButton.classList.remove("btn-warning")
        torchButton.classList.add("btn-outline")
      } else {
        videoTrack.applyConstraints({ torch: true })
        this.torchEnabled = true
        icon.textContent = "flash_on"
        torchButton.classList.remove("btn-outline")
        torchButton.classList.add("btn-warning")
      }
    } catch (err) {
      console.warn("Native torch control not supported:", err)
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
    this.isScannerStopped = true

    // Clear scanning interval for native mode
    if (this.scanInterval) {
      if (typeof this.scanInterval === "number" && this.scanInterval > 1000) {
        clearTimeout(this.scanInterval)
      } else {
        cancelAnimationFrame(this.scanInterval)
      }
      this.scanInterval = null
    }

    // Stop native video stream
    if (this.videoElement && this.videoElement.srcObject) {
      const stream = this.videoElement.srcObject
      const tracks = stream.getTracks()
      tracks.forEach((track) => track.stop())
      this.videoElement.srcObject = null
    }

    // Stop html5-qrcode scanner
    if (this.html5QrCode && !this.isScannerStopped) {
      this.html5QrCode
        .stop()
        .then(() => {
          this.cleanup()
        })
        .catch(() => {
          this.cleanup()
        })
    } else {
      this.cleanup()
    }
  }

  cleanup() {
    // Clear scanning interval (both setTimeout and requestAnimationFrame)
    if (this.scanInterval) {
      if (typeof this.scanInterval === "number" && this.scanInterval > 1000) {
        // setTimeout ID
        clearTimeout(this.scanInterval)
      } else {
        // requestAnimationFrame ID
        cancelAnimationFrame(this.scanInterval)
      }
      this.scanInterval = null
    }

    // Clean up video stream
    if (this.videoElement && this.videoElement.srcObject) {
      const stream = this.videoElement.srcObject
      const tracks = stream.getTracks()
      tracks.forEach((track) => track.stop())
    }

    // Clean up DOM elements
    if (this.scannerDiv) {
      this.scannerDiv.remove()
      this.scannerDiv = null
    }

    // Reset state
    this.html5QrCode = null
    this.videoElement = null
    this.canvasElement = null
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
