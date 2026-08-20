<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import type { Project } from '@/types/resume'
import { X, ExternalLink, Film, Play } from 'lucide-vue-next'

const props = defineProps<{
  isOpen: boolean
  project: Project | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const videoEmbedUrl = computed(() => {
  if (!props.project) return ''
  
  if (props.project.driveId) {
    return `https://drive.google.com/file/d/${props.project.driveId}/preview`
  }
  
  if (props.project.videoUrl) {
    return props.project.videoUrl
  }
  
  return ''
})

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.isOpen) {
    emit('close')
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="isOpen && project" class="video-modal-overlay" @click.self="emit('close')">
        <div class="video-modal-container" role="dialog" aria-modal="true">
          <!-- Modal Header -->
          <div class="video-modal-header">
            <div class="header-info">
              <span class="project-cat-badge">{{ project.category || 'Filme / Projeto' }}</span>
              <h3 class="modal-project-title">{{ project.title }}</h3>
            </div>
            
            <button
              type="button"
              class="close-modal-btn"
              aria-label="Fechar vídeo"
              @click="emit('close')"
            >
              <X :size="20" />
            </button>
          </div>

          <!-- Video Player Frame -->
          <div class="video-frame-wrapper">
            <!-- Google Drive / Web Embed Iframe -->
            <iframe
              v-if="project.driveId || (project.videoUrl && project.videoUrl.includes('drive.google.com'))"
              :src="videoEmbedUrl"
              class="video-iframe"
              allow="autoplay; fullscreen"
              allowfullscreen
            ></iframe>

            <!-- Direct HTML5 Video Player if local/direct file URL -->
            <video
              v-else-if="project.videoUrl && !project.videoUrl.includes('http')"
              :src="project.videoUrl"
              class="direct-video"
              controls
              autoplay
              playsinline
            ></video>

            <!-- Fallback Image with Play Link -->
            <div v-else class="video-fallback">
              <img :src="project.image" :alt="project.title" class="fallback-img" />
              <a
                v-if="project.demoUrl"
                :href="project.demoUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="external-play-btn"
              >
                <Play :size="24" class="play-icon" />
                <span>Assistir no Drive / Vimeo</span>
              </a>
            </div>
          </div>

          <!-- Video Details & Metadata Footer -->
          <div class="video-modal-footer">
            <p class="project-desc">{{ project.description }}</p>
            
            <div class="tech-tags">
              <span v-for="t in project.technologies" :key="t" class="tech-tag">
                {{ t }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.video-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  background-color: rgba(0, 3, 31, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.video-modal-container {
  width: 100%;
  max-width: 960px;
  background-color: #0b1124;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
}

.video-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background-color: rgba(11, 17, 36, 0.95);
}

.project-cat-badge {
  font-size: 0.75rem;
  font-family: var(--font-mono);
  color: #38bdf8;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 2px;
  display: block;
}

.modal-project-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #ffffff;
}

.close-modal-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  color: #94a3b8;
  background: rgba(255, 255, 255, 0.05);
  transition: all var(--transition-fast);
}

.close-modal-btn:hover {
  color: #ffffff;
  background-color: rgba(255, 255, 255, 0.15);
}

/* Video Player Frame (16:9 Aspect Ratio) */
.video-frame-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background-color: #000000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-iframe,
.direct-video {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}

.video-fallback {
  position: relative;
  width: 100%;
  height: 100%;
}

.fallback-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.external-play-btn {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.75rem;
  background-color: #38bdf8;
  color: #00031f;
  font-weight: 700;
  font-size: 0.95rem;
  border-radius: var(--radius-full);
  box-shadow: 0 0 30px rgba(56, 189, 248, 0.6);
  transition: transform var(--transition-fast), background-color var(--transition-fast);
}

.external-play-btn:hover {
  transform: translate(-50%, -50%) scale(1.05);
  background-color: #7dd3fc;
}

/* Footer details */
.video-modal-footer {
  padding: 1.25rem 1.5rem;
  background-color: #070d1e;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.project-desc {
  font-size: 0.9rem;
  color: #94a3b8;
  line-height: 1.6;
  margin-bottom: 0.75rem;
}

.tech-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tech-tag {
  font-size: 0.75rem;
  font-family: var(--font-mono);
  padding: 3px 8px;
  border-radius: var(--radius-sm);
  background-color: rgba(255, 255, 255, 0.06);
  color: #cbd5e1;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Modal Transition */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 300ms ease, transform 300ms ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: scale(0.96);
}
</style>
