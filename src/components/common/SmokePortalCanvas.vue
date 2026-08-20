<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const canvasRef = ref<HTMLCanvasElement | null>(null)
let animationId: number | null = null

interface SmokeParticle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  maxRadius: number
  alpha: number
  decay: number
  scale: number
  rotation: number
  rotationSpeed: number
}

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  let width = (canvas.width = window.innerWidth)
  let height = (canvas.height = window.innerHeight)

  // Preload the cosmic background image for pattern drawing
  const bgImg = new Image()
  bgImg.src = '/loader-bg.jpg'
  let isImgLoaded = false
  bgImg.onload = () => {
    isImgLoaded = true
  }

  const handleResize = () => {
    if (!canvas) return
    width = canvas.width = window.innerWidth
    height = canvas.height = window.innerHeight
  }
  window.addEventListener('resize', handleResize)

  const particles: SmokeParticle[] = []
  let lastX = -1000
  let lastY = -1000
  let isMouseInside = false

  const spawnSmokeBlob = (x: number, y: number, speed: number) => {
    const angle = Math.random() * Math.PI * 2
    const drift = Math.random() * 0.8 + 0.2
    
    // Vary size based on speed
    const baseRadius = Math.min(Math.max(speed * 1.5, 45), 90)

    particles.push({
      x: x + (Math.random() - 0.5) * 14,
      y: y + (Math.random() - 0.5) * 14,
      vx: Math.cos(angle) * drift * 0.5,
      vy: Math.sin(angle) * drift * 0.5 - 0.2, // Subtle rising smoke physics
      radius: baseRadius * 0.6,
      maxRadius: baseRadius * (Math.random() * 0.6 + 1.4),
      alpha: Math.random() * 0.35 + 0.65,
      decay: Math.random() * 0.012 + 0.014, // Disperses in ~1.2 to 1.8 seconds
      scale: 1,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.02
    })
  }

  const handleMouseMove = (e: MouseEvent) => {
    isMouseInside = true
    const currentX = e.clientX
    const currentY = e.clientY

    if (lastX === -1000) {
      lastX = currentX
      lastY = currentY
      spawnSmokeBlob(currentX, currentY, 20)
      return
    }

    const dx = currentX - lastX
    const dy = currentY - lastY
    const dist = Math.sqrt(dx * dx + dy * dy)
    const steps = Math.max(Math.floor(dist / 10), 1)

    // Interpolate continuous smoke puffs along the cursor path
    for (let i = 0; i < steps; i++) {
      const interpX = lastX + (dx * i) / steps
      const interpY = lastY + (dy * i) / steps
      spawnSmokeBlob(interpX, interpY, dist)
    }

    lastX = currentX
    lastY = currentY
  }

  const handleMouseLeave = () => {
    isMouseInside = false
    lastX = -1000
    lastY = -1000
  }

  if (window.matchMedia('(pointer: fine)').matches) {
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    document.addEventListener('mouseleave', handleMouseLeave)
  }

  // Pre-generate soft radial puff gradient cache
  const puffCanvas = document.createElement('canvas')
  const puffSize = 160
  puffCanvas.width = puffSize
  puffCanvas.height = puffSize
  const puffCtx = puffCanvas.getContext('2d')
  if (puffCtx) {
    const puffGrad = puffCtx.createRadialGradient(
      puffSize / 2,
      puffSize / 2,
      0,
      puffSize / 2,
      puffSize / 2,
      puffSize / 2
    )
    puffGrad.addColorStop(0, 'rgba(255, 255, 255, 1)')
    puffGrad.addColorStop(0.35, 'rgba(255, 255, 255, 0.85)')
    puffGrad.addColorStop(0.7, 'rgba(255, 255, 255, 0.35)')
    puffGrad.addColorStop(1, 'rgba(255, 255, 255, 0)')

    puffCtx.fillStyle = puffGrad
    puffCtx.fillRect(0, 0, puffSize, puffSize)
  }

  const render = () => {
    ctx.clearRect(0, 0, width, height)

    if (particles.length > 0) {
      // Step 1: Draw smoke shape mask
      ctx.save()
      ctx.globalCompositeOperation = 'source-over'

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]

        p.x += p.vx
        p.y += p.vy
        p.rotation += p.rotationSpeed
        p.radius += (p.maxRadius - p.radius) * 0.04
        p.alpha -= p.decay

        if (p.alpha <= 0.01) {
          particles.splice(i, 1)
          continue
        }

        ctx.save()
        ctx.globalAlpha = p.alpha
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rotation)
        const renderRadius = p.radius
        ctx.drawImage(
          puffCanvas,
          -renderRadius,
          -renderRadius,
          renderRadius * 2,
          renderRadius * 2
        )
        ctx.restore()
      }
      ctx.restore()

      // Step 2: Mask the cosmic background inside the smoke trail
      if (isImgLoaded && particles.length > 0) {
        ctx.save()
        ctx.globalCompositeOperation = 'source-in'

        // Cover the canvas with the high-res cosmic background
        const imgRatio = bgImg.width / bgImg.height
        const canvasRatio = width / height
        let drawW = width
        let drawH = height
        let drawX = 0
        let drawY = 0

        if (canvasRatio > imgRatio) {
          drawH = width / imgRatio
          drawY = (height - drawH) / 2
        } else {
          drawW = height * imgRatio
          drawX = (width - drawW) / 2
        }

        ctx.drawImage(bgImg, drawX, drawY, drawW, drawH)

        // Subtle electric blue & purple tint overlay for ethereal contrast
        ctx.globalCompositeOperation = 'source-atop'
        ctx.fillStyle = 'rgba(56, 189, 248, 0.12)'
        ctx.fillRect(0, 0, width, height)

        ctx.restore()
      }
    }

    animationId = requestAnimationFrame(render)
  }

  render()

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    window.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseleave', handleMouseLeave)
    if (animationId !== null) {
      cancelAnimationFrame(animationId)
    }
  })
})
</script>

<template>
  <!-- Smoke Trail Canvas Layer (Sits softly above the page revealing the cosmic world) -->
  <canvas
    ref="canvasRef"
    class="smoke-trail-canvas"
    aria-hidden="true"
  ></canvas>
</template>

<style scoped>
.smoke-trail-canvas {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: 2; /* Sits right above the page content without blocking clicks */
  pointer-events: none;
  filter: drop-shadow(0 0 16px rgba(0, 3, 31, 0.45));
  will-change: transform;
}
</style>
