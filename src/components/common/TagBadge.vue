<script setup lang="ts">
defineProps<{
  text: string
  accent?: boolean
  level?: string
}>()
</script>

<template>
  <span :class="['tag-badge', { accent: accent }]">
    {{ text }}
    <span v-if="level" class="tag-level">({{ level }})</span>
  </span>
</template>

<style scoped>
.tag-level {
  opacity: 0.75;
  font-size: 0.7rem;
  margin-left: 2px;
}
</style>
