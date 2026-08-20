<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useTheme } from '@/composables/useTheme'

const { theme, toggleTheme } = useTheme()
const { t } = useI18n()
</script>

<template>
  <button
    type="button"
    class="theme-toggle-crescent"
    :aria-label="theme === 'dark' ? t('theme.toLight') : t('theme.toDark')"
    :title="theme === 'dark' ? t('theme.light') : t('theme.dark')"
    @click="toggleTheme"
  >
    <!-- Segerman Style Minimal Crescent Icon -->
    <svg viewBox="0 0 40 40" class="toggle-svg" :class="{ 'is-dark': theme === 'dark' }">
      <defs>
        <mask id="toggle-moon-mask">
          <rect width="40" height="40" fill="#ffffff" />
          <circle cx="26" cy="18" r="14" fill="#000000" class="toggle-mask-circle" />
        </mask>
      </defs>

      <circle
        cx="20"
        cy="20"
        r="15"
        fill="currentColor"
        mask="url(#toggle-moon-mask)"
        class="toggle-crescent-shape"
      />
    </svg>
  </button>
</template>

<style scoped>
.theme-toggle-crescent {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  color: var(--color-text-primary);
  cursor: pointer;
  padding: 0;
  transition: transform var(--transition-fast), color var(--transition-fast);
}

.theme-toggle-crescent:hover {
  transform: scale(1.1);
  color: var(--color-accent);
}

.toggle-svg {
  width: 22px;
  height: 22px;
  display: block;
  transition: transform 400ms cubic-bezier(0.4, 0, 0.2, 1);
}

.toggle-svg.is-dark {
  transform: rotate(180deg);
}

.toggle-crescent-shape {
  transition: fill var(--transition-fast);
}
</style>
