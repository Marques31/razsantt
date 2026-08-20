<script setup lang="ts">
import { ref } from 'vue'
import type { Profile } from '@/types/resume'
import SectionHeading from '@/components/common/SectionHeading.vue'
import { Mail, MapPin, Send, Check, Copy, ExternalLink, Globe } from 'lucide-vue-next'

const props = defineProps<{
  profile: Profile
}>()

const copied = ref(false)

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
  <section id="contact" class="section contact-section">
    <div class="container">
      <SectionHeading
        badge="Contato"
        title="Vamos Conversar?"
        subtitle="Estou disponível para novas oportunidades, projetos desafiadores e parcerias técnicas."
        :icon="Send"
      />

      <div class="contact-card card">
        <div class="contact-header-block">
          <h3 class="contact-cta-title">Entre em contato direto</h3>
          <p class="contact-cta-desc">
            Sinta-se à vontade para enviar um e-mail ou conectar-se através das redes profissionais abaixo.
          </p>
        </div>

        <div class="contact-channels-grid">
          <!-- Email Box -->
          <div class="channel-box">
            <div class="channel-icon-wrap">
              <Mail :size="20" />
            </div>
            <div class="channel-info">
              <span class="channel-label">E-mail Principal</span>
              <a :href="'mailto:' + profile.email" class="channel-val">
                {{ profile.email }}
              </a>
            </div>
            <button
              type="button"
              class="copy-btn btn-ghost"
              :title="copied ? 'Copiado!' : 'Copiar e-mail'"
              :aria-label="copied ? 'E-mail copiado' : 'Copiar e-mail para área de transferência'"
              @click="copyEmail"
            >
              <Check v-if="copied" :size="16" class="text-success" />
              <Copy v-else :size="16" />
            </button>
          </div>

          <!-- Location Box -->
          <div class="channel-box">
            <div class="channel-icon-wrap">
              <MapPin :size="20" />
            </div>
            <div class="channel-info">
              <span class="channel-label">Localização</span>
              <span class="channel-text">{{ profile.location }}</span>
            </div>
          </div>

          <!-- Website / Portfolio if present -->
          <div v-if="profile.website" class="channel-box">
            <div class="channel-icon-wrap">
              <Globe :size="20" />
            </div>
            <div class="channel-info">
              <span class="channel-label">Website / Portfólio</span>
              <a :href="profile.website" target="_blank" rel="noopener noreferrer" class="channel-val">
                {{ profile.website }}
              </a>
            </div>
          </div>
        </div>

        <!-- Social CTAs -->
        <div class="contact-social-row">
          <a
            v-for="social in profile.socials"
            :key="social.platform"
            :href="social.url"
            target="_blank"
            rel="noopener noreferrer"
            class="social-btn btn btn-secondary"
          >
            <span>{{ social.label }}</span>
            <ExternalLink :size="14" />
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.contact-card {
  padding: var(--space-8);
}

.contact-header-block {
  margin-bottom: var(--space-6);
}

.contact-cta-title {
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-text-primary);
}

.contact-cta-desc {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin-top: var(--space-2);
}

.contact-channels-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);
  margin-bottom: var(--space-8);
}

@media (min-width: 768px) {
  .contact-channels-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.channel-box {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  background-color: var(--color-surface-hover);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.channel-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  background-color: var(--color-accent-subtle);
  color: var(--color-accent);
  flex-shrink: 0;
}

.channel-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.channel-label {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  text-transform: uppercase;
  font-weight: 600;
}

.channel-val {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-accent);
  word-break: break-all;
}

.channel-text {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-primary);
}

.copy-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
}

.copy-btn:hover {
  color: var(--color-accent);
}

.text-success {
  color: var(--color-status-active);
}

.contact-social-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
  padding-top: var(--space-6);
  border-top: 1px solid var(--color-border-subtle);
}

.social-btn {
  font-size: var(--text-xs);
  padding: var(--space-2) var(--space-4);
}
</style>
