<script setup lang="ts">
import type { SkillCategory } from '@/types/resume'
import SectionHeading from '@/components/common/SectionHeading.vue'
import TagBadge from '@/components/common/TagBadge.vue'
import { Cpu } from 'lucide-vue-next'

defineProps<{
  categories: SkillCategory[]
}>()
</script>

<template>
  <section id="skills" class="section skills-section">
    <div class="container">
      <SectionHeading
        badge="Competências"
        title="Stack & Habilidades"
        subtitle="Domínio técnico abrangendo ecossistemas de desenvolvimento de ponta a ponta."
        :icon="Cpu"
      />

      <div class="skills-grid">
        <div
          v-for="cat in categories"
          :key="cat.id"
          class="skill-category-card card"
        >
          <header class="category-header">
            <h3 class="category-title">{{ cat.name }}</h3>
            <p v-if="cat.description" class="category-desc">{{ cat.description }}</p>
          </header>

          <div class="skills-list">
            <TagBadge
              v-for="skill in cat.skills"
              :key="skill.name"
              :text="skill.name"
              :level="skill.level"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.skills-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-6);
}

@media (min-width: 768px) {
  .skills-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.skill-category-card {
  display: flex;
  flex-direction: column;
}

.category-header {
  margin-bottom: var(--space-4);
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--color-border-subtle);
}

.category-title {
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--color-text-primary);
}

.category-desc {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  margin-top: var(--space-1);
}

.skills-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}
</style>
