<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <h1 class="dashboard-title">Pet Dashboard</h1>
      <p class="dashboard-subtitle">Track lost pets and adoption statistics in real-time</p>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Loading dashboard data...</p>
    </div>

    <div v-else-if="error" class="error-container">
      <i class="fas fa-exclamation-circle"></i>
      <p>{{ error }}</p>
    </div>

    <div v-else>
      <div class="container w-100">
        <div class="row mb-4 g-4">
          <div v-for="({ label, value, iconClass, colorGradient }, idx) in cards" class="col-12 col-md-6 col-lg-4">
            <DashboardCard :label :value :icon-class :color-gradient :key="idx" />
          </div>
        </div>

        <div class="map-section col-12 g-4">
          <div class="map-header">
            <h2 class="map-title">Lost Pets Locations</h2>
            <div class="map-legend">
              <span class="legend-item">
                <span class="legend-marker"></span>
                Lost Pet Location
              </span>
              <span class="legend-count">{{ lostPetsWithLocation.length }} locations</span>
            </div>
          </div>
        </div>

        <div class="pets-section col-12">
          <h2 class="section-title">Recent Activity</h2>
          <div class="pets-grid">
            <div v-for="pet in pets.slice(0, 6)" :key="pet.id" class="pet-card">
              <div class="pet-image-container">
                <img v-if="pet.image_url" :src="pet.image_url" :alt="pet.name" class="pet-image" />
                <div v-else class="pet-image-placeholder">
                  <i class="fas fa-paw"></i>
                </div>
                <span :class="['pet-status', `status-${pet.status}`]">
                  {{ pet.status }}
                </span>
              </div>
              <div class="pet-details">
                <h3 class="pet-name">{{ pet.name }}</h3>
                <p class="pet-breed">{{ pet.breed || pet.species }}</p>
                <p class="pet-description">{{ pet.description.slice(0, 80) }}...</p>
                <div class="pet-meta">
                  <span v-if="pet.location_name" class="pet-location">
                    <i class="fas fa-map-marker-alt"></i>
                    {{ pet.location_name }}
                  </span>
                  <span class="pet-date">
                    <i class="fas fa-clock"></i>
                    {{ formatDate(pet.reported_date) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ComponentInstance } from 'vue'
import DashboardCard from '~/components/DashboardCard.vue'
const { statistics, pets, lostPetsWithLocation, loading, error, fetchPets } = usePetDashboard()

const cards = ref<ComponentInstance<typeof DashboardCard>['$props'][]>([
  {
    label: "Total Pets",
    value: `0`,
    iconClass: "fa-paw",
    colorGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
  },
  {
    label: "Lost Pets",
    value: `0`,
    iconClass: "fa-search",
    colorGradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
  },
  {
    label: "Found Pets",
    value: `0`,
    iconClass: "fa-check-circle",
    colorGradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
  },
  {
    label: "Adopted Pets",
    value: `0`,
    iconClass: "fa-heart",
    colorGradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
  },
  {
    label: "Available for Adoption",
    value: `0`,
    iconClass: "fa-home",
    colorGradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
  },
  {
    label: "Adoption Rate",
    value: `0%`,
    iconClass: "fa-chart-line",
    colorGradient: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)"
  }
])

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.valueOf() - date.valueOf()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return date.toLocaleDateString()
}

onBeforeMount(() => {
  fetchPets()
})
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 32px 24px;
}

.dashboard-header {
  text-align: center;
  margin-bottom: 48px;
}

.dashboard-title {
  font-size: 48px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
  letter-spacing: -0.5px;
}

.dashboard-subtitle {
  font-size: 18px;
  color: #6b7280;
  font-weight: 400;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 24px;
  color: #6b7280;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-container i {
  font-size: 48px;
  color: #ef4444;
  margin-bottom: 16px;
}

.map-section {
  background: white;
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 48px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.map-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.map-title {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
}

.map-legend {
  display: flex;
  align-items: center;
  gap: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #6b7280;
}

.legend-marker {
  width: 16px;
  height: 16px;
  background: #ef4444;
  border: 2px solid white;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.legend-count {
  font-size: 14px;
  color: #9ca3af;
  font-weight: 600;
}

.pets-section {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 24px;
}

.pets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.pet-card {
  background: #f9fafb;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.pet-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.pet-image-container {
  position: relative;
  width: 100%;
  height: 200px;
}

.pet-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pet-image-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.pet-image-placeholder i {
  font-size: 48px;
  color: #9ca3af;
}

.pet-status {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  backdrop-filter: blur(8px);
}

.status-lost {
  background: rgba(239, 68, 68, 0.9);
  color: white;
}

.status-found {
  background: rgba(34, 197, 94, 0.9);
  color: white;
}

.status-adopted {
  background: rgba(59, 130, 246, 0.9);
  color: white;
}

.status-available {
  background: rgba(245, 158, 11, 0.9);
  color: white;
}

.pet-details {
  padding: 20px;
}

.pet-name {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 4px;
}

.pet-breed {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 12px;
}

.pet-description {
  font-size: 14px;
  color: #4b5563;
  line-height: 1.6;
  margin-bottom: 12px;
}

.pet-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pet-location,
.pet-date {
  font-size: 13px;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 6px;
}

.pet-location i,
.pet-date i {
  color: #9ca3af;
  width: 14px;
}

@media (max-width: 768px) {
  .dashboard-title {
    font-size: 36px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .pets-grid {
    grid-template-columns: 1fr;
  }

  .map-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
