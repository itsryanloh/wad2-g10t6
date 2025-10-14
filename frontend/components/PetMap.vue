<template>
  <div class="map-container">
    <div ref="mapContainer" class="map"></div>
  </div>
</template>

<script setup>
import L from 'leaflet'

const props = defineProps({
  pets: {
    type: Array,
    default: () => []
  }
})

const mapContainer = ref(null)
let map = null
let markers = []

const petIcon = L.divIcon({
  className: 'custom-pet-icon',
  html: `<div class="pet-marker">
    <i class="fas fa-paw"></i>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
})

const initMap = () => {
  if (!mapContainer.value) return

  map = L.map(mapContainer.value).setView([1.3521, 103.8198], 12)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  }).addTo(map)

  setTimeout(() => {
    map.invalidateSize()
  }, 100)
}

const addMarkers = () => {
  if (!map) return

  markers.forEach(marker => marker.remove())
  markers = []

  props.pets.forEach(pet => {
    if (pet.location_lat && pet.location_lng) {
      const marker = L.marker([pet.location_lat, pet.location_lng], {
        icon: petIcon
      }).addTo(map)

      const popupContent = `
        <div class="pet-popup">
          <div class="popup-header">
            <strong>${pet.name}</strong>
            <span class="status-badge status-${pet.status}">${pet.status}</span>
          </div>
          ${pet.image_url ? `<img src="${pet.image_url}" alt="${pet.name}" class="popup-image">` : ''}
          <p class="popup-description">${pet.description}</p>
          <p class="popup-location"><i class="fas fa-map-marker-alt"></i> ${pet.location_name}</p>
          <p class="popup-contact"><i class="fas fa-phone"></i> ${pet.owner_contact}</p>
        </div>
      `

      marker.bindPopup(popupContent, {
        maxWidth: 300
      })

      markers.push(marker)
    }
  })

  if (markers.length > 0) {
    const group = L.featureGroup(markers)
    map.fitBounds(group.getBounds().pad(0.1))
  }
}

onMounted(() => {
  initMap()
  addMarkers()
})

watch(() => props.pets, () => {
  addMarkers()
}, { deep: true })

onBeforeUnmount(() => {
  if (map) {
    map.remove()
    map = null
  }
})
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
  min-height: 500px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.map {
  width: 100%;
  height: 100%;
  min-height: 500px;
}

:deep(.custom-pet-icon) {
  background: transparent;
  border: none;
}

:deep(.pet-marker) {
  width: 32px;
  height: 32px;
  background: #ef4444;
  border: 3px solid white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: transform 0.2s;
}

:deep(.pet-marker:hover) {
  transform: scale(1.1);
}

:deep(.pet-marker i) {
  color: white;
  font-size: 16px;
}

:deep(.pet-popup) {
  font-family: system-ui, -apple-system, sans-serif;
}

:deep(.popup-header) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

:deep(.popup-header strong) {
  font-size: 16px;
  color: #1f2937;
}

:deep(.status-badge) {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

:deep(.status-lost) {
  background: #fee2e2;
  color: #991b1b;
}

:deep(.status-found) {
  background: #dcfce7;
  color: #166534;
}

:deep(.status-adopted) {
  background: #dbeafe;
  color: #1e40af;
}

:deep(.popup-image) {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 8px;
}

:deep(.popup-description) {
  font-size: 14px;
  color: #4b5563;
  margin-bottom: 8px;
  line-height: 1.5;
}

:deep(.popup-location),
:deep(.popup-contact) {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 4px;
}

:deep(.popup-location i),
:deep(.popup-contact i) {
  width: 16px;
  margin-right: 4px;
  color: #9ca3af;
}
</style>
