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

    <!-- Login Warning Modal -->
    <div v-if="showLoginModal" class="modal-overlay" @click="showLoginModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>🔒 Login Required</h3>
        </div>
        <div class="modal-body">
          <p>Please log in to save your checklist progress!</p>
          <p class="warning-text">Without logging in, your progress will be lost when you close the page.</p>
        </div>
        <div class="modal-footer">
          <button class="btn-login" @click="goToLogin">Log In</button>
          <button class="btn-cancel" @click="continueWithoutSaving">Continue Anyway</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { Rive } from '@rive-app/canvas'
import BadgeDisplay from './badgedisplay.vue'
import BadgeNotification from './badgenotification.vue'

const base_url = import.meta.env.VITE_BASE_URL;

const BADGE_CONFIG = [
  {
    id: 'pawfect_match',
    name: 'Paw-fect Match',
    emoji: '🐱',
    image: '/uniform_cat1.png',
    itemIndex: 0,
    gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
  },
  {
    id: 'healthy_start',
    name: 'Healthy Start',
    emoji: '🦁',
    image: '/uniform_cat2.png',
    itemIndex: 1,
    yOffset: 11,
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    special: true
  },
  {
    id: 'furever_home',
    name: 'Furever Home',
    emoji: '🐈',
    image: '/uniform_cat3.png',
    itemIndex: 2,
    gradient: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)'
  },
  {
    id: 'getting_ready',
    name: 'Getting Ready',
    emoji: '🐈‍⬛',
    image: '/cat4.png',
    itemIndex: 3,
    gradient: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)'
  },
  {
    id: 'best_furiend',
    name: 'Best Furiend',
    emoji: '🦁',
    image: '/cat5.png',
    itemIndex: 4,
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    special: true
  },
  {
    id: 'cat_parent',
    name: 'Cat Parent',
    emoji: '🦁',
    image: '/cat6(1).png',
    itemIndex: 5,
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    special: true
  }
]

const loading = ref(true)
const error = ref('')
const earnedBadges = ref([])
const notificationRef = ref(null)
const showLoginModal = ref(false)
const userDismissedWarning = ref(false)
const windowWidth = ref(0)

const canvas = ref(null)
const catContainer = ref(null)
let riveInstance = null
let onResize = null
const token = useCookie("token")

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

// Base positions
const desktopPositions = {
  0: -175,  // 0 items completed
  1: -40,   // 1 item completed
  2: 160,   // 2 items completed
  3: 350,   // 3 items completed
  4: 550,   // 4 items completed
  5: 740,   // 5 items completed
  6: 930    // All items completed
}

// Scaling factors for different screen sizes
const scalingFactors = {
  lg: 1.0,
  md: 0.55,
  sm: 0.30
}

// Auto-calculate positions for all screen sizes
const catPositionMaps = computed(() => {
  const maps = {}
  
  for (const [breakpoint, factor] of Object.entries(scalingFactors)) {
    maps[breakpoint] = {}
    for (const [index, position] of Object.entries(desktopPositions)) {
      maps[breakpoint][index] = Math.round(position * factor)
    }
  }
  
  return maps
})

const currentBreakpoint = computed(() => {
  const width = windowWidth.value
  if (width < 768) return 'sm'
  if (width < 992) return 'md'
  return 'lg'
})

const catPosition = computed(() => {
  const completed = checklistItems.value.filter(i => i.completed).length
  const breakpoint = currentBreakpoint.value
  const position = catPositionMaps.value[breakpoint][completed] || catPositionMaps.value[breakpoint][0]
  
  // Debug: Log position changes
  console.log(`Cat Position - Breakpoint: ${breakpoint}, Items: ${completed}, Position: ${position}px`)
  
  return position
})

function getAuthHeaders() {
  if (typeof window === 'undefined') {
    return {
      'Content-Type': 'application/json',
      'Authorization': ''
    };
  }

  console.log('Using token:', token.value ? 'Token found' : 'No token');

  return {
    'Content-Type': 'application/json',
    'Authorization': token.value ? `Bearer ${token.value}` : ''
  };
}

async function loadUserData() {
  try {
    const headers = getAuthHeaders();
    
    if (!headers.Authorization) {
      console.log('No user logged in - checklist available but not saved');
      loading.value = false
      return
    }
    
    console.log('Fetching from:', `${base_url}/users/me/checklist`);
    
    const response = await fetch(`${base_url}/users/me/checklist`, {
      headers: headers
    })
    
    console.log('Response status:', response.status);
    
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
    
    const items = await response.json()
    console.log('Loaded items:', items);
    
    // Reset all items to uncompleted
    checklistItems.value.forEach(item => item.completed = false)
    
    // Mark completed items
    if (items && items.length > 0) {
      items.forEach(item => {
        if (item.item_index < checklistItems.value.length) {
          checklistItems.value[item.item_index].completed = true
        }
      })
      
      rebuildBadges()
    }
    
    error.value = ''
    
  } catch (err) {
    console.error('Error loading data:', err)
    error.value = 'Failed to load checklist. Please try again.'
  } finally {
    loading.value = false
  }
}

async function saveChecklistItem(index, completed) {
  const headers = getAuthHeaders();
  
  if (!headers.Authorization) {
    console.log('Not logged in - changes not saved');
    return
  }
  
  try {
    if (completed) {
      console.log(`Adding item ${index}`);
      const response = await fetch(`${base_url}/users/me/checklist/${index}`, {
        method: 'POST',
        headers: headers
      })
      
      if (!response.ok) {
        const errorData = await response.text()
        console.error('Error saving:', errorData)
        throw new Error('Failed to save')
      }
      
      console.log('Item added');
    } else {
      console.log(`Removing item ${index}`);
      const response = await fetch(`${base_url}/users/me/checklist/${index}`, {
        method: 'DELETE',
        headers: headers
      })
      
      if (!response.ok) {
        const errorData = await response.text()
        console.error('Error deleting:', errorData)
        throw new Error('Failed to delete')
      }
      
      console.log('Item removed');
    }
    
  } catch (err) {
    console.error('Error saving:', err)
    error.value = 'Failed to save. Please try again.'
    // Revert the change
    checklistItems.value[index].completed = !completed
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
  const headers = getAuthHeaders();
  
  // Check if user is logged in
  if (!headers.Authorization && !userDismissedWarning.value) {
    showLoginModal.value = true
    return
  }
  
  checklistItems.value[index].completed = !checklistItems.value[index].completed
  await saveChecklistItem(index, checklistItems.value[index].completed)
  checkForNewBadges()
}

function goToLogin() {
  window.location.href = '/login'
}

function continueWithoutSaving() {
  userDismissedWarning.value = true
  showLoginModal.value = false
}

onMounted(async () => {
  if (typeof window === 'undefined') return;

  console.log('Component mounted');
  console.log('Base URL:', base_url);
  
  // Set initial window width
  windowWidth.value = window.innerWidth
  
  // --- Load user data ---
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

    // --- Handle window resize with debounce for performance ---
    let resizeTimeout;
    onResize = () => {
      // Clear previous timeout
      clearTimeout(resizeTimeout);
      
      // Update immediately for cat position (smooth)
      windowWidth.value = window.innerWidth;
      
      // Debounce canvas resize for performance
      resizeTimeout = setTimeout(() => {
        riveInstance?.resizeDrawingSurfaceToCanvas();
      }, 100);
    };
    
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

/* Alert */
.alert {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
}

/* Modal Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: white;
  border-radius: 20px;
  padding: 0;
  max-width: 450px;
  width: 90%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  background: linear-gradient(135deg, #FF8243 0%, #FFA566 100%);
  padding: 25px;
  border-radius: 20px 20px 0 0;
}

.modal-header h3 {
  margin: 0;
  color: white;
  font-size: 24px;
  font-weight: bold;
  text-align: center;
}

.modal-body {
  padding: 30px 25px;
  text-align: center;
}

.modal-body p {
  margin: 0 0 15px 0;
  font-size: 16px;
  color: #333;
}

.modal-body p:last-child {
  margin-bottom: 0;
}

.warning-text {
  color: #FF6B6B;
  font-size: 14px;
  font-weight: 500;
}

.modal-footer {
  display: flex;
  gap: 10px;
  padding: 0 25px 25px 25px;
}

.btn-login,
.btn-cancel {
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-login {
  background: linear-gradient(135deg, #FF8243 0%, #FFA566 100%);
  color: white;
}

.btn-login:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 130, 67, 0.4);
}

.btn-cancel {
  background: #f0f0f0;
  color: #666;
}

.btn-cancel:hover {
  background: #e0e0e0;
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

@media (max-width: 768px) {
  .progress-section {
    margin-bottom: 5px;
  }
}

.cat-container {
  position: absolute;
  top: -255px;
  width: 400px;
  height: 400px;
  z-index: 2;
  transition: left 0.5s ease;
}

/* Tablet (768px - 992px) */
@media (max-width: 991px) {
  .cat-container {
    width: 300px;
    height: 300px;
    top: -200px;
  }
}

/* Mobile (<768px) */
@media (max-width: 767px) {
  .cat-container {
    width: 200px;
    height: 200px;
    top: -150px;
  }
}

.cat-canvas {
  width: 100%;
  height: 100%;
}

.progress-container {
  width: 100%;
  margin-top: 60px;
}

/* Tablet (768px - 992px) */
@media (max-width: 991px) {
  .progress-container {
    margin-top: 45px;
  }
}

/* Mobile (<768px) */
@media (max-width: 767px) {
  .progress-container {
    margin-top: 35px;
  }
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
