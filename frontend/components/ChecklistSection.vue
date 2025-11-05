<template>
  <div class="col-md-6 d-flex flex-column">
    <div class="rounded-top-5 text-light p-1" :style>
      <slot />
    </div>
    <div class="bg-white d-flex justify-content-center p-3 rounded-bottom-5 flex-grow-1">
      <div class="row w-100 h-100">
        <div v-if="checklists.length" v-for="checklist in checklists" class="col-lg-6">
          <ChecklistEntry v-bind="checklist" />
        </div>
        <div v-else class="d-flex justify-content-center align-items-center fw-medium" style="color: #FF9C0C;">
          <div class="text-center">
            <i class="fas fa-inbox mb-3" style="font-size: 5vh;" />
            <p class="fs-3">Nothing here :(</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CList } from '~/pages/checklist/index.vue';

defineProps<{
  checklists: CList[]
  style: any
}>()
</script>
