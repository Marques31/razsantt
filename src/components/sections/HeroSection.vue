<script setup lang="ts">
import type { Profile } from '@/types/resume'
import ActionButtons from '@/components/common/ActionButtons.vue'
import { MapPin, Globe, Mail, Linkedin, Film } from 'lucide-vue-next'

defineProps<{
  profile: Profile
}>()
</script>

<template>
  <section id="hero" class="section hero-section">
    <div class="container">
      <div class="hero-content">
        <!-- Status & Badge -->
        <div class="hero-top-row">
          <div class="status-indicator">
            <span class="status-dot"></span>
            <span>{{ profile.availability.text }}</span>
          </div>

          <div class="hero-location">
            <MapPin :size="13" />
            <span>{{ profile.location }}</span>
          </div>
        </div>

        <!-- Big Bold Title (Segerman Grotesque Typography) -->
        <h1 class="hero-display-title">
          <span class="title-line">DIRECTOR</span>
          <span class="title-line title-sub">& EDITOR</span>
        </h1>

        <!-- Headline -->
        <p class="hero-headline">{{ profile.headline }}</p>

        <!-- Action CTAs -->
        <ActionButtons />

        <!-- Social Quick Links -->
        <div class="hero-socials">
          <a
            v-for="social in profile.socials"
            :key="social.platform"
            :href="social.url"
            target="_blank"
            rel="noopener noreferrer"
            class="social-link"
            :aria-label="social.label"
          >
            <span>{{ social.label }}</span>
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-section {
  padding-top: var(--space-12);
  padding-bottom: var(--space-12);
}

@media (min-width: 768px) {
  .hero-section {
    padding-top: var(--space-16);
    padding-bottom: var(--space-16);
  }
}

.hero-content {
  max-width: 900px;
}

.hero-top-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.hero-location {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-xs);
  font-family: var(--font-mono);
  color: var(--color-text-muted);
}

/* Big Bold Grotesque Typography */
.hero-display-title {
  font-size: clamp(2.75rem, 8vw, 5.75rem);
  font-weight: 900;
  line-height: 0.95;
  letter-spacing: -0.04em;
  text-transform: uppercase;
  color: var(--color-text-primary);
  display: flex;
  flex-direction: column;
  margin-bottom: var(--space-6);
}

.title-line {
  display: block;
}

.title-sub {
  color: var(--color-text-primary);
  opacity: 0.92;
}

.hero-headline {
  font-size: var(--text-lg);
  font-weight: 500;
  color: var(--color-text-secondary);
  max-width: 600px;
  line-height: 1.6;
}

.hero-socials {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-5);
  margin-top: var(--space-8);
  padding-top: var(--space-5);
  border-top: 1px solid var(--color-border-subtle);
}

.social-link {
  display: inline-flex;
  align-items: center;
  font-size: var(--text-xs);
  font-family: var(--font-mono);
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  transition: color var(--transition-fast);
}

.social-link:hover {
  color: var(--color-accent);
}
</style>
