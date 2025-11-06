<template>
  <div role="button"
    class="g-5 border border-3 border-warning rounded-4 w-100 h-100 user-select-none community-item d-flex flex-md-column align-items-center p-2"
    style="transition: all 0.3s;" @click="navigateTo({
      name: 'checklist-postId',
      params: { postId: post_id }
    }
    )">
    <p class="m-auto fs-3 fw-medium flex-md-grow-0 flex-grow-1 text-center pe-2 pe-md-0" style="color: #FF9C0C;">
      {{ title }}
    </p>
    <div class="d-flex align-items-center justify-content-center gap-2 status-bar px-2">
      <div class="w-75 justify-content-center d-none d-md-block">
        <div class="rounded-pill" style="height: 10px; background: #FFD9B3;">
          <div class="bg-success rounded-pill" :style="{
            width: `${progress * 100}%`,
            opacity: progress > 0 ? 1 : 0,
            height: '10px'
          }">
          </div>
        </div>
      </div>
      <small class="fs-4 fw-normal" style="color: #449d48;">{{ completed_count }}/{{ CHECKLIST_ITEMS
      }}</small>
    </div>
  </div>
</template>

<script setup lang="ts">
const { completed_count } = defineProps<{ title: string, post_id: string, completed_count: number }>()
const progress = computed(() => completed_count / CHECKLIST_ITEMS)
</script>

<style>
.community-item:hover {
  background: #FFF8F0;
  border-color: #FFCC80;
  transform: translateX(5px);
  box-shadow: 0 4px 12px rgba(255, 152, 0, 0.15);
}

.status-bar {
  width: 100%;
}

@media (max-width: 767px) {
  .status-bar {
    width: auto;
  }
}
</style>
