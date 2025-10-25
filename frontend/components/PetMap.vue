<template>
  <GoogleMap :api-key="VITE_GMAPS_API_KEY" map-id="DEMO_MAP_ID" :center="{ lat, lng }" :zoom="15" :style="style"
    :class="passedDownClass">
    <AdvancedMarker :options="{ position: { lat, lng } }" />
  </GoogleMap>
</template>

<script setup lang="ts">
import { GoogleMap, AdvancedMarker } from "vue3-google-map"

const { VITE_GMAPS_API_KEY }: Record<string, string> = import.meta.env
const { lat, lng, style, passedDownClass } = defineProps<{
  lat: number
  lng: number
  style?: any
  passedDownClass?: string[]
}>()
</script>
