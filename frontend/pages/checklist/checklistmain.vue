<template>
  <div class="checklist-page">
    <div class="container">
      <!-- Progress Section (Full Width) -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="progress-section">
            <!-- Rive Cat Animation -->
            <div 
              class="cat-container" 
              ref="catContainer"
              :style="{ left: catPosition + 'px' }"
            >
              <canvas ref="canvas" class="cat-canvas"></canvas>
            </div>
            
            <div class="progress-container">
              <div class="progress-bar-custom">
                <div 
                  class="progress-fill" 
                  :style="{ 
                    width: progress + '%',
                    opacity: progress > 0 ? 1 : 0
                  }"
                >
                  {{ Math.round(progress) }}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner">🐾</div>
        <p>Loading your checklist...</p>
      </div>

      <!-- Two Column Layout -->
      <div v-else class="row g-4">
        <!-- Left Column: Checklist -->
        <div class="col-lg-7">
          <div class="card h-100">
            <div class="card-body">
              <h1 class="checklist-title">Adoption Checklist</h1>
              
              <div class="checklist-area">
                <div class="checklist-items">
                  <div 
                    v-for="(item, index) in checklistItems" 
                    :key="index"
                    class="checklist-item"
                    :class="{ completed: item.completed }"
                    @click="toggleItem(index)"
                  >
                    <div class="checkbox" :class="{ checked: item.completed }"></div>
                    <div class="item-text">
                      {{ item.text }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Trophy Case -->
        <div class="col-lg-5">
          <div class="card h-100 trophy-card">
            <h3>Your Adoption Badges</h3>
            <div class="card-body">
              <BadgeDisplay 
                :all-badges="allBadges" 
                :next-badge="nextBadge" 
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Badge Notification -->
    <BadgeNotification ref="notificationRef" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { Rive } from '@rive-app/canvas'
import BadgeDisplay from './badgedisplay.vue'
import BadgeNotification from './badgenotification.vue'

const BADGE_CONFIG = [
  {
    id: 'pawfect_match',
    name: 'Paw-fect Match',
    emoji: '🐱',
    image: null,
    itemIndex: 0,
    gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
  },
  {
    id: 'healthy_start',
    name: 'Healthy Start',
    emoji: '🦁',
    image: null,
    itemIndex: 1,
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    special: true
  },
  {
    id: 'furever_home',
    name: 'Furever Home',
    emoji: '🐈',
    image: null,
    itemIndex: 2,
    gradient: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)'
  },
  {
    id: 'getting_ready',
    name: 'Getting Ready',
    emoji: '🐈‍⬛',
    image: null,
    itemIndex: 3,
    gradient: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)'
  },
  {
    id: 'best_furiend',
    name: 'Best Furiend',
    emoji: '🦁',
    image: null,
    itemIndex: 4,
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    special: true
  },
  {
    id: 'cat_parent',
    name: 'Cat Parent',
    emoji: '🦁',
    image: null,
    itemIndex: 5,
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    special: true
  }
]

const loading = ref(true)
const userId = ref(null)
const earnedBadges = ref([])
const notificationRef = ref(null)

const canvas = ref(null)
const catContainer = ref(null)
let riveInstance = null
let onResize = null

const checklistItems = ref([
  { text: 'Research cat breeds and temperament to match your lifestyle.', completed: false},
  { text: 'Schedule a vet visit within the first week (even if the cat looks healthy).', completed: false },
  { text: 'Prepare a safe space with food, water, litter box, and hiding spots.', completed: false },
  { text: 'Purchase essential supplies: food bowls, litter, scratching post, toys.', completed: false },
  { text: 'Cat-proof your home: secure windows, remove toxic plants, hide cables.', completed: false },
  { text: 'Register with local authorities and get your cat microchipped.', completed: false }
])

const completedCount = computed(() => {
  return checklistItems.value.filter(item => item.completed).length
})

const allBadges = computed(() => {
  return BADGE_CONFIG.map(config => {
    const earned = earnedBadges.value.includes(config.id)
    return {
      ...config,
      earned
    }
  })
})

const nextBadge = computed(() => {
  const totalRemaining = checklistItems.value.filter(item => !item.completed).length
  
  for (const badge of BADGE_CONFIG) {
    if (!checklistItems.value[badge.itemIndex].completed) {
      return {
        ...badge,
        remaining: totalRemaining,
        taskName: checklistItems.value[badge.itemIndex].text
      }
    }
  }
  return null
})

const progress = computed(() => {
  const completed = checklistItems.value.filter(i => i.completed).length
  const total = checklistItems.value.length
  return (completed / total) * 100
})

const catPositions = {
  0: -175,
  1: -40,
  2: 160,
  3: 350,
  4: 550,    
  5: 740,
  6: 930
}

const catPosition = computed(() => {
  const completed = checklistItems.value.filter(i => i.completed).length
  return catPositions[completed] || catPositions[0]
})

function getAuthHeaders() {
  if (typeof window === 'undefined') {
    // SSR: just return empty headers
    return {
      'Content-Type': 'application/json',
      'Authorization': ''
    };
  }

  let token = localStorage.getItem('token');

  if (!token) {
    const match = document.cookie.match(/(?:^|;)\s*token=([^;]*)/);
    if (match) token = decodeURIComponent(match[1]);
  }

  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
}

async function loadUserData() {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.log('No user logged in - using local storage')
      loadFromLocalStorage()
      loading.value = false
      return
    }
    
    const response = await fetch('/api/users/me/checklist', {
      headers: getAuthHeaders()
    })
    
    if (response.status === 401) {
      console.log('Session expired - using local storage')
      localStorage.removeItem('token')
      loadFromLocalStorage()
      loading.value = false
      return
    }
    
    if (!response.ok) {
      throw new Error('Failed to load checklist')
    }
    
    const items = await response.json()
    
    checklistItems.value.forEach(item => item.completed = false)
    
    if (items && items.length > 0) {
      items.forEach(item => {
        if (item.item_index < checklistItems.value.length) {
          checklistItems.value[item.item_index].completed = true
        }
      })
      
      rebuildBadges()
    }
    
    userId.value = true
    
  } catch (error) {
    console.error('Error loading data:', error)
    loadFromLocalStorage()
  } finally {
    loading.value = false
  }
}

async function saveChecklistItem(index, completed) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    saveToLocalStorage()
    return
  }
  
  try {
    if (completed) {
      const response = await fetch(`/api/users/me/checklist/${index}`, {
        method: 'POST',
        headers: getAuthHeaders()
      })
      
      if (!response.ok) throw new Error('Failed to save')
    } else {
      const response = await fetch(`/api/users/me/checklist/${index}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      
      if (!response.ok) throw new Error('Failed to delete')
    }
    
  } catch (error) {
    console.error('Error saving:', error)
    saveToLocalStorage()
  }
}

function rebuildBadges() {
  earnedBadges.value = []
  for (const badge of BADGE_CONFIG) {
    if (checklistItems.value[badge.itemIndex].completed) {
      earnedBadges.value.push(badge.id)
    }
  }
}

// LocalStorage fallback (for users not logged in)
function loadFromLocalStorage() {
  const saved = localStorage.getItem('catChecklist')
  if (saved) {
    try {
      const data = JSON.parse(saved)
      data.forEach((completed, index) => {
        if (index < checklistItems.value.length) {
          checklistItems.value[index].completed = completed
        }
      })
      rebuildBadges()
    } catch (e) {
      console.error('Error loading from localStorage:', e)
    }
  }
}

function saveToLocalStorage() {
  const data = checklistItems.value.map(item => item.completed)
  localStorage.setItem('catChecklist', JSON.stringify(data))
}

function checkForNewBadges() {
  const newBadges = []
  
  for (const badge of BADGE_CONFIG) {
    const itemCompleted = checklistItems.value[badge.itemIndex].completed
    const badgeEarned = earnedBadges.value.includes(badge.id)
    
    if (itemCompleted && !badgeEarned) {
      earnedBadges.value.push(badge.id)
      newBadges.push(badge)
    }
    
    if (!itemCompleted && badgeEarned) {
      const index = earnedBadges.value.indexOf(badge.id)
      if (index > -1) {
        earnedBadges.value.splice(index, 1)
      }
    }
  }
  
  if (newBadges.length > 0) {
    showBadgeNotifications(newBadges)
  }
}

async function showBadgeNotifications(badges) {
  for (const badge of badges) {
    await notificationRef.value?.show(badge)
  }
}

const toggleItem = async (index) => {
  checklistItems.value[index].completed = !checklistItems.value[index].completed
  await saveChecklistItem(index, checklistItems.value[index].completed)
  checkForNewBadges()
}

onMounted(async () => {
  if (typeof window === 'undefined') return;

  // --- Load user data ---
  console.log('Token found:', getAuthHeaders().Authorization);
  await loadUserData();

  // --- Initialize Rive animation ---
  try {
    riveInstance = new Rive({
      src: '/cute_cat2.0.riv',
      canvas: canvas.value,
      autoplay: true,
      animations: 'Main',
      onLoad: () => {
        riveInstance.resizeDrawingSurfaceToCanvas();
        riveInstance.play('Main');
      },
    });

    // --- Handle window resize ---
    onResize = () => riveInstance?.resizeDrawingSurfaceToCanvas();
    window.addEventListener('resize', onResize);
  } catch (err) {
    console.error('Rive initialization failed:', err);
  }
});

onBeforeUnmount(() => {
  if (typeof window !== 'undefined' && onResize) {
    window.removeEventListener('resize', onResize);
  }
});

</script>

<style scoped>
.checklist-page {
  background: linear-gradient(135deg, #FFF5E6 0%, #FFE8D6 50%, #FFF0E0 100%);
  min-height: 100vh;
  padding: 40px 20px;
}

.container {
  max-width: 1400px;
}

/* Loading spinner */
.spinner {
  font-size: 3em;
  animation: bounce 1s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

/* Cards */
.card {
  background: white;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  border: none;
}

.mb-4 .card-body {
  padding: 20px 20px 15px 20px;
}

.trophy-card {
  background: white;
}

.trophy-card h3 {
  text-align: center;
  color: #FF8243;
  font-size: 32px;
  font-weight: bold;
  margin: 0;
  padding-top: 17px;
  padding-bottom: 17px;
  padding-left: 20px;
  padding-right: 20px;
  font-family: Georgia, serif;
  background: white;
  border-radius: 15px 15px 0 0;
  line-height: 1.2;
  position: relative;
}

.trophy-card h3::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 16px;
  right: 17px;
  height: 1.2px;
  background: #FFD9B3;
}

/* Progress Section */
.progress-section {
  position: relative;
  margin-bottom: 10px;
}

.cat-container {
  position: absolute;
  top: -255px;
  width: 400px;
  height: 400px;
  z-index: 2;
  transition: left 0.5s ease;
}

.cat-canvas {
  width: 100%;
  height: 100%;
}

.progress-container {
  width: 100%;
  margin-top: 60px;
}

.progress-bar-custom {
  height: 25px;
  background: #FFD9B3;
  border-radius: 22px;
  overflow: visible;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #FF8243 0%, #FFA566 100%);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 20px;
  color: white;
  font-weight: bold;
  font-size: 18px;
  border-radius: 22px;
  transition: width 0.5s ease, opacity 0.5s ease;
}

/* Checklist Title */
.checklist-title {
  text-align: center;
  color: #FF8243;
  font-size: 32px;
  font-weight: bold;
  margin: 0;
  margin-bottom: 30px;
  font-family: Georgia, serif;
  padding-bottom: 18px;
  padding-left: 20px;
  padding-right: 20px;
  line-height: 1.2;
  position: relative;
}

.checklist-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0px;
  right: 0px;
  height: 1.2px;
  background: #FFD9B3;
}

/* Checklist Area */
.checklist-area {
  background: #FFE8D6;
  padding: 30px;
  border-radius: 10px;
}

.checklist-items {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.checklist-item {
  display: flex;
  align-items: center;
  gap: 15px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.checklist-item:hover {
  transform: translateX(5px);
}

.checkbox {
  width: 30px;
  height: 30px;
  min-width: 30px;
  background: white;
  border: 2px solid #ddd;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.checkbox:hover {
  border-color: #FF8243;
}

.checkbox.checked {
  background: #FF8243;
  border-color: #FF8243;
}

.checkbox.checked::after {
  content: '✓';
  color: white;
  font-size: 18px;
  font-weight: bold;
}

.item-text {
  flex: 1;
  background: #D97539;
  color: white;
  padding: 15px 20px;
  border-radius: 5px;
  font-size: 15px;
  transition: all 0.3s ease;
}

.checklist-item.completed .item-text {
  opacity: 0.7;
  text-decoration: line-through;
}

/* Responsive */
@media (max-width: 991px) {
  .row {
    flex-direction: column;
  }
  
  .col-lg-7,
  .col-lg-5 {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .card-body {
    padding: 20px;
  }
}
</style>