<script setup lang="ts">
import { Printer, Mail, ArrowDown } from 'lucide-vue-next'
import { usePrint } from '@/composables/usePrint'

const { printResume } = usePrint()

const scrollToContact = () => {
  const el = document.getElementById('contact')
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
  }
}

const scrollToProjects = () => {
  const el = document.getElementById('projects')
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
  }
}
</script>

<template>
  <div class="action-buttons-group">
    <button type="button" class="btn btn-primary" @click="scrollToProjects">
      <span>Ver Projetos</span>
      <ArrowDown :size="16" />
    </button>
    <button type="button" class="btn btn-secondary" @click="scrollToContact">
      <Mail :size="16" />
      <span>Contato</span>
    </button>
    <button
      type="button"
      class="btn btn-secondary"
      title="Exportar em PDF ou Imprimir Currículo"
      aria-label="Exportar em PDF ou Imprimir Currículo"
      @click="printResume"
    >
      <Printer :size="16" />
      <span>Imprimir / PDF</span>
    </button>
  </div>
</template>

<style scoped>
.action-buttons-group {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
  margin-top: var(--space-6);
}
</style>
