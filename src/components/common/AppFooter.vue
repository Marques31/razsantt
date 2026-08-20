<script setup lang="ts">
import { ArrowUp, Heart } from 'lucide-vue-next'

defineProps<{
  name: string
}>()

const currentYear = new Date().getFullYear()

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}
</script>

<template>
  <footer class="app-footer">
    <div class="container footer-container">
      <div class="footer-info">
        <p class="footer-copy">
          © {{ currentYear }} <strong>{{ name }}</strong>. Todos os direitos reservados.
        </p>
        <p class="footer-meta">
          Construído com Vue 3, TypeScript, Vite & CSS Puro
        </p>
      </div>

      <button
        type="button"
        class="scroll-top-btn btn-secondary"
        aria-label="Voltar ao início da página"
        title="Voltar ao topo"
        @click="scrollToTop"
      >
        <span>Voltar ao topo</span>
        <ArrowUp :size="16" />
      </button>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  padding-top: var(--space-10);
  padding-bottom: var(--space-10);
  background-color: var(--color-bg-secondary);
  border-top: 1px solid var(--color-border);
  margin-top: var(--space-12);
}

.footer-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  text-align: center;
}

@media (min-width: 640px) {
  .footer-container {
    flex-direction: row;
    text-align: left;
  }
}

.footer-copy {
  font-size: var(--text-sm);
  color: var(--color-text-primary);
}

.footer-meta {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  margin-top: var(--space-1);
}

.scroll-top-btn {
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-xs);
}
</style>
