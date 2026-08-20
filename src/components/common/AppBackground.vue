<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useTheme } from '@/composables/useTheme'

const { theme } = useTheme()
const canvasRef = ref<HTMLCanvasElement | null>(null)
let animationId: number | null = null

interface Particle {
  x: number
  y: number
  radius: number
  color: string
  vx: number
  vy: number
  alpha: number
  baseAlpha: number
}

interface Wave {
  y: number
  length: number
  amplitude: number
  frequency: number
}

const startAnimation = () => {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  let width = (canvas.width = window.innerWidth)
  let height = (canvas.height = window.innerHeight)

  const handleResize = () => {
    if (!canvas) return
    width = canvas.width = window.innerWidth
    height = canvas.height = window.innerHeight
  }
  window.addEventListener('resize', handleResize)

  let mouseX = width / 2
  let mouseY = height / 2
  let targetMouseX = mouseX
  let targetMouseY = mouseY

  const handleMouseMove = (e: MouseEvent) => {
    targetMouseX = e.clientX
    targetMouseY = e.clientY
  }
  window.addEventListener('mousemove', handleMouseMove)

  const particles: Particle[] = []
  const particleCount = Math.min(Math.floor((width * height) / 18000), 65)

  const colors = [
    'rgba(56, 189, 248, ',
    'rgba(99, 102, 241, ',
    'rgba(168, 85, 247, ',
    'rgba(244, 63, 94, '
  ]

  for (let i = 0; i < particleCount; i++) {
    const baseAlpha = Math.random() * 0.35 + 0.1
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2.5 + 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      alpha: baseAlpha,
      baseAlpha
    })
  }

  let tick = 0
  const waves: Wave[] = [
    { y: height * 0.3, length: 0.003, amplitude: 60, frequency: 0.008 },
    { y: height * 0.5, length: 0.002, amplitude: 90, frequency: 0.005 },
    { y: height * 0.7, length: 0.004, amplitude: 70, frequency: 0.006 }
  ]

  const render = () => {
    tick += 0.015

    mouseX += (targetMouseX - mouseX) * 0.05
    mouseY += (targetMouseY - mouseY) * 0.05

    ctx.clearRect(0, 0, width, height)

    const gradient = ctx.createRadialGradient(
      mouseX,
      mouseY,
      10,
      width / 2,
      height / 2,
      Math.max(width, height) * 0.85
    )
    gradient.addColorStop(0, '#040926')
    gradient.addColorStop(0.5, '#00031f')
    gradient.addColorStop(1, '#020412')

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    waves.forEach((wave, idx) => {
      ctx.beginPath()
      ctx.moveTo(0, wave.y)

      for (let x = 0; x <= width; x += 10) {
        const sine = Math.sin(x * wave.length + tick + idx)
        const cos = Math.cos(x * wave.length * 0.5 + tick)
        const y = wave.y + sine * wave.amplitude + cos * (wave.amplitude * 0.3)
        ctx.lineTo(x, y)
      }

      ctx.lineTo(width, height)
      ctx.lineTo(0, height)
      ctx.closePath()

      const waveGrad = ctx.createLinearGradient(0, wave.y - 100, width, wave.y + 100)
      if (idx === 0) {
        waveGrad.addColorStop(0, 'rgba(56, 189, 248, 0.03)')
        waveGrad.addColorStop(1, 'rgba(0, 3, 31, 0)')
      } else if (idx === 1) {
        waveGrad.addColorStop(0, 'rgba(99, 102, 241, 0.04)')
        waveGrad.addColorStop(1, 'rgba(2, 4, 18, 0)')
      } else {
        waveGrad.addColorStop(0, 'rgba(168, 85, 247, 0.025)')
        waveGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
      }

      ctx.fillStyle = waveGrad
      ctx.fill()
    })

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i]

      p.x += p.vx
      p.y += p.vy

      if (p.x < 0) p.x = width
      if (p.x > width) p.x = 0
      if (p.y < 0) p.y = height
      if (p.y > height) p.y = 0

      const dx = mouseX - p.x
      const dy = mouseY - p.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 160) {
        p.alpha = Math.min(p.baseAlpha + (1 - dist / 160) * 0.5, 0.85)
      } else {
        p.alpha = p.baseAlpha
      }

      ctx.beginPath()
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
      ctx.fillStyle = `${p.color}${p.alpha})`
      ctx.shadowBlur = 12
      ctx.shadowColor = 'rgba(56, 189, 248, 0.5)'
      ctx.fill()
      ctx.shadowBlur = 0

      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j]
        const pdx = p.x - p2.x
        const pdy = p.y - p2.y
        const pdist = Math.sqrt(pdx * pdx + pdy * pdy)

        if (pdist < 110) {
          ctx.beginPath()
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(p2.x, p2.y)
          ctx.strokeStyle = `rgba(125, 211, 252, ${(1 - pdist / 110) * 0.08})`
          ctx.lineWidth = 0.6
          ctx.stroke()
        }
      }
    }

    animationId = requestAnimationFrame(render)
  }

  render()
}

onMounted(() => {
  startAnimation()
})

onUnmounted(() => {
  if (animationId !== null) {
    cancelAnimationFrame(animationId)
  }
})
</script>

<template>
  <canvas
    ref="canvasRef"
    class="animated-bg-canvas"
    aria-hidden="true"
  ></canvas>
</template>

<style scoped>
.animated-bg-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  touch-action: none;
}
</style>
