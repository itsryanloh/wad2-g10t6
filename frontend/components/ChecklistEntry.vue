<template>
  <div role="button"
    class="g-5 border border-3 border-warning rounded-4 w-100 user-select-none hover-effect d-flex flex-md-column align-items-center p-2"
    style="transition: all 0.3s;" @click="navigateTo({
      name: 'checklist-postId',
      params: { postId: post_id }
    }
    )">
    <div class="my-auto text-center w-100 d-flex gap-3 align-items-center">
      <img :src="image_url"
        :style="Object.fromEntries(['minWidth', 'minHeight', 'maxWidth', 'maxHeight'].map(k => [k, image_size]))" />
      <p class="fs-3 fw-medium m-0 flex-grow-1" style="color: #FF9C0C;">
        {{ title }}
      </p>
    </div>
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
      <small class="fs-4 fw-normal" style="color: #449d48;">
        {{ completed_count }}/{{ CHECKLIST_ITEMS }}
      </small>
    </div>
  </div>
</template>

<script setup lang="ts">
const { completed_count } = defineProps<{ title: string, post_id: string, completed_count: number, image_url: string }>()
const progress = computed(() => completed_count / CHECKLIST_ITEMS)
const image_size = "2.5rem"
</script>

<style>
.hover-effect:hover {
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
