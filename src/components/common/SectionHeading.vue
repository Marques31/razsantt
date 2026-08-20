<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  badge?: string
  title: string
  subtitle?: string
  icon?: Component
}>()
</script>

<template>
  <div class="section-header">
    <div v-if="badge" class="section-badge">
      <component :is="icon" v-if="icon" :size="13" />
      <span>{{ badge }}</span>
    </div>
    <h2 class="section-title">{{ title }}</h2>
    <p v-if="subtitle" class="section-subtitle">{{ subtitle }}</p>
  </div>
</template>
