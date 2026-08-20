<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const emit = defineEmits<{
  (e: 'loaded'): void
}>()

const progress = ref(0)
const isVisible = ref(true)
const isExpanding = ref(false)

let timer: number | null = null

const startLoading = () => {
  // Prevent scroll during loading
  document.body.style.overflow = 'hidden'

  const duration = 1400 // 1.4s rápido e dinâmico
  const startTime = Date.now()

  timer = window.setInterval(() => {
    const elapsed = Date.now() - startTime
    const rawProgress = Math.min(elapsed / duration, 1)

    // Smooth natural easing
    const easedProgress = 1 - Math.pow(1 - rawProgress, 2.5)
    progress.value = Math.min(Math.floor(easedProgress * 100), 100)

    if (rawProgress >= 1) {
      if (timer !== null) {
        clearInterval(timer)
        timer = null
      }
      progress.value = 100

      setTimeout(() => {
        isExpanding.value = true

        setTimeout(() => {
          isVisible.value = false
          document.body.style.overflow = ''
          emit('loaded')
        }, 900)
      }, 150)
    }
  }, 16)
}

onMounted(() => {
  startLoading()
})

onUnmounted(() => {
  if (timer !== null) {
    clearInterval(timer)
  }
  document.body.style.overflow = ''
})
</script>

<template>
  <div
    v-if="isVisible"
    class="loader-overlay"
    aria-hidden="true"
  >
    <!-- Cinematic High-Res Dark Blue Cosmic Horizon Background -->
    <div class="loader-bg-image"></div>

    <!-- Dark Ambient Overlay -->
    <div class="loader-bg-overlay"></div>

    <div class="loader-content">
      <!-- Cosmic Eclipse Icon that morphs and expands directly into the white screen -->
      <div class="eclipse-container" :class="{ 'is-expanding': isExpanding }">
        <!-- Breathing Corona Glow Halo -->
        <div class="corona-halo" :class="{ 'fade-corona': isExpanding }"></div>

        <!-- SVG Planetary White Eclipse / Expanding Light Orb -->
        <svg viewBox="0 0 100 100" class="eclipse-svg" :class="{ 'is-expanding': isExpanding }">
          <defs>
            <!-- Eclipse Shadow Mask that opens up completely at 100% -->
            <mask id="phase-mask">
              <rect width="100" height="100" fill="#ffffff" />
              <circle
                cx="50"
                cy="50"
                r="34"
                :class="['mask-shadow-disc', { 'mask-vanish': isExpanding }]"
                fill="#000000"
              />
            </mask>
          </defs>

          <!-- Core Pure White Light Disc - Directly expands to fill the screen -->
          <circle
            cx="50"
            cy="50"
            r="38"
            fill="#ffffff"
            :mask="isExpanding ? undefined : 'url(#phase-mask)'"
            class="planet-white-disc"
            :class="{ 'white-expand': isExpanding }"
          />

          <!-- Atmospheric Rim Arc Contour -->
          <circle
            v-if="!isExpanding"
            cx="50"
            cy="50"
            r="38"
            fill="none"
            stroke="rgba(255, 255, 255, 0.4)"
            stroke-width="1"
            class="rim-contour"
          />
        </svg>
      </div>

      <!-- Clean Minimal Percentage Counter -->
      <div class="loader-counter" :class="{ 'fade-out': isExpanding }">
        <span class="counter-text">{{ progress }}%</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.loader-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #00031f;
  color: #ffffff;
  overflow: hidden;
  user-select: none;
}

/* Background Image with Slow Cinematic Motion */
.loader-bg-image {
  position: absolute;
  inset: -5%;
  width: 110%;
  height: 110%;
  background-image: url('/loader-bg.jpg');
  background-size: cover;
  background-position: center;
  z-index: 1;
  pointer-events: none;
  animation: cinematicPan 18s ease-in-out infinite alternate;
  will-change: transform;
}

@keyframes cinematicPan {
  0% {
    transform: scale(1) translate(0, 0);
  }
  100% {
    transform: scale(1.06) translate(-1.2%, -0.8%);
  }
}

/* Dark Ambient Overlay */
.loader-bg-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, rgba(0, 3, 31, 0.2) 0%, rgba(0, 3, 31, 0.6) 100%);
  z-index: 2;
  pointer-events: none;
}

.loader-content {
  position: relative;
  z-index: 4;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

/* Eclipse Container */
.eclipse-container {
  position: relative;
  width: 68px;
  height: 68px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: floatingPlanet 4s ease-in-out infinite alternate;
}

.eclipse-container.is-expanding {
  animation: none;
  margin-bottom: 0;
}

/* Breathing Outer Corona Glow Halo */
.corona-halo {
  position: absolute;
  inset: -14px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.6) 0%, rgba(56, 189, 248, 0.35) 40%, rgba(0, 0, 0, 0) 70%);
  animation: breatheCorona 3s ease-in-out infinite alternate;
  pointer-events: none;
  filter: blur(4px);
  transition: opacity 300ms ease;
}

.corona-halo.fade-corona {
  opacity: 0;
}

.eclipse-svg {
  width: 100%;
  height: 100%;
  display: block;
  filter: drop-shadow(0 0 16px rgba(255, 255, 255, 0.95)) drop-shadow(0 0 32px rgba(56, 189, 248, 0.7));
  overflow: visible;
}

.eclipse-svg.is-expanding {
  filter: none;
}

/* Mask Shadow Disc */
.mask-shadow-disc {
  animation: eclipsePhaseMorph 4s ease-in-out infinite alternate;
  transform-origin: center;
  transition: opacity 250ms ease;
}

.mask-shadow-disc.mask-vanish {
  opacity: 0;
  animation: none;
}

.rim-contour {
  opacity: 0.5;
}

/* The actual white circle expanding smoothly from the icon center to engulf the entire viewport */
.planet-white-disc {
  transform-origin: center;
  will-change: transform;
}

.planet-white-disc.white-expand {
  transform: scale(75);
  transition: transform 900ms cubic-bezier(0.68, 0, 0.25, 1);
}

@keyframes eclipsePhaseMorph {
  0% {
    cx: 64px;
    cy: 42px;
    r: 34px;
  }
  50% {
    cx: 48px;
    cy: 52px;
    r: 36px;
  }
  100% {
    cx: 36px;
    cy: 58px;
    r: 34px;
  }
}

@keyframes breatheCorona {
  0% {
    transform: scale(0.92);
    opacity: 0.45;
  }
  100% {
    transform: scale(1.15);
    opacity: 0.9;
  }
}

@keyframes floatingPlanet {
  0% {
    transform: translateY(0px);
  }
  100% {
    transform: translateY(-5px);
  }
}

/* Clean Percentage Counter */
.loader-counter {
  font-family: var(--font-sans, 'Plus Jakarta Sans', sans-serif);
  font-size: 0.95rem;
  font-weight: 600;
  color: #ffffff;
  letter-spacing: 0.04em;
  opacity: 0.95;
  text-shadow: 0 0 16px rgba(56, 189, 248, 0.6), 0 2px 8px rgba(0, 0, 0, 0.9);
  transition: opacity 250ms ease;
}

.loader-counter.fade-out {
  opacity: 0;
}
</style>
