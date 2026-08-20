<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const cursorX = ref(-1000)
const cursorY = ref(-1000)
const targetX = ref(-1000)
const targetY = ref(-1000)
const currentRadius = ref(140)
const targetRadius = ref(140)
const isHovering = ref(false)
const isVisible = ref(false)

let rafId: number | null = null

const updatePhysics = () => {
  // Smooth spring / lerp interpolation
  cursorX.value += (targetX.value - cursorX.value) * 0.14
  cursorY.value += (targetY.value - cursorY.value) * 0.14
  currentRadius.value += (targetRadius.value - currentRadius.value) * 0.1

  // Update CSS Variables on document root for the portal mask
  const root = document.documentElement
  root.style.setProperty('--portal-x', `${cursorX.value.toFixed(2)}px`)
  root.style.setProperty('--portal-y', `${cursorY.value.toFixed(2)}px`)
  root.style.setProperty('--portal-radius', `${currentRadius.value.toFixed(1)}px`)
  root.style.setProperty('--portal-active', isVisible.value ? '1' : '0')

  rafId = requestAnimationFrame(updatePhysics)
}

const handleMouseMove = (e: MouseEvent) => {
  if (!isVisible.value) {
    isVisible.value = true
    cursorX.value = e.clientX
    cursorY.value = e.clientY
  }
  targetX.value = e.clientX
  targetY.value = e.clientY

  // Check if hovering interactive element
  const target = e.target as HTMLElement | null
  const interactive = target?.closest('a, button, [role="button"], .project-card, .editorial-title, .index-btn')
  if (interactive) {
    isHovering.value = true
    targetRadius.value = 210 // Expande o portal ao passar sobre itens interativos
  } else {
    isHovering.value = false
    targetRadius.value = 140
  }
}

const handleMouseLeave = () => {
  isVisible.value = false
  targetX.value = -1000
  targetY.value = -1000
}

onMounted(() => {
  // Only enable on pointer-fine devices (desktops/laptops)
  if (window.matchMedia('(pointer: fine)').matches) {
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    document.addEventListener('mouseleave', handleMouseLeave)
    rafId = requestAnimationFrame(updatePhysics)
  }
})

onUnmounted(() => {
  if (rafId !== null) {
    cancelAnimationFrame(rafId)
  }
  window.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseleave', handleMouseLeave)
})
</script>

<template>
  <!-- Subtle Minimalist Magnetic Lens Ring & Dot -->
  <div
    v-if="isVisible"
    class="portal-cursor-follower"
    :class="{ 'is-hovering': isHovering }"
    :style="{
      transform: `translate3d(${cursorX}px, ${cursorY}px, 0)`
    }"
    aria-hidden="true"
  >
    <div class="cursor-lens-ring"></div>
    <div class="cursor-center-dot"></div>
  </div>
</template>

<style scoped>
.portal-cursor-follower {
  position: fixed;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 999;
  mix-blend-mode: difference;
  will-change: transform;
  transform: translate3d(-1000px, -1000px, 0);
  transition: opacity 300ms ease;
}

.cursor-lens-ring {
  position: absolute;
  top: -24px;
  left: -24px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.7);
  box-shadow: 0 0 12px rgba(255, 255, 255, 0.4);
  transition: transform 300ms cubic-bezier(0.25, 1, 0.5, 1), border-color 300ms ease;
}

.cursor-center-dot {
  position: absolute;
  top: -2px;
  left: -2px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: #ffffff;
  box-shadow: 0 0 8px #ffffff;
}

.portal-cursor-follower.is-hovering .cursor-lens-ring {
  transform: scale(1.6);
  border-color: rgba(255, 255, 255, 0.95);
  box-shadow: 0 0 20px rgba(56, 189, 248, 0.8);
}
</style>
