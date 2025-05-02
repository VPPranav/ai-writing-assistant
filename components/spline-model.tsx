"use client"

import { useEffect, useState, useRef } from "react"
import { Application } from "@splinetool/runtime"
import { Loader2 } from "lucide-react"

export default function SplineModel() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const appRef = useRef<Application | null>(null)
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Fallback 3D content - a simple rotating cube
  const renderFallbackCanvas = () => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let rotation = 0
    const size = 100
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2

    const animate = () => {
      if (!ctx) return

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Rotate and draw cube
      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate(rotation)

      // Draw a simple cube (just a square with perspective)
      ctx.beginPath()
      ctx.moveTo(-size / 2, -size / 2)
      ctx.lineTo(size / 2, -size / 2)
      ctx.lineTo(size / 2, size / 2)
      ctx.lineTo(-size / 2, size / 2)
      ctx.closePath()
      ctx.strokeStyle = "#ffffff"
      ctx.stroke()

      // Add some perspective lines
      ctx.beginPath()
      ctx.moveTo(-size / 2, -size / 2)
      ctx.lineTo(-size / 4, -size / 4)
      ctx.moveTo(size / 2, -size / 2)
      ctx.lineTo(size / 4, -size / 4)
      ctx.moveTo(size / 2, size / 2)
      ctx.lineTo(size / 4, size / 4)
      ctx.moveTo(-size / 2, size / 2)
      ctx.lineTo(-size / 4, size / 4)
      ctx.stroke()

      ctx.restore()

      // Update rotation
      rotation += 0.01

      // Continue animation
      requestAnimationFrame(animate)
    }

    animate()
  }

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current

    // Set canvas dimensions
    const updateCanvasSize = () => {
      if (canvas) {
        canvas.width = canvas.offsetWidth
        canvas.height = canvas.offsetHeight
      }
    }

    updateCanvasSize()
    window.addEventListener("resize", updateCanvasSize)

    // Set a timeout to detect if loading takes too long
    loadingTimeoutRef.current = setTimeout(() => {
      if (!isLoaded) {
        setError("Loading timeout - using fallback visualization")
        renderFallbackCanvas()
      }
    }, 10000) // 10 seconds timeout

    try {
      // Try to load the Spline scene with error handling
      appRef.current = new Application(canvas)

      // Try a different Spline scene URL that's more likely to work
      // This is a simple scene that should load more reliably
      appRef.current
        .load("https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode")
        .then(() => {
          setIsLoaded(true)
          setError(null)
          if (loadingTimeoutRef.current) {
            clearTimeout(loadingTimeoutRef.current)
          }
        })
        .catch((err) => {
          console.error("Error loading Spline scene:", err)
          setError("Failed to load 3D model - using fallback visualization")
          renderFallbackCanvas()
        })
    } catch (err) {
      console.error("Error initializing Spline:", err)
      setError("Failed to initialize 3D environment - using fallback visualization")
      renderFallbackCanvas()
    }

    return () => {
      // Cleanup
      window.removeEventListener("resize", updateCanvasSize)
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }
      if (appRef.current) {
        appRef.current.dispose()
      }
    }
  }, [])

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        id="spline-canvas"
        className={`w-full h-full transition-opacity duration-500 ${isLoaded || error ? "opacity-100" : "opacity-0"}`}
      />

      {!isLoaded && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin mb-2" />
          <p className="text-sm text-muted-foreground">Loading 3D model...</p>
        </div>
      )}

      {error && <div className="absolute bottom-4 left-4 bg-black/70 text-white text-xs p-2 rounded">{error}</div>}
    </div>
  )
}
