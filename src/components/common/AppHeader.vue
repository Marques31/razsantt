<script setup lang="ts">
import { ref } from 'vue'
import ThemeToggle from '@/components/common/ThemeToggle.vue'
import { Menu, X, Printer } from 'lucide-vue-next'
import { usePrint } from '@/composables/usePrint'

const props = defineProps<{
  activeSection: string
  navItems: { id: string; label: string }[]
}>()

const emit = defineEmits<{
  (e: 'navigate', id: string): void
}>()

const isMobileMenuOpen = ref(false)
const { printResume } = usePrint()

const handleNav = (id: string) => {
  emit('navigate', id)
  isMobileMenuOpen.value = false
}
</script>

<template>
  <header class="app-header">
    <div class="container header-container">
      <!-- Name / Logo (Segerman Left Brand) -->
      <a href="#hero" class="brand-logo" @click.prevent="handleNav('hero')">
        <span class="brand-name">Seu Nome</span>
      </a>

      <!-- Desktop Navigation -->
      <nav class="desktop-nav" aria-label="Navegação Principal">
        <ul class="nav-list">
          <li v-for="(item, index) in navItems" :key="item.id" class="nav-item-wrapper">
            <button
              type="button"
              :class="['nav-link', { active: activeSection === item.id }]"
              @click="handleNav(item.id)"
            >
              {{ item.label }}
            </button>
            <span v-if="index < navItems.length - 1" class="nav-separator">,</span>
          </li>
        </ul>
      </nav>

      <!-- Header Actions -->
      <div class="header-actions">
        <button
          type="button"
          class="btn-icon header-print-btn"
          title="Imprimir / Salvar em PDF"
          aria-label="Imprimir currículo"
          @click="printResume"
        >
          <Printer :size="16" />
        </button>

        <ThemeToggle />

        <!-- Mobile Menu Trigger -->
        <button
          type="button"
          class="btn-icon mobile-menu-btn"
          :aria-expanded="isMobileMenuOpen"
          aria-label="Abrir menu de navegação"
          @click="isMobileMenuOpen = !isMobileMenuOpen"
        >
          <X v-if="isMobileMenuOpen" :size="18" />
          <Menu v-else :size="18" />
        </button>
      </div>
    </div>

    <!-- Mobile Drawer Navigation -->
    <div v-if="isMobileMenuOpen" class="mobile-drawer">
      <ul class="mobile-nav-list">
        <li v-for="item in navItems" :key="item.id">
          <button
            type="button"
            :class="['mobile-nav-link', { active: activeSection === item.id }]"
            @click="handleNav(item.id)"
          >
            {{ item.label }}
          </button>
        </li>
      </ul>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
  background-color: var(--header-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--color-border-subtle);
  transition: background-color var(--transition-normal), border-color var(--transition-normal);
}

.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 58px;
}

.brand-logo {
  font-weight: 700;
  font-size: var(--text-base);
  color: var(--color-text-primary);
  text-decoration: none;
  letter-spacing: -0.02em;
}

/* Desktop Nav */
.desktop-nav {
  display: none;
}

@media (min-width: 820px) {
  .desktop-nav {
    display: block;
  }
}

.nav-list {
  display: flex;
  align-items: center;
  gap: 2px;
}

.nav-item-wrapper {
  display: flex;
  align-items: center;
}

.nav-separator {
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  margin-right: 4px;
}

.nav-link {
  padding: 4px 6px;
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.nav-link:hover {
  color: var(--color-text-primary);
}

.nav-link.active {
  color: var(--color-text-primary);
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 4px;
}

/* Header Actions */
.header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
}

.btn-icon:hover {
  color: var(--color-text-primary);
}

.header-print-btn {
  display: none;
}

@media (min-width: 640px) {
  .header-print-btn {
    display: flex;
  }
}

.mobile-menu-btn {
  display: flex;
}

@media (min-width: 820px) {
  .mobile-menu-btn {
    display: none;
  }
}

/* Mobile Drawer */
.mobile-drawer {
  padding: var(--space-4);
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
}

@media (min-width: 820px) {
  .mobile-drawer {
    display: none;
  }
}

.mobile-nav-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.mobile-nav-link {
  width: 100%;
  text-align: left;
  padding: var(--space-3);
  font-size: var(--text-base);
  font-weight: 500;
  color: var(--color-text-secondary);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.mobile-nav-link:hover,
.mobile-nav-link.active {
  color: var(--color-text-primary);
  font-weight: 700;
}
</style>
