<script setup lang="ts">
import type { Profile } from '@/types/resume'
import SectionHeading from '@/components/common/SectionHeading.vue'
import { User } from 'lucide-vue-next'

defineProps<{
  profile: Profile
}>()
</script>

<template>
  <section id="about" class="section about-section">
    <div class="container">
      <SectionHeading
        badge="Sobre Mim"
        title="Perfil Profissional"
        subtitle="Visão geral sobre trajetória, filosofia de engenharia e especialidades técnicas."
        :icon="User"
      />

      <div class="about-grid">
        <!-- Bio text -->
        <div class="about-bio card">
          <p v-for="(paragraph, idx) in profile.bio" :key="idx" class="bio-paragraph">
            {{ paragraph }}
          </p>
        </div>

        <!-- Highlights Stats -->
        <div v-if="profile.stats && profile.stats.length" class="about-stats-grid">
          <div v-for="(stat, index) in profile.stats" :key="index" class="stat-card card">
            <span class="stat-value">{{ stat.value }}</span>
            <span class="stat-label">{{ stat.label }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.about-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-6);
}

@media (min-width: 860px) {
  .about-grid {
    grid-template-columns: 1.8fr 1fr;
  }
}

.about-bio {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.bio-paragraph {
  font-size: var(--text-base);
  line-height: 1.8;
  color: var(--color-text-secondary);
}

.about-stats-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);
}

.stat-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: var(--space-5);
  background: var(--color-surface);
}

.stat-value {
  font-size: var(--text-3xl);
  font-weight: 800;
  font-family: var(--font-mono);
  color: var(--color-accent);
  letter-spacing: -0.02em;
}

.stat-label {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: var(--space-1);
}
</style>
