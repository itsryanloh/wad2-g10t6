<template>
  <div class="forum-page">
    <div class="hero-section">
      <div class="container">
        <h1 class="hero-title">
          <i class="fas fa-bar-chart me-3" />Pet Dashboard
        </h1>
        <p class="hero-subtitle">Track lost pets and adoption statistics in real-time</p>
      </div>
      <div class="wave-animation" />
    </div>
    <div class="flex-grow-1 d-flex mt-2">
      <div class="mx-auto" style="z-index: 100;">
        <div v-if="!communities?.length" class="loading-container">
          <div class="spinner"></div>
          <p>Loading dashboard data...</p>
        </div>

        <div v-else-if="error" class="error-container">
          <i class="fas fa-exclamation-circle"></i>
          <p>{{ error }}</p>
        </div>

        <div v-else>
          <div class="container w-100">
            <div class="d-flex mb-4 gap-2">
              <AutocompleteBar class="flex-grow-1 d-block" placeholder="Select a community" suggestion-icon="fa-cat"
                :key-down="keyDown" :select-idx="selectIdx" v-model="searchBar" />
              <div role="button" title="Get newest data from server" class="ratio ratio-1x1 bg-white m-auto rounded-5"
                style="width: 3rem; height: 3rem;box-shadow: 0 4px 20px rgba(255, 152, 0, 0.3);" @click="refreshData">
                <i class="fas fa-arrows-rotate text-center" style="margin-top: 35%;" />
              </div>
            </div>
            <div class="row mb-4 g-4">
              <div v-for="(data, idx) in cards" class="col-12 col-md-6 col-lg-4">
                <DashboardCard v-bind="data" :key="idx" />
              </div>
            </div>

            <div class="pets-section col-12 mb-4">
              <h2 class="section-title">Recent Activity</h2>

              <!-- Empty State -->
              <div v-if="!selectedCommunity" class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>Select a community to view recent activities</p>
              </div>

              <!-- Activities List -->
              <div v-else-if="posts[selectedCommunity.id]?.length" class="activities-list">
                <div
                  v-for="({ id, post_type, created_at, title, content, users: { name, avatar_url }, view_count, comment_count, reaction_count }, idx) in posts[selectedCommunity.id]"
                  :key="idx" class="activity-card" @click="navigateTo(`/forum/${id}`)">
                  <div class="activity-icon"
                    :style="{ background: cards.find(({ post_type: type }) => type === post_type)!.colorGradient }">
                    <i class="fas" :class="cards.find(({ post_type: type }) => type === post_type)!.iconClass" />
                  </div>

                  <div class="activity-content">
                    <div class="activity-header">
                      <span class="post-type-badge"
                        :style="{ background: cards.find(({ post_type: type }) => type === post_type)!.colorGradient }">
                        {{ post_type }}
                      </span>
                      <span class="activity-time">{{ formatDate(created_at) }}</span>
                    </div>

                    <h3 class="activity-title">{{ title }}</h3>

                    <p class="activity-description">{{ truncateText(content, 100) }}</p>

                    <div class="activity-meta">
                      <span class="meta-item">
                        <img :src="avatar_url" class="rounded-circle ratio ratio-1x1"
                          style="width: 2em; object-fit: cover;" />
                        {{ name || 'Anonymous' }}
                      </span>
                      <span class="meta-item" v-for="{ classname, attribute } in [
                        {
                          classname: 'fa-eye',
                          attribute: view_count || 0
                        },
                        {
                          classname: 'fa-comment',
                          attribute: comment_count || 0
                        },
                        {
                          classname: 'fa-heart',
                          attribute: reaction_count || 0
                        }
                      ]">
                        <i class="fas" :class="classname" />
                        {{ attribute }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- No Activities -->
              <div v-else class="empty-state">
                <i class="fas fa-cat"></i>
                <p>No recent activities in this community</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import DashboardCard from '~/components/DashboardCard.vue'
import type { Suggestion } from '~/components/Suggestion.vue'
import type { post_types } from '~/composables/usePetDashboard'

const { statistics, communities, posts, error, fetchAllData } = await usePetDashboard()

const q: string = useRoute().query.q as string
const init = communities.value?.find(({ id }) => id === q)
const selectedCommunity = ref<Community | undefined>(init)
const searchBar = ref(selectedCommunity.value?.name)

function getStatisticsValue(type: typeof post_types[number] | "total") {
  return `${selectedCommunity.value ? statistics.value[selectedCommunity.value.id]?.[type] ?? 0 : 0}`
}

const cards = computed(() => [
  {
    label: "Total Pets",
    value: getStatisticsValue("total"),
    iconClass: "fa-paw",
    post_type: "total",
    colorGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
  },
  {
    label: "Available for Adoption",
    value: getStatisticsValue("adoption"),
    iconClass: "fa-heart",
    post_type: "adoption",
    colorGradient: "linear-gradient(135deg, #FF9800 0%, #F57C00 100%)"
  },
  {
    label: "Pet Sightings",
    value: getStatisticsValue("sighting"),
    iconClass: "fa-eye",
    post_type: "sighting",
    colorGradient: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)"
  },
  {
    label: "Lost Pets",
    value: getStatisticsValue("lost"),
    iconClass: "fa-exclamation-triangle",
    post_type: "lost",
    colorGradient: "linear-gradient(135deg, #FF6B6B 0%, #EE5A6F 100%)"
  },
  {
    label: "Found Pets",
    value: getStatisticsValue("found"),
    iconClass: "fa-check-circle",
    post_type: "found",
    colorGradient: "linear-gradient(135deg, #A8E6CF 0%, #88D8F7 100%)"
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

const suggestions = ref<Community[]>([])

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
  const comm = suggestions.value[idx]!
  selectedCommunity.value = comm
  useRouter().replace({
    query: {
      q: comm.id
    }
  })
  return (suggestions.value = [comm])[0]!.name
}

const truncateText = (text: string, maxLength: number): string => {
  if (!text) return ''
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text
}

async function refreshData() {
  await fetchAllData()
  suggestions.value = communities.value!
}

onBeforeMount(refreshData)
</script>

<style scoped>
.dashboard-header {
  text-align: center;
  margin-bottom: 48px;
}

.dashboard-title {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 8px;
  letter-spacing: -0.5px;
}

.dashboard-subtitle {
  font-size: 18px;
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

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #6b7280;
}

.empty-state i {
  font-size: 64px;
  color: #d1d5db;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state p {
  font-size: 16px;
  color: #9ca3af;
  margin: 0;
}

.activities-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.activity-card {
  display: flex;
  gap: 20px;
  padding: 24px;
  background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.activity-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  border-color: #d1d5db;
}

.activity-icon {
  width: 56px;
  height: 56px;
  min-width: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.activity-content {
  flex: 1;
  min-width: 0;
}

.activity-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  gap: 12px;
  flex-wrap: wrap;
}

.post-type-badge {
  display: inline-block;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.activity-time {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.activity-title {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
  line-height: 1.4;
}

.activity-description {
  font-size: 15px;
  color: #4b5563;
  line-height: 1.6;
  margin-bottom: 16px;
}

.activity-meta {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.meta-item i {
  color: #9ca3af;
  font-size: 14px;
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

  .activity-card {
    flex-direction: column;
    gap: 16px;
  }

  .activity-icon {
    align-self: flex-start;
  }

  .activity-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .activity-meta {
    gap: 12px;
  }
}

.forum-page {
  background: linear-gradient(135deg, #FFF5E6 0%, #FFE8D6 50%, #FFF0E0 100%);
  height: 100%;
  min-height: fit-content;
  padding-bottom: 0;
}

.hero-section {
  box-shadow: unset;
  background: linear-gradient(135deg, #FFB74D 0%, #FFA726 50%, #FF9800 100%);
  padding: 60px 0 100px;
  position: relative;
  overflow: hidden;
}

.hero-title {
  color: white;
  font-size: 2.5rem;
  font-weight: 800;
  text-align: center;
  margin-bottom: 10px;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.2);
  animation: fadeInDown 1s ease;
  letter-spacing: 1px;
}

.hero-subtitle {
  color: rgba(255, 255, 255, 0.95);
  font-size: 1.1rem;
  text-align: center;
  margin: 0;
  font-weight: 500;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.1);
}

.wave-animation {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100px;
  overflow: hidden;
}

.wave-animation::before,
.wave-animation::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 200%;
  height: 100%;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M0,50 Q150,20 300,50 T600,50 T900,50 T1200,50 L1200,120 L0,120 Z' fill='%23FFF5E6' fill-opacity='0.4'/%3E%3C/svg%3E") repeat-x;
  background-size: 1200px 100%;
  animation: wave-flow 20s linear infinite;
}

.wave-animation::after {
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M0,70 Q200,40 400,70 T800,70 T1200,70 L1200,120 L0,120 Z' fill='%23FFF5E6' fill-opacity='0.7'/%3E%3C/svg%3E") repeat-x;
  background-size: 1200px 100%;
  animation: wave-flow 15s linear infinite reverse;
}

@keyframes wave-flow {
  0% {
    transform: translateX(0);
  }

  100% {
    transform: translateX(-1200px);
  }
}
</style>
