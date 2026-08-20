<script setup lang="ts">
import { computed, nextTick, ref, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { resumeData } from '@/data/resume'
import { allPortfolioProjects, archiveProjects } from '@/data/projects'
import type { Project } from '@/types/resume'
import { localizeProjects, localizeResume } from '@/i18n/content'
import { persistLocale } from '@/i18n'
import type { SupportedLocale } from '@/i18n/messages'
import AppLoader from '@/components/common/AppLoader.vue'
import InfoModal from '@/components/common/InfoModal.vue'
import ProjectFluidReveal from '@/components/common/ProjectFluidReveal.vue'

const { t, locale } = useI18n()

const currentLocale = computed(() => locale.value as SupportedLocale)
const localizedResume = computed(() => localizeResume(resumeData, currentLocale.value))
const localizedArchiveProjects = computed(() => localizeProjects(archiveProjects, currentLocale.value))
const localizedAllProjects = computed(() => localizeProjects(allPortfolioProjects, currentLocale.value))
const deploymentBase = import.meta.env.BASE_URL.replace(/\/$/, '')
const getAppPath = () => {
  const pathname = window.location.pathname
  if (deploymentBase && (pathname === deploymentBase || pathname.startsWith(`${deploymentBase}/`))) {
    return pathname.slice(deploymentBase.length) || '/'
  }
  return pathname
}
const toDeploymentPath = (path: string) => `${deploymentBase}${path}`

const isLoaded = ref(false)
const isInfoOpen = ref(false)
const isEmailCopied = ref(false)
const isArchivePage = ref(getAppPath().replace(/\/+$/, '') === '/projetos')
const activeProjectSlug = ref<string | null>(null)
const displayedProjects = computed(() => (
  isArchivePage.value ? localizedArchiveProjects.value : localizedResume.value.projects
))
const activeProjectId = ref<string>(displayedProjects.value[0]?.id || '')
const activeProjectRenderKey = ref(`0-${activeProjectId.value}`)
const revealedProjectIds = ref<Set<string>>(new Set())
const selectedDetailProject = computed(() => (
  activeProjectSlug.value
    ? localizedAllProjects.value.find((project) => project.id === activeProjectSlug.value) || null
    : null
))
const detailDisplayTitle = computed(() => (
  selectedDetailProject.value?.title
    .normalize('NFC')
    .toLocaleUpperCase(currentLocale.value) || ''
))
const isProjectPage = computed(() => selectedDetailProject.value !== null)
const detailVideoOpen = ref(false)
const detailVideoEmbedUrl = computed(() => {
  const project = selectedDetailProject.value
  if (!project) return ''

  const driveId = project.driveId
    || project.demoUrl?.match(/\/file\/d\/([^/]+)/)?.[1]
    || project.videoUrl?.match(/\/file\/d\/([^/]+)/)?.[1]

  if (driveId) return `https://drive.google.com/file/d/${driveId}/preview?autoplay=1`
  return project.videoUrl?.startsWith('https://') ? project.videoUrl : ''
})
const detailPanels = computed(() => {
  const current = selectedDetailProject.value
  if (!current) return []

  const fallbackGallery = [current.image, current.image, current.image]
  const gallery = current.gallery?.length === 3 ? current.gallery : fallbackGallery

  return [
    {
      project: current,
      src: gallery[0],
      isCurrent: false,
      objectPosition: '0% 28%',
      scale: '1.78',
      origin: '0% 28%'
    },
    {
      project: current,
      src: gallery[1],
      isCurrent: true,
      objectPosition: '50% 50%',
      scale: '1.02',
      origin: '50% 50%'
    },
    {
      project: current,
      src: gallery[2],
      isCurrent: false,
      objectPosition: '100% 70%',
      scale: '1.78',
      origin: '100% 70%'
    }
  ]
})
const isInfiniteHome = computed(() => !isArchivePage.value && !isProjectPage.value)
const renderedProjects = computed(() => {
  const cycles = isInfiniteHome.value ? 2 : 1

  return Array.from({ length: cycles }, (_, cycle) => (
    displayedProjects.value.map((project) => ({
      project,
      cycle,
      renderKey: `${cycle}-${project.id}`
    }))
  )).flat()
})
const transitionPhase = ref<'idle' | 'cover' | 'leave'>('idle')
const transitionTitle = ref('')
const localeLabel = computed(() => currentLocale.value === 'pt-BR' ? 'PT' : 'EN')
const instagramUrl = 'https://www.instagram.com/'
const whatsappUrl = 'https://wa.me/5511963987741'

const toggleLocale = () => {
  const nextLocale: SupportedLocale = currentLocale.value === 'pt-BR' ? 'en' : 'pt-BR'
  locale.value = nextLocale
  persistLocale(nextLocale)
}

let revealObserver: IntersectionObserver | null = null
let revealSafetyTimer: number | null = null
let motionFrame: number | null = null
let loopMeasureFrame: number | null = null
let loopCycleHeight = 0
let loopResetAt = 0
let isResettingLoop = false
let lastMotionScrollY = window.scrollY
let smoothedVelocity = 0

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

const clamp = (value: number, min: number, max: number) => (
  Math.min(Math.max(value, min), max)
)

const updateProjectMotion = () => {
  motionFrame = null

  if (reducedMotion.matches) {
    document.documentElement.style.setProperty('--page-scroll-progress', '0')
    return
  }

  const currentScrollY = window.scrollY
  const rawVelocity = currentScrollY - lastMotionScrollY
  smoothedVelocity += (rawVelocity - smoothedVelocity) * 0.14
  lastMotionScrollY = currentScrollY

  const viewportHeight = window.innerHeight
  const viewportCenter = viewportHeight / 2
  const parallaxRange = window.innerWidth < 768 ? 12 : 28
  const tilt = clamp(smoothedVelocity * -0.025, -1.1, 1.1)

  document.querySelectorAll<HTMLElement>('.project-card').forEach((card) => {
    const rect = card.getBoundingClientRect()
    const cardCenter = rect.top + rect.height / 2
    const distance = clamp((cardCenter - viewportCenter) / viewportHeight, -1.2, 1.2)

    card.style.setProperty('--media-shift', `${(-distance * parallaxRange).toFixed(2)}px`)
    card.style.setProperty('--scroll-tilt', `${tilt.toFixed(3)}deg`)
  })

  const maxScroll = document.documentElement.scrollHeight - viewportHeight
  const progress = maxScroll > 0 ? clamp(currentScrollY / maxScroll, 0, 1) : 0
  document.documentElement.style.setProperty('--page-scroll-progress', progress.toFixed(4))

  if (Math.abs(smoothedVelocity) > 0.03) {
    smoothedVelocity *= 0.82
    motionFrame = window.requestAnimationFrame(updateProjectMotion)
  }
}

const requestProjectMotion = () => {
  if (motionFrame === null) {
    motionFrame = window.requestAnimationFrame(updateProjectMotion)
  }
}

const measureInfiniteLoop = () => {
  loopMeasureFrame = null
  loopCycleHeight = 0
  loopResetAt = 0

  if (!isInfiniteHome.value) return

  const firstCycleCard = document.querySelector<HTMLElement>('.project-card[data-loop-cycle="0"]')
  const secondCycleCard = document.querySelector<HTMLElement>('.project-card[data-loop-cycle="1"]')
  if (!firstCycleCard || !secondCycleCard) return

  const firstTop = firstCycleCard.getBoundingClientRect().top + window.scrollY
  const secondTop = secondCycleCard.getBoundingClientRect().top + window.scrollY

  loopCycleHeight = secondTop - firstTop
  loopResetAt = secondTop
}

const scheduleInfiniteLoopMeasure = () => {
  if (loopMeasureFrame !== null) window.cancelAnimationFrame(loopMeasureFrame)
  loopMeasureFrame = window.requestAnimationFrame(measureInfiniteLoop)
}

const maintainInfiniteScroll = () => {
  if (!isInfiniteHome.value || isResettingLoop || loopCycleHeight <= 0) return
  if (window.scrollY < loopResetAt) return

  isResettingLoop = true
  const targetScroll = window.scrollY - loopCycleHeight
  const root = document.documentElement
  const previousScrollBehavior = root.style.scrollBehavior

  root.style.scrollBehavior = 'auto'
  window.scrollTo({ top: targetScroll, behavior: 'auto' })
  lastMotionScrollY = targetScroll

  window.requestAnimationFrame(() => {
    root.style.scrollBehavior = previousScrollBehavior
    isResettingLoop = false
    requestProjectMotion()
  })
}

const revealCards = (cards: Iterable<HTMLElement>) => {
  const nextRevealed = new Set(revealedProjectIds.value)
  let changed = false

  for (const card of cards) {
    const projectId = card.dataset.projectId
    if (projectId && !nextRevealed.has(projectId)) {
      nextRevealed.add(projectId)
      changed = true
    }
  }

  if (changed) revealedProjectIds.value = nextRevealed
}

const setupProjectMotion = async () => {
  await nextTick()
  revealObserver?.disconnect()
  if (revealSafetyTimer !== null) {
    window.clearTimeout(revealSafetyTimer)
    revealSafetyTimer = null
  }

  const cards = document.querySelectorAll<HTMLElement>('.project-card')

  if (reducedMotion.matches || !('IntersectionObserver' in window)) {
    revealCards(cards)
    scheduleInfiniteLoopMeasure()
    requestProjectMotion()
    return
  }

  revealObserver = new IntersectionObserver((entries) => {
    const visibleCards = entries
      .filter((entry) => entry.isIntersecting)
      .map((entry) => entry.target as HTMLElement)

    revealCards(visibleCards)
    visibleCards.forEach((card) => revealObserver?.unobserve(card))
  }, {
    threshold: 0.14,
    rootMargin: '0px 0px -6% 0px'
  })

  cards.forEach((card, index) => {
    card.style.setProperty('--reveal-delay', `${Math.min(index, 2) * 70}ms`)
    revealObserver?.observe(card)
  })

  window.requestAnimationFrame(() => {
    const visibleCards = Array.from(cards).filter((card) => {
      const rect = card.getBoundingClientRect()
      return rect.top <= window.innerHeight * 1.08 && rect.bottom >= 0
    })

    revealCards(visibleCards)
    visibleCards.forEach((card) => revealObserver?.unobserve(card))
  })

  revealSafetyTimer = window.setTimeout(() => {
    revealCards(cards)
    revealSafetyTimer = null
  }, 1600)

  scheduleInfiniteLoopMeasure()
  requestProjectMotion()
}

const onLoaded = async () => {
  isLoaded.value = true
  await setupProjectMotion()
}

const copyEmail = async () => {
  try {
    await navigator.clipboard.writeText(resumeData.profile.email)
    isEmailCopied.value = true
    setTimeout(() => {
      isEmailCopied.value = false
    }, 2500)
  } catch {
    // fallback
  }
}

const scrollToProject = (id: string) => {
  activeProjectId.value = id
  activeProjectRenderKey.value = `0-${id}`
  const el = document.getElementById(`project-${id}`)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

const updatePageFromLocation = () => {
  const path = getAppPath().replace(/\/+$/, '') || '/'
  const projectMatch = path.match(/^\/projeto\/([^/]+)$/)

  activeProjectSlug.value = projectMatch ? decodeURIComponent(projectMatch[1]) : null
  isArchivePage.value = path === '/projetos'
  activeProjectId.value = displayedProjects.value[0]?.id || ''
  activeProjectRenderKey.value = `0-${activeProjectId.value}`
  detailVideoOpen.value = false
  document.title = selectedDetailProject.value
    ? `${selectedDetailProject.value.title} — ${localizedResume.value.profile.name}`
    : isArchivePage.value
      ? `${t('nav.allWork')} — ${localizedResume.value.profile.name}`
      : localizedResume.value.profile.name

  if (isLoaded.value) setupProjectMotion()
}

const navigateTo = (path: string) => {
  const deploymentPath = toDeploymentPath(path)
  if (window.location.pathname !== deploymentPath) {
    window.history.pushState({}, '', deploymentPath)
  }
  updatePageFromLocation()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const wait = (duration: number) => new Promise((resolve) => window.setTimeout(resolve, duration))

const transitionTo = async (path: string, title: string) => {
  if (transitionPhase.value !== 'idle') return

  transitionTitle.value = title.normalize('NFC').toLocaleUpperCase(currentLocale.value)
  transitionPhase.value = 'cover'
  await wait(reducedMotion.matches ? 0 : 920)

  const deploymentPath = toDeploymentPath(path)
  if (window.location.pathname !== deploymentPath) {
    window.history.pushState({}, '', deploymentPath)
  }
  updatePageFromLocation()
  window.scrollTo({ top: 0, behavior: 'auto' })
  await nextTick()
  await wait(reducedMotion.matches ? 0 : 180)

  transitionPhase.value = 'leave'
  await wait(reducedMotion.matches ? 0 : 1100)
  transitionPhase.value = 'idle'
}

const openProjectPage = (project: Project) => {
  transitionTo(`/projeto/${encodeURIComponent(project.id)}`, project.title)
}

const openDetailPanel = (isCurrent: boolean) => {
  if (isCurrent && detailVideoEmbedUrl.value) detailVideoOpen.value = true
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') detailVideoOpen.value = false
}

// Scroll spy for projects
const handleScroll = () => {
  if (isProjectPage.value) return

  const cards = document.querySelectorAll<HTMLElement>('.project-card')
  for (const card of cards) {
    const rect = card.getBoundingClientRect()
    if (rect.top <= window.innerHeight * 0.45 && rect.bottom >= window.innerHeight * 0.2) {
      activeProjectId.value = card.dataset.projectId || activeProjectId.value
      activeProjectRenderKey.value = card.dataset.renderKey || activeProjectRenderKey.value
      break
    }
  }

  maintainInfiniteScroll()
}

const handleResize = () => {
  requestProjectMotion()
  scheduleInfiniteLoopMeasure()
}

onMounted(() => {
  updatePageFromLocation()
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('scroll', requestProjectMotion, { passive: true })
  window.addEventListener('resize', handleResize, { passive: true })
  window.addEventListener('popstate', updatePageFromLocation)
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  revealObserver?.disconnect()
  if (revealSafetyTimer !== null) window.clearTimeout(revealSafetyTimer)
  if (motionFrame !== null) window.cancelAnimationFrame(motionFrame)
  if (loopMeasureFrame !== null) window.cancelAnimationFrame(loopMeasureFrame)
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('scroll', requestProjectMotion)
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('popstate', updatePageFromLocation)
  window.removeEventListener('keydown', handleKeydown)
})

watch(displayedProjects, () => {
  if (isLoaded.value) setupProjectMotion()
})

watch(locale, () => {
  updatePageFromLocation()
})
</script>

<template>
  <!-- Fullscreen Loading Overlay with Radial White Bloom Expansion -->
  <AppLoader @loaded="onLoaded" />

  <!-- Info & Career Drawer Modal -->
  <InfoModal
    :is-open="isInfoOpen"
    :profile="localizedResume.profile"
    :experiences="localizedResume.experiences"
    :skill-categories="localizedResume.skillCategories"
    :education="localizedResume.education"
    :certifications="localizedResume.certifications"
    @close="isInfoOpen = false"
  />

  <div
    :class="['page-transition', `is-${transitionPhase}`]"
    aria-hidden="true"
  >
    <span>{{ transitionTitle }}</span>
  </div>

  <div :class="['segerman-page', { 'page-visible': isLoaded }]">
    <div class="scroll-progress" aria-hidden="true"><span></span></div>
    <!-- Top Fixed Header -->
    <header :class="['top-nav', { 'is-detail-nav': isProjectPage }]">
      <div class="nav-left">
        <a href="/" class="nav-brand" @click.prevent="navigateTo('/')">{{ localizedResume.profile.name }}</a>
        <button
          v-if="isProjectPage"
          type="button"
          class="detail-index-link"
          @click="transitionTo('/', t('transition.selectedWork'))"
        >
          ← {{ t('nav.index') }}
        </button>
      </div>

      <div class="nav-right">
        <button
          type="button"
          class="nav-text-btn"
          @click="isInfoOpen = true"
        >
          {{ t('nav.info') }}
        </button>
        <span class="nav-comma nav-contact-separator">,</span>
        <div class="nav-contact-wrap">
          <button
            type="button"
            class="nav-text-btn nav-contact-btn"
            @click="copyEmail"
          >
            {{ t('nav.contact') }}
          </button>

          <span v-if="isEmailCopied" class="copied-badge">{{ t('feedback.emailCopied') }}</span>
        </div>
        <template v-if="!isProjectPage">
          <span class="nav-comma">,</span>
          <button
            type="button"
            class="nav-text-btn"
            @click="navigateTo(isArchivePage ? '/' : '/projetos')"
          >
            {{ isArchivePage ? t('nav.selected') : t('nav.allWork') }}
          </button>
        </template>

        <button
          type="button"
          class="locale-toggle"
          :aria-label="t('language.switchTo')"
          :title="t('language.switchTo')"
          @click="toggleLocale"
        >
          {{ localeLabel }}
        </button>
      </div>
    </header>

    <main v-if="selectedDetailProject" class="project-detail-page">
      <section class="detail-intro">
        <h1 class="detail-title">
          <span>{{ detailDisplayTitle }}</span>
        </h1>

        <div class="detail-filmstrip" :aria-label="t('project.image')">
          <figure
            v-for="(panel, panelIndex) in detailPanels"
            :key="`${panelIndex}-${panel.project.id}`"
            :class="['detail-panel', { 'is-current-panel': panel.isCurrent }]"
          >
            <div
              v-if="panel.isCurrent && detailVideoOpen && detailVideoEmbedUrl"
              class="detail-player-shell"
            >
              <div class="detail-player-viewport">
                <iframe
                  :src="detailVideoEmbedUrl"
                  :title="`${t('project.video')}: ${selectedDetailProject.title}`"
                  class="detail-video-frame"
                  allow="autoplay; fullscreen"
                  allowfullscreen
                ></iframe>
                <span class="detail-player-corner-mask" aria-hidden="true"></span>
              </div>
            </div>

            <button
              v-else
              type="button"
              :class="['detail-panel-action', { 'can-play': panel.isCurrent && detailVideoEmbedUrl }]"
              :aria-label="panel.isCurrent && detailVideoEmbedUrl
                ? t('project.playVideo', { title: panel.project.title })
                : panel.project.title
              "
              :disabled="!panel.isCurrent || !detailVideoEmbedUrl"
              @click="openDetailPanel(panel.isCurrent)"
            >
              <img
                :src="panel.src"
                :alt="panel.project.title"
                :style="{
                  objectPosition: panel.objectPosition,
                  transformOrigin: panel.origin,
                  '--detail-scale': panel.scale
                }"
              />

            </button>
          </figure>
        </div>

        <div class="detail-summary">
          <p>{{ selectedDetailProject.description }}</p>

          <dl class="detail-facts">
            <div>
              <dt>{{ t('project.type') }}</dt>
              <dd>{{ selectedDetailProject.category }}</dd>
            </div>
            <div>
              <dt>{{ t('project.work') }}</dt>
              <dd>{{ selectedDetailProject.technologies.join(', ') }}</dd>
            </div>
            <div v-if="detailVideoEmbedUrl">
              <dt>{{ t('project.video') }}</dt>
              <dd>
                <button type="button" class="detail-video-link" @click="detailVideoOpen = true">
                  {{ t('project.openVideo') }}
                </button>
              </dd>
            </div>
          </dl>
        </div>
      </section>

    </main>

    <!-- Main 3-Column Editorial Grid Layout -->
    <main v-else class="segerman-layout">
      <!-- Left Column (Pinned Editorial Hero & Meta) -->
      <aside class="left-col">
        <div class="hero-typography-block">
          <h1 class="editorial-title">
            <span :key="isArchivePage ? 'archive' : 'home'" class="line">
              {{ isArchivePage ? t('home.archiveTitle') : t('home.title') }}
            </span>
          </h1>

          <p class="editorial-subtitle">
            {{ isArchivePage
              ? t('home.archiveSummary', { count: localizedArchiveProjects.length })
              : localizedResume.profile.headline
            }}
          </p>
        </div>

        <!-- Left Column Bottom Metadata -->
        <div class="left-footer-meta">
          <div class="meta-block">
            <span class="meta-label">{{ t('home.contact') }}</span>
            <button type="button" class="meta-value link-btn" @click="copyEmail">
              {{ localizedResume.profile.email }}
            </button>
          </div>

          <div class="meta-block">
            <span class="meta-label">{{ t('home.instagram') }}</span>
            <a
              :href="instagramUrl"
              class="meta-value link-btn"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              @
            </a>
          </div>
        </div>
      </aside>

      <!-- Center Column (Work & Cinematic Film Media Stream) -->
      <section class="center-col" :aria-label="isArchivePage ? t('home.allProjects') : t('home.selectedProjects')">
        <div class="projects-stream">
          <article
            v-for="item in renderedProjects"
            :id="item.cycle === 0 ? `project-${item.project.id}` : undefined"
            :key="item.renderKey"
            :data-loop-cycle="item.cycle"
            :data-project-id="item.project.id"
            :data-render-key="item.renderKey"
            :class="['project-card', {
              'is-current': activeProjectId === item.project.id,
              'is-revealed': revealedProjectIds.has(item.project.id)
            }]"
          >
            <div
              class="project-media-wrapper"
              role="button"
              tabindex="0"
              :aria-label="t('project.open', { title: item.project.title })"
              @click="openProjectPage(item.project)"
              @keydown.enter="openProjectPage(item.project)"
              @pointerenter="activeProjectId = item.project.id; activeProjectRenderKey = item.renderKey"
            >
              <figure class="media-container">
                <!-- Dual-layer Image: Base B&W and Hover Saturated Color Reveal -->
                <img
                  v-if="item.project.image"
                  :src="item.project.image"
                  :alt="item.project.title"
                  class="project-img base-bw-img"
                  loading="lazy"
                />
                <ProjectFluidReveal
                  v-if="item.project.image && activeProjectRenderKey === item.renderKey"
                  :src="item.project.image"
                  :active="activeProjectId === item.project.id"
                />
                
              </figure>

              <div class="project-card-meta">
                <span class="project-category">{{ item.project.category }}</span>
                <h2 class="project-title-heading">{{ item.project.title }}</h2>
              </div>
            </div>
          </article>
        </div>
      </section>

      <!-- Right Column (Index Navigation Sidebar) -->
      <aside class="right-col" :aria-label="t('home.projectsIndex')">
        <div class="index-sticky-box">
          <p class="index-label">{{ t('home.index') }}</p>
          <ul class="index-list">
            <li
              v-for="project in displayedProjects"
              :key="project.id"
              class="index-item"
            >
              <button
                type="button"
                :class="['index-btn', { 'is-active': activeProjectId === project.id }]"
                @click="scrollToProject(project.id)"
              >
                {{ project.title }}
              </button>
            </li>
          </ul>

          <a
            :href="whatsappUrl"
            class="whatsapp-meta"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20.4 11.8a8.4 8.4 0 0 1-12.5 7.3L3.5 20.5l1.4-4.2a8.4 8.4 0 1 1 15.5-4.5Z" />
              <path d="M8.2 7.8c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.8 1.9c.1.3 0 .5-.2.7l-.6.7c-.2.2-.1.4 0 .6.6 1 1.5 1.9 2.6 2.5.2.1.4.2.6 0l.8-1c.2-.2.4-.3.7-.2l1.8.9c.3.1.4.3.4.5 0 .3-.2 1.3-.8 1.8-.5.5-1.2.7-2 .5-1.2-.3-2.8-.9-4.5-2.4-1.3-1.2-2.3-2.6-2.7-3.8-.4-1.1 0-2.1.4-2.7Z" />
            </svg>
          </a>
        </div>
      </aside>
    </main>
  </div>
</template>

<style scoped>
.page-transition {
  position: fixed;
  inset: 0;
  z-index: 9998;
  display: grid;
  place-items: center;
  padding: 2rem;
  overflow: hidden;
  pointer-events: none;
  background-color: #000000;
  color: #ffffff;
  transform: translate3d(0, 100%, 0);
  transition: transform 1000ms cubic-bezier(0.76, 0, 0.24, 1);
  will-change: transform;
}

.page-transition span {
  max-width: 1100px;
  font-family: 'Arial Narrow', Arial, Helvetica, sans-serif;
  font-size: clamp(2rem, 7vw, 7rem);
  font-weight: 900;
  line-height: 1.04;
  letter-spacing: -0.055em;
  text-align: center;
  opacity: 0;
  transform: translateY(32px);
  padding-block: 0.14em 0.08em;
  transition:
    opacity 520ms ease 180ms,
    transform 760ms cubic-bezier(0.22, 1, 0.36, 1) 180ms;
}

.page-transition.is-cover,
.page-transition.is-leave {
  pointer-events: auto;
}

.page-transition.is-cover {
  transform: translate3d(0, 0, 0);
}

.page-transition.is-cover span {
  opacity: 1;
  transform: translateY(0);
}

.page-transition.is-leave {
  transform: translate3d(0, -100%, 0);
}

.segerman-page {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  background-color: var(--color-bg);
  color: var(--color-text-primary);
  cursor: default;
  -webkit-user-select: none;
  user-select: none;
  opacity: 0;
  transition: opacity 700ms ease;
}

.segerman-page * {
  -webkit-user-select: none;
  user-select: none;
}

.segerman-page a,
.segerman-page button,
.segerman-page [role='button'] {
  cursor: default;
}

.segerman-page img {
  -webkit-user-drag: none;
}

.segerman-page.page-visible {
  opacity: 1;
}

.scroll-progress {
  position: fixed;
  top: 0;
  right: 0;
  width: 2px;
  height: 100vh;
  z-index: 80;
  pointer-events: none;
}

.scroll-progress span {
  display: block;
  width: 100%;
  height: 100%;
  background-color: var(--color-text-primary);
  transform: scaleY(var(--page-scroll-progress, 0));
  transform-origin: top;
  will-change: transform;
}

/* Top Navigation Bar */
.top-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2.5rem;
  z-index: 50;
  background-color: #ffffff;
  pointer-events: auto;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: clamp(2rem, 8vw, 9rem);
}

.detail-index-link {
  flex-shrink: 0;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--color-text-primary);
  transition: opacity var(--transition-fast), transform var(--transition-fast);
}

.detail-index-link:hover {
  opacity: 0.65;
  transform: translateX(-3px);
}

.top-nav > * {
  opacity: 0;
  transform: translateY(-10px);
}

.page-visible .top-nav > * {
  animation: navEnter 650ms cubic-bezier(0.22, 1, 0.36, 1) 120ms forwards;
}

@keyframes navEnter {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.nav-brand {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--color-text-primary);
  letter-spacing: -0.02em;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  position: relative;
}

.nav-text-btn {
  font-size: 1.05rem;
  font-weight: 500;
  color: var(--color-text-primary);
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px 4px;
  transition: opacity var(--transition-fast);
}

.nav-text-btn:hover {
  opacity: 0.7;
}

.nav-comma {
  color: var(--color-text-primary);
  font-size: 1.05rem;
  margin-right: 0.35rem;
}

.locale-toggle {
  min-width: 30px;
  margin-left: 0.45rem;
  padding: 4px 5px 3px;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  color: var(--color-text-primary);
  font-family: var(--font-mono);
  font-size: 0.66rem;
  font-weight: 600;
  line-height: 1;
  letter-spacing: 0.04em;
  transition: border-color var(--transition-fast), opacity var(--transition-fast);
}

.locale-toggle:hover {
  border-color: var(--color-text-primary);
  opacity: 0.72;
}

.nav-contact-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.copied-badge {
  position: absolute;
  top: calc(100% + 8px);
  left: 50%;
  white-space: nowrap;
  font-size: 0.75rem;
  font-family: var(--font-mono);
  background-color: var(--color-text-primary);
  color: var(--color-bg);
  padding: 3px 8px;
  border-radius: var(--radius-sm);
  animation: fadeInOut 2.5s ease forwards;
}

@keyframes fadeInOut {
  0% { opacity: 0; transform: translate(-50%, -4px); }
  15% { opacity: 1; transform: translate(-50%, 0); }
  85% { opacity: 1; transform: translate(-50%, 0); }
  100% { opacity: 0; transform: translate(-50%, -4px); }
}

/* 3-Column Layout */
.segerman-layout {
  display: grid;
  grid-template-columns: 1fr;
  min-height: 100vh;
  padding-top: 80px;
  min-width: 0;
}

@media (min-width: 1100px) {
  .segerman-layout {
    grid-template-columns: 42% 43% 15%;
    padding-top: 0;
  }
}

/* Left Column */
.left-col {
  padding: 2rem 2.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  z-index: 20;
  min-width: 0;
}

@media (min-width: 1100px) {
  .left-col {
    position: fixed;
    top: 0;
    left: 0;
    width: 42%;
    height: 100vh;
    padding: 100px 3.5rem 2.5rem 2.5rem;
    z-index: 20;
  }
}

.hero-typography-block {
  width: 100%;
  max-width: none;
}

.editorial-title {
  font-size: clamp(3.2rem, 6.6vw, 7rem);
  font-weight: 900;
  line-height: 0.95;
  letter-spacing: 0.012em;
  font-kerning: none;
  text-transform: uppercase;
  color: var(--color-text-primary);
  margin-bottom: 1.5rem;
  overflow: visible;
  padding-bottom: 0.04em;
}

.editorial-title .line {
  display: block;
  opacity: 0;
  transform: translateY(48%);
  clip-path: inset(0 0 100% 0);
}

.page-visible .editorial-title .line {
  animation: titleEnter 900ms cubic-bezier(0.16, 1, 0.3, 1) 120ms forwards;
}

@keyframes titleEnter {
  to {
    opacity: 1;
    transform: translateY(0);
    clip-path: inset(0 0 0 0);
  }
}

.editorial-subtitle {
  max-width: 480px;
  font-size: 1.125rem;
  font-weight: 500;
  line-height: 1.5;
  color: var(--color-text-secondary);
  opacity: 0;
  transform: translateY(18px);
}

.page-visible .editorial-subtitle {
  animation: contentEnter 750ms cubic-bezier(0.22, 1, 0.36, 1) 330ms forwards;
}

.left-footer-meta {
  display: flex;
  gap: 3.5rem;
  margin-top: 3rem;
  opacity: 0;
  transform: translateY(14px);
}

.page-visible .left-footer-meta {
  animation: contentEnter 750ms cubic-bezier(0.22, 1, 0.36, 1) 460ms forwards;
}

@keyframes contentEnter {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.meta-block {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.meta-label {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  font-weight: 500;
}

.meta-value {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.link-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  text-align: left;
  transition: opacity var(--transition-fast);
}

.link-btn:hover {
  opacity: 0.7;
}

/* Center Column (Media Stream) */
.center-col {
  padding: 1.5rem 1.5rem 4rem 1.5rem;
  min-width: 0;
}

@media (min-width: 1100px) {
  .center-col {
    grid-column: 2;
    padding: 100px 1.5rem 6rem 1.5rem;
  }
}

.projects-stream {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.project-card {
  position: relative;
  width: 100%;
  --media-shift: 0px;
  --scroll-tilt: 0deg;
}

.project-media-wrapper {
  display: block;
  cursor: pointer;
  text-decoration: none;
  border-radius: 4px;
  opacity: 0;
  transform: translate3d(0, 48px, 0);
  transform-origin: 50% 60%;
  transition:
    opacity 750ms cubic-bezier(0.22, 1, 0.36, 1) var(--reveal-delay, 0ms),
    transform 900ms cubic-bezier(0.16, 1, 0.3, 1) var(--reveal-delay, 0ms);
  will-change: transform, opacity;
}

.project-card.is-revealed .project-media-wrapper {
  opacity: 1;
  transform: none;
  will-change: auto;
}

.media-container {
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 2;
  overflow: hidden;
  isolation: isolate;
  border-radius: 4px;
  background-color: var(--color-surface-hover);
  clip-path: inset(0 0 100% 0);
  transition:
    clip-path 950ms cubic-bezier(0.16, 1, 0.3, 1) var(--reveal-delay, 0ms),
    transform 160ms ease-out;
  transform: rotate(var(--scroll-tilt));
  transform-origin: center;
}

.media-container,
.media-container * {
  cursor: pointer;
}

.project-card.is-revealed .media-container {
  clip-path: inset(0 0 0 0);
}

.project-img {
  position: absolute;
  inset: -6% 0;
  width: 100%;
  height: 112%;
  object-fit: cover;
  display: block;
  transform: translate3d(0, var(--media-shift), 0) scale(1.015);
  transform-origin: center center;
  transition: transform 2000ms cubic-bezier(0.16, 1, 0.3, 1), opacity 500ms ease;
  will-change: transform;
}

/* Base Grayscale Image */
.base-bw-img {
  filter: grayscale(100%) contrast(110%);
  z-index: 1;
}

.project-card:hover .base-bw-img {
  transform: translate3d(0, var(--media-shift), 0) scale(1.03);
}

.project-card-meta {
  margin-top: 0.875rem;
  display: flex;
  flex-direction: column;
  gap: 2px;
  opacity: 0;
  transform: translateY(12px);
  transition:
    opacity 600ms ease calc(var(--reveal-delay, 0ms) + 240ms),
    transform 750ms cubic-bezier(0.22, 1, 0.36, 1) calc(var(--reveal-delay, 0ms) + 240ms);
}

.project-card.is-revealed .project-card-meta {
  opacity: 1;
  transform: translateY(0);
}

.project-category {
  font-size: 0.75rem;
  font-family: var(--font-mono);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.project-title-heading {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--color-text-primary);
  letter-spacing: -0.01em;
}

/* Individual Project */
.project-detail-page {
  position: relative;
  min-height: 100vh;
  padding-top: 64px;
}

.detail-intro {
  min-height: calc(100vh - 64px);
  display: flex;
  flex-direction: column;
  padding: clamp(4rem, 8vh, 7rem) 1.5rem 2rem;
}

.detail-title {
  position: relative;
  z-index: 2;
  max-width: 1400px;
  margin: 0 auto clamp(1.5rem, 4vh, 3.5rem);
  font-family: 'Arial Narrow', Arial, Helvetica, sans-serif;
  font-size: clamp(3.5rem, 8vw, 8.5rem);
  font-weight: 900;
  line-height: 1.08;
  letter-spacing: -0.06em;
  word-spacing: 0.12em;
  text-align: center;
}

.detail-title span {
  display: block;
  padding-block: 0.16em 0.08em;
  opacity: 0;
  transform: translateY(28%);
  animation: detailTitleEnter 1250ms cubic-bezier(0.16, 1, 0.3, 1) 280ms forwards;
}

@keyframes detailTitleEnter {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.detail-filmstrip {
  display: grid;
  grid-template-columns: 0.9fr 1.3fr 0.9fr;
  gap: 1rem;
  width: calc(100% + 3rem);
  height: clamp(240px, 38vh, 430px);
  margin-left: -1.5rem;
}

.detail-panel {
  position: relative;
  min-width: 0;
  overflow: hidden;
  background: var(--color-surface-hover);
  clip-path: inset(0 0 100% 0);
  animation: detailPanelEnter 1000ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.detail-panel:nth-child(1) { animation-delay: 320ms; }
.detail-panel:nth-child(2) { animation-delay: 410ms; }
.detail-panel:nth-child(3) { animation-delay: 500ms; }

@keyframes detailPanelEnter {
  to { clip-path: inset(0 0 0 0); }
}

.detail-panel-action {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  overflow: hidden;
  color: var(--color-text-primary);
  text-align: left;
}

.detail-panel-action:not(:disabled),
.detail-panel-action.can-play {
  cursor: pointer;
}

.detail-panel-action:disabled {
  cursor: default;
}

.detail-panel img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(calc(var(--detail-scale, 1) * 1.08));
  animation: detailImageEnter 1300ms cubic-bezier(0.16, 1, 0.3, 1) 340ms forwards;
}

@keyframes detailImageEnter {
  to { transform: scale(var(--detail-scale, 1)); }
}

.detail-panel-action:not(:disabled):hover img {
  transform: scale(calc(var(--detail-scale, 1) * 1.025));
  transition: transform 1800ms cubic-bezier(0.16, 1, 0.3, 1);
}

.detail-player-shell,
.detail-player-viewport,
.detail-video-frame {
  display: block;
  width: 100%;
  height: 100%;
}

.detail-player-shell {
  position: relative;
  overflow: hidden;
  background: #000000;
}

.detail-player-viewport {
  position: absolute;
  inset: 0;
}

.detail-video-frame {
  border: 0;
  background: #000000;
}

.detail-player-corner-mask {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 10;
  width: 68px;
  height: 68px;
  pointer-events: auto;
  cursor: default;
  background: transparent;
}


.detail-summary {
  display: grid;
  grid-template-columns: minmax(260px, 1fr) minmax(480px, 2fr);
  gap: clamp(3rem, 9vw, 10rem);
  align-items: end;
  margin-top: auto;
  padding-top: 2rem;
  opacity: 0;
  transform: translateY(20px);
  animation: contentEnter 750ms cubic-bezier(0.22, 1, 0.36, 1) 650ms forwards;
}

.detail-summary > p {
  max-width: 460px;
  font-size: 0.95rem;
  color: var(--color-text-primary);
}

.detail-facts {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.5rem;
}

.detail-facts dt {
  margin-bottom: 0.25rem;
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.detail-facts dd {
  font-size: 0.9rem;
  font-weight: 600;
  line-height: 1.45;
}

.detail-facts a,
.detail-video-link {
  color: var(--color-text-primary);
  font: inherit;
  text-decoration: underline;
  text-underline-offset: 4px;
}

/* Right Column (Index Sidebar) */
.right-col {
  display: none;
}

@media (min-width: 1100px) {
  .right-col {
    display: block;
    grid-column: 3;
    position: fixed;
    top: 0;
    right: 0;
    width: 15%;
    height: 100vh;
    padding: 100px 2.5rem 2.5rem 1rem;
    z-index: 20;
    pointer-events: none;
  }
}

.index-sticky-box {
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
  pointer-events: auto;
}

.index-label {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  font-weight: 500;
  margin-bottom: 0.75rem;
}

.index-list {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: 0.5rem;
  margin-bottom: 1rem;
  scrollbar-width: none;
}

.index-list::-webkit-scrollbar {
  display: none;
}

.index-btn {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  position: relative;
  padding: 2px 0 2px 14px;
  margin-left: -14px;
  transition: color var(--transition-fast), transform var(--transition-fast);
}

.index-btn::before {
  content: '';
  position: absolute;
  top: 0.72em;
  left: 0;
  width: 8px;
  height: 1px;
  background-color: currentColor;
  opacity: 0;
  transform: scaleX(0);
  transform-origin: left;
  transition: opacity 220ms ease, transform 320ms cubic-bezier(0.22, 1, 0.36, 1);
}

.index-btn:hover {
  color: var(--color-text-primary);
  transform: translateX(3px);
}

.index-btn.is-active {
  color: var(--color-text-primary);
  font-weight: 700;
}

.index-btn.is-active::before {
  opacity: 1;
  transform: scaleX(1);
}

.whatsapp-meta {
  align-self: flex-end;
  width: 34px;
  height: 34px;
  color: var(--color-text-primary);
}

.whatsapp-meta svg {
  display: block;
  width: 100%;
  height: 100%;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.55;
  stroke-linecap: round;
  stroke-linejoin: round;
}

@media (max-width: 640px) {
  .top-nav {
    height: 60px;
    padding: 0 1rem;
  }

  .nav-brand {
    flex-shrink: 0;
    white-space: nowrap;
    font-size: 0.82rem;
  }

  .nav-right {
    gap: 0;
  }

  .nav-contact-wrap,
  .nav-contact-separator {
    display: none;
  }

  .locale-toggle {
    min-width: 27px;
    margin-left: 0.3rem;
    padding-inline: 4px;
    font-size: 0.61rem;
  }

  .nav-text-btn,
  .nav-comma {
    font-size: 0.78rem;
  }

  .nav-text-btn {
    padding-inline: 2px;
  }

  .nav-comma {
    margin-right: 0.1rem;
  }

  .left-col {
    padding-inline: 1.5rem;
  }

  .nav-left {
    gap: 1.25rem;
  }

  .detail-index-link {
    font-size: 0.78rem;
  }

  .top-nav.is-detail-nav .nav-right .nav-text-btn,
  .top-nav.is-detail-nav .nav-right .nav-comma {
    display: none;
  }

  .detail-intro {
    min-height: calc(100svh - 60px);
    padding: 3.5rem 1.25rem 1.5rem;
  }

  .detail-title {
    width: 100%;
    margin-bottom: 2rem;
    font-size: clamp(2.6rem, 12.5vw, 4.25rem);
    text-align: left;
  }

  .detail-filmstrip {
    display: block;
    width: calc(100% + 2.5rem);
    height: 45svh;
    margin-left: -1.25rem;
  }

  .detail-panel {
    display: none;
    width: 100%;
    height: 100%;
  }

  .detail-panel:nth-child(2) {
    display: block;
  }

  .detail-summary {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    padding-top: 2rem;
  }

  .detail-facts {
    grid-template-columns: 1fr 1fr;
  }

}

@media (prefers-reduced-motion: reduce) {
  .page-transition {
    display: none;
  }

  .scroll-progress {
    display: none;
  }

  .segerman-page,
  .top-nav > *,
  .editorial-title .line,
  .editorial-subtitle,
  .left-footer-meta,
  .project-media-wrapper,
  .media-container,
  .project-card-meta,
  .project-img {
    animation: none !important;
    transition: none !important;
  }

  .detail-title span,
  .detail-panel,
  .detail-panel img,
  .detail-summary {
    animation: none !important;
    transition: none !important;
  }

  .top-nav > *,
  .editorial-title .line,
  .editorial-subtitle,
  .left-footer-meta,
  .project-media-wrapper,
  .project-card-meta {
    opacity: 1;
    transform: none;
    clip-path: none;
  }

  .detail-title span,
  .detail-summary {
    opacity: 1;
    transform: none;
    clip-path: none;
  }

  .detail-panel {
    clip-path: none;
  }

  .detail-panel img {
    transform: none;
  }

  .media-container {
    clip-path: none;
    transform: none;
  }

  .project-img,
  .project-card:hover .project-img {
    transform: scale(1.015);
  }
}
</style>
