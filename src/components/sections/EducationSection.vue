<script setup lang="ts">
import type { Education, Certification } from '@/types/resume'
import SectionHeading from '@/components/common/SectionHeading.vue'
import { GraduationCap, Award, ExternalLink, Calendar, MapPin } from 'lucide-vue-next'

defineProps<{
  education: Education[]
  certifications?: Certification[]
}>()
</script>

<template>
  <section id="education" class="section education-section">
    <div class="container">
      <SectionHeading
        badge="Formação"
        title="Educação & Certificações"
        subtitle="Base acadêmica e certificações que fundamentam as decisões de engenharia."
        :icon="GraduationCap"
      />

      <div class="education-grid">
        <!-- Academic Education -->
        <div class="education-column">
          <h3 class="subsection-title">
            <GraduationCap :size="18" class="title-icon" />
            <span>Formação Acadêmica</span>
          </h3>

          <div class="items-stack">
            <article
              v-for="edu in education"
              :key="edu.id"
              class="education-item card"
            >
              <h4 class="edu-degree">{{ edu.degree }}</h4>
              
              <div class="edu-institution-row">
                <a
                  v-if="edu.institutionUrl"
                  :href="edu.institutionUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="institution-link"
                >
                  <span>{{ edu.institution }}</span>
                  <ExternalLink :size="12" />
                </a>
                <span v-else class="institution-name">{{ edu.institution }}</span>
              </div>

              <div class="edu-meta">
                <span class="meta-badge">
                  <Calendar :size="12" />
                  {{ edu.period.start }} — {{ edu.period.end }}
                </span>
                <span class="meta-badge">
                  <MapPin :size="12" />
                  {{ edu.location }}
                </span>
              </div>

              <p v-if="edu.description" class="edu-desc">{{ edu.description }}</p>
            </article>
          </div>
        </div>

        <!-- Certifications -->
        <div v-if="certifications && certifications.length" class="certifications-column">
          <h3 class="subsection-title">
            <Award :size="18" class="title-icon" />
            <span>Certificações</span>
          </h3>

          <div class="items-stack">
            <article
              v-for="cert in certifications"
              :key="cert.id"
              class="cert-item card"
            >
              <h4 class="cert-title">{{ cert.title }}</h4>
              <p class="cert-issuer">{{ cert.issuer }}</p>

              <div class="cert-meta">
                <span class="meta-badge">
                  <Calendar :size="12" />
                  Emitido em {{ cert.issueDate }}
                </span>
                
                <a
                  v-if="cert.credentialUrl"
                  :href="cert.credentialUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="credential-link"
                >
                  <span>Ver Credencial</span>
                  <ExternalLink :size="12" />
                </a>
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.education-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-8);
}

@media (min-width: 768px) {
  .education-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.subsection-title {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-base);
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: var(--space-4);
}

.title-icon {
  color: var(--color-accent);
}

.items-stack {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.edu-degree, .cert-title {
  font-size: var(--text-base);
  font-weight: 700;
  color: var(--color-text-primary);
}

.edu-institution-row {
  margin-top: var(--space-1);
}

.institution-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-sm);
  font-weight: 600;
}

.institution-name, .cert-issuer {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.edu-meta, .cert-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
  margin-top: var(--space-3);
}

.meta-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-xs);
  font-family: var(--font-mono);
  color: var(--color-text-muted);
}

.edu-desc {
  font-size: var(--text-xs);
  line-height: 1.6;
  color: var(--color-text-secondary);
  margin-top: var(--space-3);
}

.credential-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-accent);
}
</style>
