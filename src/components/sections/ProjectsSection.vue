<script setup lang="ts">
import type { Project } from '@/types/resume'
import SectionHeading from '@/components/common/SectionHeading.vue'
import TagBadge from '@/components/common/TagBadge.vue'
import { FolderGit2, ExternalLink, Github, Star } from 'lucide-vue-next'

defineProps<{
  projects: Project[]
}>()
</script>

<template>
  <section id="projects" class="section projects-section">
    <div class="container">
      <SectionHeading
        badge="Portfólio"
        title="Projetos & Entregas"
        subtitle="Seleção de aplicações, ferramentas de código aberto e soluções arquiteturais desenvolvidas."
        :icon="FolderGit2"
      />

      <div class="projects-grid">
        <article
          v-for="project in projects"
          :key="project.id"
          class="project-card card"
        >
          <header class="project-header">
            <div class="project-title-row">
              <div class="title-with-star">
                <Star v-if="project.featured" :size="16" class="star-icon" />
                <h3 class="project-title">{{ project.title }}</h3>
              </div>
              <span v-if="project.category" class="category-pill">{{ project.category }}</span>
            </div>
            
            <p class="project-desc">{{ project.description }}</p>
          </header>

          <!-- Key Highlights -->
          <ul v-if="project.highlights && project.highlights.length" class="project-highlights">
            <li v-for="(highlight, hIdx) in project.highlights" :key="hIdx" class="highlight-item">
              <span class="bullet">•</span>
              <span>{{ highlight }}</span>
            </li>
          </ul>

          <!-- Tech stack tags -->
          <div class="project-techs">
            <TagBadge
              v-for="tech in project.technologies"
              :key="tech"
              :text="tech"
            />
          </div>

          <!-- Project Actions / Links -->
          <footer class="project-footer">
            <a
              v-if="project.demoUrl"
              :href="project.demoUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="project-link demo-link"
            >
              <ExternalLink :size="14" />
              <span>Ver Demonstração</span>
            </a>

            <a
              v-if="project.repoUrl"
              :href="project.repoUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="project-link repo-link"
            >
              <Github :size="14" />
              <span>Repositório</span>
            </a>
          </footer>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.projects-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-6);
}

@media (min-width: 768px) {
  .projects-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.project-card {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.project-header {
  margin-bottom: var(--space-3);
}

.project-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
}

.title-with-star {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.star-icon {
  color: #eab308;
  flex-shrink: 0;
}

.project-title {
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--color-text-primary);
}

.category-pill {
  font-size: var(--text-xs);
  font-family: var(--font-mono);
  color: var(--color-text-muted);
  background-color: var(--color-surface-hover);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
}

.project-desc {
  font-size: var(--text-sm);
  line-height: 1.6;
  color: var(--color-text-secondary);
}

.project-highlights {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  margin-top: var(--space-2);
  margin-bottom: var(--space-4);
}

.highlight-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.bullet {
  color: var(--color-accent);
  font-weight: bold;
}

.project-techs {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-top: auto;
  padding-top: var(--space-4);
  margin-bottom: var(--space-4);
}

.project-footer {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding-top: var(--space-3);
  border-top: 1px solid var(--color-border-subtle);
}

.project-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-text-secondary);
  transition: color var(--transition-fast);
}

.project-link:hover {
  color: var(--color-accent);
}

.demo-link {
  color: var(--color-accent);
}
</style>
