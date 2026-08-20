<script setup lang="ts">
import type { Experience } from '@/types/resume'
import SectionHeading from '@/components/common/SectionHeading.vue'
import TagBadge from '@/components/common/TagBadge.vue'
import { Briefcase, Calendar, MapPin, ExternalLink, CheckCircle2 } from 'lucide-vue-next'

defineProps<{
  experiences: Experience[]
}>()
</script>

<template>
  <section id="experience" class="section experience-section">
    <div class="container">
      <SectionHeading
        badge="Carreira"
        title="Experiência Profissional"
        subtitle="Histórico de atuação, desafios técnicos superados e entregas de valor em produtos e sistemas."
        :icon="Briefcase"
      />

      <div class="timeline">
        <article
          v-for="exp in experiences"
          :key="exp.id"
          class="timeline-item"
        >
          <!-- Timeline Marker -->
          <div class="timeline-marker">
            <div class="marker-dot" :class="{ current: exp.isCurrent }"></div>
            <div class="marker-line"></div>
          </div>

          <!-- Content Card -->
          <div class="timeline-card card">
            <header class="card-header">
              <div class="role-company-wrapper">
                <h3 class="role-title">{{ exp.role }}</h3>
                <div class="company-row">
                  <a
                    v-if="exp.companyUrl"
                    :href="exp.companyUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="company-link"
                  >
                    <span>{{ exp.company }}</span>
                    <ExternalLink :size="13" />
                  </a>
                  <span v-else class="company-name">{{ exp.company }}</span>
                </div>
              </div>

              <div class="period-location-wrapper">
                <div class="period-badge" :class="{ 'current-badge': exp.isCurrent }">
                  <Calendar :size="13" />
                  <span>{{ exp.period.start }} — {{ exp.period.end }}</span>
                </div>
                <div class="location-badge">
                  <MapPin :size="13" />
                  <span>{{ exp.location }}</span>
                </div>
              </div>
            </header>

            <p class="role-description">{{ exp.description }}</p>

            <!-- Achievements -->
            <div v-if="exp.achievements && exp.achievements.length" class="achievements-list">
              <div
                v-for="(achievement, aIdx) in exp.achievements"
                :key="aIdx"
                class="achievement-item"
              >
                <CheckCircle2 :size="16" class="achievement-icon" />
                <span>{{ achievement }}</span>
              </div>
            </div>

            <!-- Tech Stack -->
            <div v-if="exp.technologies && exp.technologies.length" class="tech-stack-row">
              <TagBadge
                v-for="tech in exp.technologies"
                :key="tech"
                :text="tech"
              />
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.timeline {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.timeline-item {
  display: grid;
  grid-template-columns: 24px 1fr;
  gap: var(--space-4);
  position: relative;
}

@media (min-width: 768px) {
  .timeline-item {
    grid-template-columns: 32px 1fr;
    gap: var(--space-6);
  }
}

.timeline-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.marker-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background-color: var(--color-surface);
  border: 3px solid var(--color-border-highlight);
  margin-top: 24px;
  z-index: 2;
  transition: all var(--transition-fast);
}

.marker-dot.current {
  border-color: var(--color-accent);
  background-color: var(--color-accent);
  box-shadow: 0 0 0 4px var(--color-accent-subtle);
}

.marker-line {
  flex: 1;
  width: 2px;
  background-color: var(--color-border);
  margin-top: 4px;
}

.timeline-item:last-child .marker-line {
  display: none;
}

.timeline-card {
  width: 100%;
}

.card-header {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--color-border-subtle);
}

@media (min-width: 640px) {
  .card-header {
    flex-direction: row;
    align-items: flex-start;
  }
}

.role-title {
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-text-primary);
}

.company-row {
  margin-top: var(--space-1);
}

.company-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-weight: 600;
  font-size: var(--text-sm);
}

.company-name {
  font-weight: 600;
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.period-location-wrapper {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
}

.period-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-xs);
  font-family: var(--font-mono);
  padding: 4px 10px;
  background-color: var(--color-surface-hover);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  color: var(--color-text-secondary);
}

.period-badge.current-badge {
  background-color: var(--color-badge-bg);
  color: var(--color-badge-text);
  border-color: var(--color-badge-border);
}

.location-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.role-description {
  font-size: var(--text-sm);
  line-height: 1.7;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-4);
}

.achievements-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-5);
}

.achievement-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  font-size: var(--text-sm);
  line-height: 1.6;
  color: var(--color-text-secondary);
}

.achievement-icon {
  color: var(--color-accent);
  flex-shrink: 0;
  margin-top: 3px;
}

.tech-stack-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}
</style>
