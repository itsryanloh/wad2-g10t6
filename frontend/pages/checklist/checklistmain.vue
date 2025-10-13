<template>
  <div class="checklist-page">
    <div class="container">
      <!-- Main Card -->
      <div class="card">
        <!-- Progress Section -->
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
            <div class="progress-bar">
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

        <!-- Checklist Title -->
        <h1 class="checklist-title">Adoption Checklist</h1>

        <!-- Checklist Area -->
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
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { Rive } from '@rive-app/canvas'

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
    animations: 'Main',    // just this one
    onLoad: () => {
      riveInstance.resizeDrawingSurfaceToCanvas()
      riveInstance.play('Main') // ensure it's running
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
}
</script>


<style scoped>
.checklist-page {
  background: linear-gradient(135deg, #FFF5E6 0%, #FFE8D6 50%, #FFF0E0 100%);
  min-height: 100vh;
  padding: 40px 20px;
}

.container {
  max-width: 850px;
  margin: 0 auto;
}

/* Main Card */
.card {
  background: white;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  padding: 40px;
}

/* Progress Section */
.progress-section {
  position: relative;
  margin-bottom: 40px;
}

/* Cat Container with Rive Animation */
.cat-container {
  position: absolute;
  top: -220px;           
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

.progress-bar {
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
}

.checklist-item.completed .item-text {
  opacity: 0.7;
}

/* Responsive */
@media (max-width: 768px) {
  .card {
    padding: 20px;
  }

  .checklist-title {
    font-size: 24px;
  }
}
</style>