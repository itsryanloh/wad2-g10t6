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

      <!-- Two Column Layout -->
      <div class="row g-4">
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
    id: 'first_pawprint',
    name: 'First Pawprint',
    emoji: '🐱',
    image: null,
    threshold: 1,
    gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
  },
  {
    id: 'tracking_trail',
    name: 'Getting Ready',
    emoji: '🐈',
    image: null,
    threshold: 3,
    gradient: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)'
  },
  {
    id: 'adoption_hero',
    name: 'Adoption Hero',
    emoji: '🐈‍⬛',
    image: null,
    threshold: 4,
    gradient: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)'
  },
  {
    id: 'cat_parent',
    name: 'Cat Parent',
    emoji: '🦁',
    image: null,
    threshold: 5,
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    special: true
  }
]

const earnedBadges = ref([])
const notificationRef = ref(null)

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
  for (const badge of BADGE_CONFIG) {
    if (completedCount.value < badge.threshold && !earnedBadges.value.includes(badge.id)) {
      return {
        ...badge,
        remaining: badge.threshold - completedCount.value
      }
    }
  }
  return null
})

function checkForNewBadges() {
  const newBadges = []
  
  for (const badge of BADGE_CONFIG) {
    if (completedCount.value >= badge.threshold && 
        !earnedBadges.value.includes(badge.id)) {
      earnedBadges.value.push(badge.id)
      newBadges.push(badge)
    }
  }
  
  if (newBadges.length > 0) {
    showBadgeNotifications(newBadges)
  }
}

async function showBadgeNotifications(badges) {
  for (const badge of badges) {
    await notificationRef.value?.show(badge)
    await sleep(500)
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const canvas = ref(null)
const catContainer = ref(null)
let riveInstance = null
let onResize = null

const checklistItems = ref([
  { text: 'Schedule a vet visit within the first week (even if the cat looks healthy).', completed: false },
  { text: 'Prepare a safe space with food, water, litter box, and hiding spots.', completed: false },
  { text: 'Purchase essential supplies: food bowls, litter, scratching post, toys.', completed: false },
  { text: 'Cat-proof your home: secure windows, remove toxic plants, hide cables.', completed: false },
  { text: 'Register with local authorities and get your cat microchipped.', completed: false }
])

const progress = computed(() => {
  const completed = checklistItems.value.filter(i => i.completed).length
  const total = checklistItems.value.length
  return (completed / total) * 100
})

const catPositions = {
  0: -220,
  20: -140,
  40: 10,
  60: 165,
  80: 310,    
  100: 450
}

const catPosition = computed(() => {
  return catPositions[progress.value] || 0
})

onMounted(() => {
  riveInstance = new Rive({
    src: '/cute_cat2.0.riv',
    canvas: canvas.value,
    autoplay: true,
    animations: 'Main',
    onLoad: () => {
      riveInstance.resizeDrawingSurfaceToCanvas()
      riveInstance.play('Main')
    }
  })

  onResize = () => riveInstance?.resizeDrawingSurfaceToCanvas()
  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  if (onResize) window.removeEventListener('resize', onResize)
})

const toggleItem = (index) => {
  checklistItems.value[index].completed = !checklistItems.value[index].completed
  checkForNewBadges()
}
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

/* Cards */
.card {
  background: white;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  border: none;
}

.trophy-card {
  background: linear-gradient(135deg, #FFF5E6, #FFE8D6);
  border: 2px solid #FFD9B3;
}

/* Progress Section */
.progress-section {
  position: relative;
  margin-bottom: 20px;
}

.cat-container {
  position: absolute;
  top: -320px;           
  width: 500px;
  height: 500px;
  z-index: 2;
  transition: left 0.5s ease;
}

.cat-canvas {
  width: 100%;
  height: 100%;
}

.progress-container {
  width: 100%;
  margin-top: 100px;
}

.progress-bar-custom {
  height: 45px;
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
  margin-bottom: 30px;
  font-family: Georgia, serif;
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
  
  .checklist-title {
    font-size: 24px;
  }
}

@media (max-width: 768px) {
  .card-body {
    padding: 20px;
  }
}
</style>