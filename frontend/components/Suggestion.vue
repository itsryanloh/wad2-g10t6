<template>
  <div class="suggestion-main">
    <i class="fas address-icon" :class="suggestionIcon" />
    {{ title }}
  </div>
  <div class="suggestion-detail">{{ description }}</div>
</template>

<script setup lang="ts">
export type Suggestion = Record<"title" | "description", string>
const { title, description, suggestionIcon } = defineProps<{
  title: string
  description: string
  suggestionIcon: string
}>()
</script>

<style scoped>
.suggestion-main {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: #5D4E37;
  margin-bottom: 5px;
  font-size: 15px;
}

.address-icon {
  color: #FF9800;
  margin-right: 10px;
  font-size: 14px;
}

.suggestion-detail {
  color: #7A7265;
  font-size: 13px;
  padding-left: 24px;
  line-height: 150%;
}
</style>
