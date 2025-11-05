<template>
  <div role="button"
    class="g-5 border border-3 border-warning rounded-4 w-100 text-center user-select-none community-item"
    style="transition: all 0.3s;" @click="navigateTo(`/checklist/${post_id}`)">
    <p class="m-auto fs-3 fw-medium" style="color: #FF9C0C;">
      {{ title }}
    </p>
    <small class="fs-4 fw-normal" style="color: #449d48;">{{ completed_count.size }}/{{ CHECKLIST_ITEMS }}</small>
  </div>
</template>

<script setup lang="ts">
defineProps<{ title: string, post_id: string, completed_count: Set<number> }>()
</script>

<style>
.community-item:hover {
  background: #FFF8F0;
  border-color: #FFCC80;
  transform: translateX(5px);
  box-shadow: 0 4px 12px rgba(255, 152, 0, 0.15);
}
</style>
