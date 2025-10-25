<template>
  <div class="form-section">
    <label class="section-label">
      <i class="fas fa-map-marker-alt me-2"></i>Location
    </label>
    <div class="position-relative">
      <div class="position-relative">
        <input v-model="model.name" type="text" class="form-input address-input"
          placeholder="e.g., Block 123 Ang Mo Kio Ave 3" @input="findPlace" @focus="showDropdown = true"
          @blur="handleBlur" />
        <i v-if="searchController" class="fas fa-spinner fa-spin search-spinner"></i>
      </div>

      <div v-if="showDropdown && suggestedLocations.length > 0" class="address-dropdown">
        <div v-for="({ SEARCHVAL, ADDRESS }, idx) in suggestedLocations" :key="idx" class="address-dropdown-item"
          @click.prevent="selectLocation(idx)">
          <div class="address-main">
            <i class="fas fa-map-marker-alt address-icon" />
            {{ SEARCHVAL }}
          </div>
          <div class="address-detail">{{ ADDRESS }}</div>
        </div>
      </div>
    </div>
    <small class="form-hint">Where did you spot the cat?</small>
    <PetMap :lat="model.lat" :lng="model.lng" :style="{ height: '50dvh' }" />
  </div>
</template>

<script setup lang="ts">
const model = defineModel<{ name: string } & Record<"lat" | "lng", number>>({ default: { lat: 0, lng: 0, name: '' } })

const { VITE_BASE_URL: base_url } = import.meta.env;

const suggestedLocations = ref<Record<"SEARCHVAL" | "ADDRESS" | "LATITUDE" | "LONGITUDE", string>[]>([])
const showDropdown = ref(false)
const searchController = ref<AbortController | null>(null)

function findPlace() {
  if (!model.value.name.trim()) {
    suggestedLocations.value = []
    showDropdown.value = false
    return
  }

  searchController.value?.abort()

  searchController.value = new AbortController()
  fetch(`${base_url}/maps/search?q=${model.value.name.trim()}`, { signal: searchController.value.signal })
    .then(data => data.json())
    .then(data => {
      suggestedLocations.value = data.results ?? []
      showDropdown.value = suggestedLocations.value.length > 0
      searchController.value = null
    })
    .catch(error => {
      console.error('Error fetching locations:', error)
      suggestedLocations.value = []
    })
}

function selectLocation(location: number) {
  const { SEARCHVAL, ADDRESS, LATITUDE, LONGITUDE } = suggestedLocations.value[location]!
  model.value.name = `${SEARCHVAL}, ${ADDRESS}`
  model.value.lat = Number(LATITUDE)
  model.value.lng = Number(LONGITUDE)
  showDropdown.value = false
}

function handleBlur() {
  setTimeout(() => {
    showDropdown.value = false
  }, 200)
}
</script>

<style scoped>
.form-section {
  margin-bottom: 30px;
}

.section-label {
  display: flex;
  align-items: center;
  font-weight: 700;
  color: #5D4E37;
  margin-bottom: 15px;
  font-size: 1.1rem;
}

.form-input {
  width: 100%;
  padding: 15px 20px;
  border: 2px solid #FFB74D;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s;
  font-family: inherit;
}

.form-hint {
  display: block;
  color: #7A7265;
  font-size: 0.875rem;
  margin-top: 8px;
}

.address-input {
  padding-right: 45px;
}

.search-spinner {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: #FF9800;
  font-size: 18px;
}

.address-dropdown {
  position: absolute;
  top: calc(100% + 5px);
  left: 0;
  right: 0;
  background: white;
  border: 2px solid #FFB74D;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(255, 152, 0, 0.2);
  max-height: 280px;
  overflow-y: auto;
  z-index: 1000;
  animation: dropdownSlide 0.3s ease;
}

@keyframes dropdownSlide {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.address-dropdown-item {
  padding: 15px 20px;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 1px solid #FFF5E6;
}

.address-dropdown-item:last-child {
  border-bottom: none;
}

.address-dropdown-item:hover {
  background: linear-gradient(135deg, #FFF5E6 0%, #FFE8D6 100%);
  padding-left: 25px;
}

.address-main {
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

.address-detail {
  color: #7A7265;
  font-size: 13px;
  padding-left: 24px;
  line-height: 150%;
}

.address-dropdown::-webkit-scrollbar {
  width: 8px;
}

.address-dropdown::-webkit-scrollbar-track {
  background: #FFF5E6;
  border-radius: 0 12px 12px 0;
}

.address-dropdown::-webkit-scrollbar-thumb {
  background: #FFB74D;
  border-radius: 10px;
  transition: all 0.3s;
}

.address-dropdown::-webkit-scrollbar-thumb:hover {
  background: #FF9800;
}
</style>
