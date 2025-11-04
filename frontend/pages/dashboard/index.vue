<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <h1 class="dashboard-title">Pet Dashboard</h1>
      <p class="dashboard-subtitle">Track lost pets and adoption statistics in real-time</p>
    </div>

    <div v-if="!communities!.length" class="loading-container">
      <div class="spinner"></div>
      <p>Loading dashboard data...</p>
    </div>

    <div v-else-if="error" class="error-container">
      <i class="fas fa-exclamation-circle"></i>
      <p>{{ error }}</p>
    </div>

    <div v-else>
      <div class="container w-100">
        <div>
          <AutocompleteBar class="mb-4" placeholder="Select a community" suggestion-icon="fa-cat" :key-down="keyDown"
            :select-idx="selectIdx" />
        </div>
        <div class="row mb-4 g-4">
          <div v-for="(data, idx) in cards" class="col-12 col-md-6 col-lg-4">
            <DashboardCard v-bind="data" :key="idx" />
          </div>
        </div>

        <div class="pets-section col-12">
          <h2 class="section-title">Recent Activity</h2>
          <div class="pets-grid">
            <ul class="position-relative">
              <li class="btn btn-secondary" v-if="selectedCommunity" v-for="post in posts[selectedCommunity.id]">
                <span class="post-badge" :style="{ background: categoryColor[post.post_type]! }">
                  {{ post.post_type }}
                </span>
                <p class="d-inline-block">{{ post.title }}</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ComponentInstance } from 'vue'
import DashboardCard from '~/components/DashboardCard.vue'
import type { Suggestion } from '~/components/Suggestion.vue'

const { statistics, communities, posts, error, fetchAllData } = await usePetDashboard()

const cards = ref<ComponentInstance<typeof DashboardCard>['$props'][]>([
  {
    label: "Total Pets",
    value: `0`,
    iconClass: "fa-paw",
    colorGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
  },
  {
    label: "Available for Adoption",
    value: `0`,
    iconClass: "fa-heart",
    colorGradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
  },
  {
    label: "Pet Sightings",
    value: `0`,
    iconClass: "fa-eye",
    colorGradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
  },
  {
    label: "Lost Pets",
    value: `0`,
    iconClass: "fa-exclamation-triangle",
    colorGradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
  },
  {
    label: "Found Pets",
    value: `0`,
    iconClass: "fa-check-circle",
    colorGradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
  }
])

const categoryColor = ref<Record<string, string>>(
  {
    adoption: "linear-gradient(135deg, #FF9800 0%, #F57C00 100%)",
    sighting: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
    lost: "linear-gradient(135deg, #FF6B6B 0%, #EE5A6F 100%)",
    found: "linear-gradient(135deg, #A8E6CF 0%, #88D8F7 100%)",
  }
)

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

const suggestions = ref<Community[]>([])
const selectedCommunity = ref<Community | null>({
  "id": "b6d413f6-4114-444a-bccf-c7ef6a3eae0b",
  "name": "Ang Mo Kio Cats",
  "description": "AMK cat sightings, adoptions, and TNR"
})

async function keyDown(searchString: string, _: any): Promise<Suggestion[]> {
  const lowercaseSearch = searchString.toLowerCase()
  return (
    suggestions.value = communities.value!
      .filter(({ name, description }) =>
        name.toLowerCase().includes(lowercaseSearch)
        || description.toLowerCase().includes(lowercaseSearch))
  )
    .map(({ name: title, description }) => ({ title, description }))
}

function selectIdx(idx: number): string {
  selectedCommunity.value = suggestions.value[idx]!
  return (suggestions.value = [selectedCommunity.value])[0]!.name
}

onBeforeMount(async () => {
  await fetchAllData()
  suggestions.value = communities.value!

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
