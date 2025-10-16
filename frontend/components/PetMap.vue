<template>
  <div class="position-fixed top-50 start-50 translate-middle vw-100 vh-100 popupdiv" @click.self="close">
    <GoogleMap :api-key="VITE_GMAPS_API_KEY" map-id="DEMO_MAP_ID" class="w-50 h-50 m-auto" :center="{ lat, lng }"
      :zoom="15">
      <AdvancedMarker :options="{ position: { lat, lng } }" />
    </GoogleMap>
  </div>
</template>

<script setup lang="ts">
import { GoogleMap, AdvancedMarker } from "vue3-google-map"

const { VITE_GMAPS_API_KEY }: Record<string, string> = import.meta.env
const { lat, lng, close } = defineProps<{ lat: number, lng: number, close: () => unknown }>()
</script>

<style scoped>
.popupdiv {
  z-index: 2000;
  background-color: rgba(0, 0, 0, 0.5);
}
</style>
