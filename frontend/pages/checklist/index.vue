<template>
  <div class="forum-page">
    <div class="hero-section">
      <div class="container">
        <h1 class="hero-title">
          <i class="fas fa-clipboard-check me-3"></i>Adoption Checklist
        </h1>
        <p class="hero-subtitle">Track your journey to becoming a cat parent</p>
      </div>
      <div class="wave-animation" />
    </div>
    <div class="d-flex justify-content-center">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-5 d-flex flex-column">
        <div class="spinner">🐾</div>
        <p>Loading your checklists...</p>
      </div>

      <div v-else style="width: 90%;">
        <div class="row g-4">
          <ChecklistSection :checklists="checklists.filter(({ completed_count }) => completed_count < CHECKLIST_ITEMS)"
            style="background: linear-gradient(135deg, #FF9800 0%, #FFA726 50%, #FFB74D 100%);">
            <h2 class="text-center fw-semibold fs-1" style="filter: drop-shadow(1px 2px 2px rgba(0, 0, 0, 0.2));">
              <i class="fas fa-bars-progress me-2"></i>In-Progress
            </h2>
          </ChecklistSection>
          <ChecklistSection
            :checklists="checklists.filter(({ completed_count }) => completed_count === CHECKLIST_ITEMS)"
            style="background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);">
            <h2 class="text-center fw-semibold fs-1" style="filter: drop-shadow(1px 2px 2px rgba(0, 0, 0, 0.2));">
              <i class="far fa-circle-check me-2"></i>Completed
            </h2>
          </ChecklistSection>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
export type CList = Record<"post_id" | "title", string> & { completed_count: number }
const loading = ref(true)
const checklists = ref<CList[]>([])
const { VITE_BASE_URL: base_url } = import.meta.env;

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
      { posts: { title: string }, post_id: string, item_index: number }[]
    >))
      .then(arr => arr
        .reduce(
          (accum, { post_id, item_index, posts: { title } }) => {
            const entry = accum.find(({ post_id: id }) => id === post_id)
            if (entry) entry.completed_set.add(item_index)
            else accum.push({ post_id, title, completed_set: new Set([item_index]) })
            return accum
          }, [] as (Omit<CList, "completed_count"> & { completed_set: Set<number> })[]
        )
        .map(({ title, post_id, completed_set }) => ({ title, post_id, completed_count: completed_set.size }))
      )
    loading.value = false
  } catch (err) {
    console.error('Error loading data:', err)
  }
}

onMounted(loadUserData);
</script>

<style scoped>
.forum-page {
  background: #FFE6C2;
  height: 100svh;
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

.spinner {
  font-size: 3em;
  animation: bounce 1s infinite;
}

@keyframes bounce {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-20px);
  }
}
</style>
