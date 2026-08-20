<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Profile, Experience, SkillCategory, Education, Certification } from '@/types/resume'
import { X, ExternalLink, Calendar, MapPin, Award, Check } from 'lucide-vue-next'

const props = defineProps<{
  isOpen: boolean
  profile: Profile
  experiences: Experience[]
  skillCategories: SkillCategory[]
  education: Education[]
  certifications?: Certification[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const copied = ref(false)
const { t } = useI18n()

const copyEmail = async () => {
  try {
    await navigator.clipboard.writeText(props.profile.email)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2500)
  } catch {
    // fallback
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isOpen" class="info-overlay" @click.self="emit('close')">
        <div class="info-drawer" role="dialog" aria-modal="true">
          <!-- Header -->
          <div class="drawer-header">
            <h2 class="drawer-title">{{ t('info.title') }}</h2>
            <button
              type="button"
              class="close-btn"
              :aria-label="t('info.close')"
              @click="emit('close')"
            >
              <X :size="20" />
            </button>
          </div>

          <!-- Drawer Content -->
          <div class="drawer-body">
            <!-- Bio Section -->
            <section class="drawer-section">
              <h3 class="section-label">{{ t('info.bio') }}</h3>
              <div class="bio-text">
                <p v-for="(p, i) in profile.bio" :key="i" class="bio-p">
                  {{ p }}
                </p>
              </div>
            </section>

            <!-- Quick Contact Action -->
            <section class="drawer-section">
              <h3 class="section-label">{{ t('info.directContact') }}</h3>
              <div class="contact-box">
                <a :href="'mailto:' + profile.email" class="email-link">
                  {{ profile.email }}
                </a>
                <button
                  type="button"
                  class="copy-pill-btn"
                  @click="copyEmail"
                >
                  <Check v-if="copied" :size="14" />
                  <span>{{ copied ? t('info.copied') : t('info.copy') }}</span>
                </button>
              </div>
            </section>

            <!-- Career Experience Timeline -->
            <section class="drawer-section">
              <h3 class="section-label">{{ t('info.experience') }}</h3>
              <div class="experience-list">
                <article
                  v-for="exp in experiences"
                  :key="exp.id"
                  class="exp-item"
                >
                  <div class="exp-header-row">
                    <h4 class="exp-role">{{ exp.role }}</h4>
                    <span class="exp-period">{{ exp.period.start }} — {{ exp.period.end }}</span>
                  </div>
                  <div class="exp-company-row">
                    <span class="exp-company">{{ exp.company }}</span>
                    <span class="exp-loc">({{ exp.location }})</span>
                  </div>
                  <p class="exp-desc">{{ exp.description }}</p>
                </article>
              </div>
            </section>

            <!-- Skills & Competencies -->
            <section class="drawer-section">
              <h3 class="section-label">{{ t('info.skills') }}</h3>
              <div class="skills-wrapper">
                <div v-for="cat in skillCategories" :key="cat.id" class="skill-cat-block">
                  <h4 class="skill-cat-title">{{ cat.name }}</h4>
                  <div class="skill-pills">
                    <span v-for="s in cat.skills" :key="s.name" class="skill-pill">
                      {{ s.name }}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <!-- Education & Certifications -->
            <section class="drawer-section">
              <h3 class="section-label">{{ t('info.education') }}</h3>
              <div v-for="edu in education" :key="edu.id" class="edu-item">
                <h4 class="edu-degree">{{ edu.degree }}</h4>
                <p class="edu-inst">{{ edu.institution }} • {{ edu.period.start }} — {{ edu.period.end }}</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.info-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  justify-content: flex-end;
}

.info-drawer {
  width: 100%;
  max-width: 580px;
  height: 100%;
  background-color: var(--color-bg);
  color: var(--color-text-primary);
  display: flex;
  flex-direction: column;
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.2);
  overflow-y: auto;
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid var(--color-border-subtle);
  position: sticky;
  top: 0;
  background-color: var(--color-bg);
  z-index: 10;
}

.drawer-title {
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
}

.close-btn:hover {
  color: var(--color-text-primary);
  background-color: var(--color-surface-hover);
}

.drawer-body {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.drawer-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.section-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-family: var(--font-mono);
  color: var(--color-text-muted);
  font-weight: 600;
}

.bio-p {
  font-size: 0.95rem;
  line-height: 1.7;
  color: var(--color-text-secondary);
  margin-bottom: 0.75rem;
}

.bio-p:last-child {
  margin-bottom: 0;
}

.contact-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  background-color: var(--color-surface-hover);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.email-link {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--color-text-primary);
}

.copy-pill-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  font-size: 0.75rem;
  font-family: var(--font-mono);
  border-radius: var(--radius-full);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
  font-weight: 600;
  transition: all var(--transition-fast);
}

.copy-pill-btn:hover {
  border-color: var(--color-text-primary);
}

/* Experience */
.experience-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.exp-item {
  border-bottom: 1px solid var(--color-border-subtle);
  padding-bottom: 1.25rem;
}

.exp-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.exp-header-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
}

.exp-role {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text-primary);
}

.exp-period {
  font-size: 0.75rem;
  font-family: var(--font-mono);
  color: var(--color-text-muted);
}

.exp-company-row {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  margin-top: 2px;
  margin-bottom: 0.5rem;
}

.exp-desc {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  line-height: 1.6;
}

/* Skills */
.skills-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.skill-cat-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 0.5rem;
}

.skill-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.skill-pill {
  font-size: 0.75rem;
  font-family: var(--font-mono);
  padding: 3px 8px;
  border-radius: var(--radius-sm);
  background-color: var(--color-surface-hover);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 300ms ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
