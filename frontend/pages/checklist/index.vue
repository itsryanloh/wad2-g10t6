<template>
  <div class="forum-page">
    <div class="hero-section">
      <div class="container">
        <h1 class="hero-title">
          <i class="fas fa-clipboard-check me-3"></i>Adoption Checklists
        </h1>
        <p class="hero-subtitle">Track all your adoption journeys in one place</p>
      </div>
      <div class="wave-animation" />
    </div>

    <div class="main-container">
      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <div class="spinner">🐾</div>
        <p>Loading your checklists...</p>
      </div>

      <div v-else class="content-wrapper">
        <!-- Stats Overview -->
        <div class="stats-overview">
          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #FF9800 0%, #FFB74D 100%);">
              <i class="fas fa-list-check"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ checklists.length }}</div>
              <div class="stat-label">Total Checklists</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #FF9800 0%, #FFA726 100%);">
              <i class="fas fa-bars-progress"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ inProgressChecklists.length }}</div>
              <div class="stat-label">In Progress</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);">
              <i class="fas fa-circle-check"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ completedChecklists.length }}</div>
              <div class="stat-label">Completed</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #2196F3 0%, #64B5F6 100%);">
              <i class="fas fa-chart-line"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ overallProgress }}%</div>
              <div class="stat-label">Overall Progress</div>
            </div>
          </div>
        </div>

        <!-- In Progress Section -->
        <div class="section-card" style="background: linear-gradient(135deg, #FF9800 0%, #FFA726 50%, #FFB74D 100%);">
          <div class="section-header">
            <h2 class="section-title">
              <i class="fas fa-bars-progress me-2"></i>In Progress
            </h2>
          </div>
          <div class="section-body">
            <div v-if="inProgressChecklists.length === 0" class="empty-state">
              <i class="fas fa-inbox"></i>
              <p>No checklists in progress</p>
            </div>
            <div v-else class="checklist-grid">
              <NuxtLink
                v-for="checklist in inProgressChecklists"
                :key="checklist.post_id"
                :to="`/checklist/${checklist.post_id}`"
                class="checklist-card-link"
              >
                <div class="checklist-card">
                  <!-- Progress Circle -->
                  <div class="progress-circle-container">
                    <svg class="progress-ring" width="120" height="120">
                      <defs>
                        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#FF9800;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#FFB74D;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <circle
                        class="progress-ring-circle-bg"
                        cx="60"
                        cy="60"
                        r="50"
                      />
                      <circle
                        class="progress-ring-circle"
                        cx="60"
                        cy="60"
                        r="50"
                        :style="{
                          strokeDashoffset: calculateStrokeDashoffset(checklist.completed_count)
                        }"
                      />
                    </svg>
                    <div class="progress-text">
                      <div class="progress-percentage">
                        {{ Math.round((checklist.completed_count / CHECKLIST_ITEMS) * 100) }}%
                      </div>
                      <div class="progress-label">Complete</div>
                    </div>
                  </div>

                  <!-- Card Content -->
                  <div class="card-content">
                    <h3 class="card-title">{{ checklist.title }}</h3>
                    <div class="card-stats">
                      <div class="stat-item">
                        <i class="fas fa-check-circle"></i>
                        <span>{{ checklist.completed_count }}/{{ CHECKLIST_ITEMS }} tasks</span>
                      </div>
                    </div>
                    <div class="card-footer">
                      <span class="view-link">
                        View Checklist <i class="fas fa-arrow-right"></i>
                      </span>
                    </div>
                  </div>
                </div>
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- Completed Section -->
        <div class="section-card" style="background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);">
          <div class="section-header">
            <h2 class="section-title">
              <i class="far fa-circle-check me-2"></i>Completed
            </h2>
          </div>
          <div class="section-body">
            <div v-if="completedChecklists.length === 0" class="empty-state">
              <i class="fas fa-inbox"></i>
              <p>No completed checklists yet</p>
            </div>
            <div v-else class="checklist-grid">
              <NuxtLink
                v-for="checklist in completedChecklists"
                :key="checklist.post_id"
                :to="`/checklist/${checklist.post_id}`"
                class="checklist-card-link"
              >
                <div class="checklist-card completed">
                  <!-- Progress Circle -->
                  <div class="progress-circle-container">
                    <svg class="progress-ring" width="120" height="120">
                      <defs>
                        <linearGradient id="completedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#4CAF50;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#66BB6A;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <circle
                        class="progress-ring-circle-bg"
                        cx="60"
                        cy="60"
                        r="50"
                      />
                      <circle
                        class="progress-ring-circle completed-circle"
                        cx="60"
                        cy="60"
                        r="50"
                        :style="{
                          strokeDashoffset: 0
                        }"
                      />
                    </svg>
                    <div class="progress-text">
                      <div class="progress-percentage completed-percentage">100%</div>
                      <div class="progress-label">Complete</div>
                    </div>
                  </div>

                  <!-- Card Content -->
                  <div class="card-content">
                    <h3 class="card-title">{{ checklist.title }}</h3>
                    <div class="card-stats">
                      <div class="stat-item">
                        <i class="fas fa-check-circle"></i>
                        <span>{{ CHECKLIST_ITEMS }}/{{ CHECKLIST_ITEMS }} tasks</span>
                      </div>
                    </div>
                    <div class="card-footer">
                      <span class="view-link">
                        View Checklist <i class="fas fa-arrow-right"></i>
                      </span>
                    </div>
                  </div>
                </div>
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="checklists.length === 0" class="empty-state-main">
          <div class="empty-illustration">
            <i class="fas fa-clipboard-list"></i>
          </div>
          <h2>No Checklists Yet</h2>
          <p>Start your adoption journey by viewing a cat profile and creating your first checklist!</p>
          <NuxtLink to="/forum" class="btn-primary">
            <i class="fas fa-paw me-2"></i>
            Browse Available Cats
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
export type CList = Record<"post_id" | "title", string> & { completed_count: number }

const CHECKLIST_ITEMS = 6
const loading = ref(true)
const checklists = ref<CList[]>([])
const { VITE_BASE_URL: base_url } = import.meta.env;

const circumference = 2 * Math.PI * 50 // radius = 50

const inProgressChecklists = computed(() => 
  checklists.value.filter(c => c.completed_count < CHECKLIST_ITEMS)
)

const completedChecklists = computed(() => 
  checklists.value.filter(c => c.completed_count === CHECKLIST_ITEMS)
)

const overallProgress = computed(() => {
  if (checklists.value.length === 0) return 0
  const totalCompleted = checklists.value.reduce((sum, c) => sum + c.completed_count, 0)
  const totalItems = checklists.value.length * CHECKLIST_ITEMS
  return Math.round((totalCompleted / totalItems) * 100)
})

const calculateStrokeDashoffset = (completedCount: number) => {
  const progress = (completedCount / CHECKLIST_ITEMS) * 100
  const offset = circumference - (progress / 100) * circumference
  return offset
}

async function loadUserData() {
  try {
    const response = await fetch(`${base_url}/users/me/checklist`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${useCookie("token").value}`
      }
    })

    if (response.status === 401) {
      console.log('Session expired');
      loading.value = false
      return
    }

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Error response:', errorData)
      throw new Error(`Failed to load checklist: ${response.status}`)
    }

    checklists.value = await (response.json() as (Promise<
      { posts: Post, post_id: string, item_index: number }[]
    >))
      .then(arr => arr
        .reduce(
          (accum, { post_id, item_index, posts: { title, image_urls } }) => {
            const entry = accum.find(({ post_id: id }) => id === post_id)
            if (entry) entry.completed_set.add(item_index)
            else accum.push({
              post_id,
              title,
              image_url: image_urls?.[0] || '/uniform_cat1.png',
              completed_set: new Set([item_index])
            })
            return accum
          }, [] as (Omit<CList, "completed_count"> & { completed_set: Set<number> })[]
        )
        .map(({ title, post_id, image_url, completed_set }) => ({ title, post_id, image_url, completed_count: completed_set.size }))
      )
    loading.value = false
  } catch (err) {
    console.error('Error loading data:', err)
    loading.value = false
  }
}

onMounted(loadUserData);
</script>

<style scoped>
.forum-page {
  background: #FFE6C2;
  min-height: 100vh;
  padding-bottom: 40px;
}

.hero-section {
  box-shadow: unset;
  background: linear-gradient(135deg, #FFB74D 0%, #FFA726 50%, #FF9800 100%);
  padding: 60px 0 100px;
  position: relative;
  overflow: hidden;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
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

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M0,50 Q150,20 300,50 T600,50 T900,50 T1200,50 L1200,120 L0,120 Z' fill='%23FFE6C2' fill-opacity='0.4'/%3E%3C/svg%3E") repeat-x;
  background-size: 1200px 100%;
  animation: wave-flow 20s linear infinite;
}

.wave-animation::after {
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M0,70 Q200,40 400,70 T800,70 T1200,70 L1200,120 L0,120 Z' fill='%23FFE6C2' fill-opacity='0.7'/%3E%3C/svg%3E") repeat-x;
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

.main-container {
  max-width: 1400px;
  margin: -60px auto 0;
  padding: 0 20px;
  position: relative;
  z-index: 10;
}

.loading-container {
  text-align: center;
  padding: 80px 20px;
}

.spinner {
  font-size: 3em;
  animation: bounce 1s infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

.content-wrapper {
  animation: fadeIn 0.6s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Stats Overview */
.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 25px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  width: 70px;
  height: 70px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 800;
  color: #2C3E50;
  line-height: 1;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Section Cards */
.section-card {
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  margin-bottom: 30px;
}

.section-header {
  padding: 15px;
  color: white;
  text-align: center;
}

.section-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  filter: drop-shadow(1px 2px 2px rgba(0, 0, 0, 0.2));
}

.section-body {
  background: white;
  padding: 30px;
  min-height: 200px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.empty-state i {
  font-size: 4rem;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-state p {
  font-size: 1.2rem;
  margin: 0;
}

.checklist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 25px;
}

.checklist-card-link {
  text-decoration: none;
  color: inherit;
}

.checklist-card {
  background: linear-gradient(135deg, #FFFFFF 0%, #F8F9FA 100%);
  border-radius: 16px;
  padding: 25px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  position: relative;
  overflow: hidden;
  height: 100%;
}

.checklist-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #FF9800 0%, #FFB74D 100%);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s ease;
}

.checklist-card.completed::before {
  background: linear-gradient(90deg, #4CAF50 0%, #66BB6A 100%);
}

.checklist-card:hover::before {
  transform: scaleX(1);
}

.checklist-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(255, 152, 0, 0.15);
  border-color: #FFB74D;
}

.checklist-card.completed:hover {
  box-shadow: 0 12px 24px rgba(76, 175, 80, 0.15);
  border-color: #66BB6A;
}

/* Progress Circle */
.progress-circle-container {
  position: relative;
  width: 120px;
  height: 120px;
}

.progress-ring {
  transform: rotate(-90deg);
}

.progress-ring-circle-bg {
  fill: none;
  stroke: #F0F0F0;
  stroke-width: 8;
}

.progress-ring-circle {
  fill: none;
  stroke: url(#progressGradient);
  stroke-width: 8;
  stroke-linecap: round;
  stroke-dasharray: 314.159;
  transition: stroke-dashoffset 0.5s ease;
}

.progress-ring-circle.completed-circle {
  stroke: url(#completedGradient);
}

.checklist-card:hover .progress-ring-circle {
  filter: drop-shadow(0 0 8px rgba(255, 152, 0, 0.6));
}

.checklist-card.completed:hover .progress-ring-circle {
  filter: drop-shadow(0 0 8px rgba(76, 175, 80, 0.6));
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.progress-percentage {
  font-size: 2rem;
  font-weight: 800;
  color: #FF9800;
  line-height: 1;
  margin-bottom: 4px;
}

.progress-percentage.completed-percentage {
  color: #4CAF50;
}

.progress-label {
  font-size: 0.75rem;
  color: #666;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Card Content */
.card-content {
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2C3E50;
  margin: 0;
  line-height: 1.4;
  text-align: center;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 0;
  border-top: 1px solid #E0E0E0;
  border-bottom: 1px solid #E0E0E0;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.95rem;
  color: #555;
  justify-content: center;
}

.stat-item i {
  color: #FF9800;
  font-size: 1rem;
}

.checklist-card.completed .stat-item i {
  color: #4CAF50;
}

.card-footer {
  margin-top: auto;
  display: flex;
  justify-content: center;
}

.view-link {
  color: #FF9800;
  font-weight: 600;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.checklist-card.completed .view-link {
  color: #4CAF50;
}

.checklist-card:hover .view-link {
  gap: 12px;
}

.view-link i {
  transition: transform 0.3s ease;
}

.checklist-card:hover .view-link i {
  transform: translateX(4px);
}

/* Empty State */
.empty-state-main {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.empty-illustration {
  width: 150px;
  height: 150px;
  margin: 0 auto 30px;
  background: linear-gradient(135deg, #FFB74D 0%, #FF9800 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  color: white;
  box-shadow: 0 10px 30px rgba(255, 152, 0, 0.3);
}

.empty-state-main h2 {
  font-size: 2rem;
  color: #2C3E50;
  margin-bottom: 15px;
}

.empty-state-main p {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 30px;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
  color: white;
  padding: 15px 35px;
  border-radius: 50px;
  font-weight: 600;
  font-size: 1.1rem;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 152, 0, 0.4);
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(255, 152, 0, 0.5);
  background: linear-gradient(135deg, #F57C00 0%, #E65100 100%);
}

.me-2 {
  margin-right: 0.5rem;
}

.me-3 {
  margin-right: 1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .main-container {
    margin-top: -40px;
  }

  .stats-overview {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }

  .stat-card {
    flex-direction: column;
    text-align: center;
    padding: 20px;
  }

  .stat-icon {
    width: 60px;
    height: 60px;
    font-size: 1.75rem;
  }

  .stat-value {
    font-size: 2rem;
  }

  .checklist-grid {
    grid-template-columns: 1fr;
  }

  .section-title {
    font-size: 1.5rem;
  }

  .progress-circle-container {
    width: 100px;
    height: 100px;
  }

  .progress-ring {
    width: 100px;
    height: 100px;
  }

  .progress-percentage {
    font-size: 1.75rem;
  }

  .card-title {
    font-size: 1.1rem;
  }

  .empty-illustration {
    width: 120px;
    height: 120px;
    font-size: 3rem;
  }

  .empty-state-main h2 {
    font-size: 1.5rem;
  }

  .empty-state-main p {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .stats-overview {
    grid-template-columns: 1fr;
  }

  .stat-card {
    flex-direction: row;
    text-align: left;
  }
}
</style>
