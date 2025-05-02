"use client"

import { useEffect, useRef } from "react"

export default function Fallback3DModel() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const updateCanvasSize = () => {
      if (canvas) {
        canvas.width = canvas.offsetWidth
        canvas.height = canvas.offsetHeight
      }
    }

    updateCanvasSize()
    window.addEventListener("resize", updateCanvasSize)

    // Animation variables
    let rotation = 0
    const size = 150
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2

    // Colors for the theme
    const darkMode = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
    const strokeColor = darkMode ? "#ffffff" : "#000000"
    const fillColor = darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"

    // Animation function
    const animate = () => {
      if (!ctx) return

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update center position if canvas size changes
      const newCenterX = canvas.width / 2
      const newCenterY = canvas.height / 2

      // Draw multiple rotating shapes
      drawShape(ctx, newCenterX, newCenterY, size, rotation, strokeColor, fillColor)
      drawShape(ctx, newCenterX, newCenterY, size * 0.7, -rotation * 1.5, strokeColor, fillColor)
      drawShape(ctx, newCenterX, newCenterY, size * 0.4, rotation * 2, strokeColor, fillColor)

      // Update rotation
      rotation += 0.01

      // Continue animation
      requestAnimationFrame(animate)
    }

    // Start animation
    animate()

    return () => {
      window.removeEventListener("resize", updateCanvasSize)
    }
  }, [])

  // Function to draw a shape
  const drawShape = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    rotation: number,
    strokeColor: string,
    fillColor: string,
  ) => {
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(rotation)

    // Draw a hexagon
    ctx.beginPath()
    for (let i = 0; i < 6; i++) {
      const angle = ((Math.PI * 2) / 6) * i
      const pointX = size * Math.cos(angle)
      const pointY = size * Math.sin(angle)

      if (i === 0) {
        ctx.moveTo(pointX, pointY)
      } else {
        ctx.lineTo(pointX, pointY)
      }
    }
    ctx.closePath()

    // Style and fill
    ctx.strokeStyle = strokeColor
    ctx.lineWidth = 2
    ctx.fillStyle = fillColor
    ctx.fill()
    ctx.stroke()

    ctx.restore()
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  )
}
