<template>
  <div class="checklist-page">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="container">
        <h1 class="hero-title">
          <i class="fas fa-clipboard-check me-3"></i>Adoption Checklist
        </h1>
        <p class="hero-subtitle">Track your journey to becoming a cat parent</p>
      </div>
      <div class="wave-decoration"></div>
    </div>

    <div class="container content-container">
      <!-- Progress Section -->
      <div class="card mb-4 progress-card">
        <div class="progress-card-header">
          <div class="header-left">
            <i class="fas fa-paw me-2"></i>
            Current Adoption Paw-gress
          </div>
          <div class="adoption-counter">
            <i class="fas fa-heart me-1"></i>
            {{ totalAdoptedCats }} {{ totalAdoptedCats === 1 ? 'cat' : 'cats' }} adopted
          </div>
        </div>
        <div class="card-body">
          <!-- Cat Info Section -->
          <div v-if="catPostData.title" class="cat-info-section">
            <img :src="catPostData.image" alt="Cat" class="cat-thumbnail-progress">
            <div class="cat-details-progress">
              <h3 class="cat-title-progress">{{ catPostData.title }}</h3>
              <p class="cat-location-progress">
                <i class="fas fa-map-marker-alt"></i>
                {{ catPostData.location }}
              </p>
            </div>
          </div>

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
          <div class="card h-100 checklist-card">
            <div class="card-header-orange">
              <div class="header-left">
                <i class="fas fa-clipboard-check me-2"></i>
                Adoption Checklist
              </div>
            </div>
            <div class="card-body">
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

                <!-- Finish Adoption Button -->
                <div v-if="isChecklistComplete" class="finish-adoption-section">
                  <button 
                    class="finish-adoption-btn" 
                    @click="handleFinishAdoption"
                    :disabled="finishingAdoption"
                  >
                    <i class="fas fa-heart me-2"></i>
                    {{ finishingAdoption ? 'Processing...' : 'Finish Adoption' }}
                    <i class="fas fa-arrow-right ms-2"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Trophy Case -->
        <div class="col-lg-5">
          <div class="card h-100 trophy-card">
            <div class="card-header-orange">
              <i class="fas fa-trophy me-2"></i>
              Your Adoption Badges
            </div>
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

    <!-- Congratulations Modal -->
    <div v-if="showCongratulationsModal" class="modal-overlay congratulations-overlay">
      <div class="congratulations-modal" @click.stop>
        <!-- Confetti Animation -->
        <div class="confetti-container">
          <div v-for="i in 50" :key="i" class="confetti" :style="getConfettiStyle(i)"></div>
        </div>

        <!-- Modal Content -->
        <div class="congrats-content">
          <div class="congrats-icon">
            <i class="fas fa-trophy"></i>
          </div>
          
          <h2 class="congrats-title">Congratulations! 🎉</h2>
          
          <p class="congrats-message">
            You've successfully completed the adoption checklist and welcomed your new furry friend into your home!
          </p>
          
          <div class="congrats-highlight">
            <i class="fas fa-paw me-2"></i>
            <span>This is your <strong>{{ totalAdoptedCats }}{{ getOrdinalSuffix(totalAdoptedCats) }}</strong> successful adoption! You've contributed to reducing the stray cat population and given loving homes to cats in need.</span>
          </div>
          
          <p class="congrats-submessage">
            Your kindness and dedication make the world a better place for our feline friends. Thank you for choosing adoption!
          </p>

          <button class="congrats-close-btn" @click="closeCongratulationsModal">
            <i class="fas fa-home me-2"></i>
            Return to Forum
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
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
const showCongratulationsModal = ref(false)
const finishingAdoption = ref(false)
const totalAdoptedCats = ref(0) // load from API

const canvas = ref(null)
const catContainer = ref(null)
let riveInstance = null
let onResize = null
const token = useCookie("token")

const route = useRoute()
const catPostData = ref({
  title: '',
  location: '',
  image: ''
})

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

const isChecklistComplete = computed(() => {
  return checklistItems.value.every(item => item.completed)
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
      // Load mock adoption count even without login
      totalAdoptedCats.value = 3 // Mock: user has adopted 3 cats before
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
      // Load mock adoption count
      totalAdoptedCats.value = 3
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
    
    // Fetch actual adoption count from API
    // const countResponse = await fetch(`${base_url}/users/me/adoptions/count`, { headers })
    // const countData = await countResponse.json()
    // totalAdoptedCats.value = countData.count
    
    // Mock data
    totalAdoptedCats.value = 3
    
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

const handleFinishAdoption = async () => {
  finishingAdoption.value = true
  
  try {
    // TODO: Replace with actual API calls when backend is ready
    // const postId = route.params.postId // Get from route
    // await fetch(`${base_url}/posts/${postId}/mark-adopted`, {
    //   method: 'POST',
    //   headers: getAuthHeaders()
    // })
    // await fetch(`${base_url}/users/me/adoptions/increment`, {
    //   method: 'POST',
    //   headers: getAuthHeaders()
    // })
    
    // Mock: Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Update adoption count
    totalAdoptedCats.value++
    
    // Show congratulations
    showCongratulationsModal.value = true
    
    // Reset checklist for next adoption (after modal closes)
    // This would normally be done after navigating away
    
  } catch (error) {
    console.error('Error finishing adoption:', error)
    alert('Failed to complete adoption. Please try again.')
  } finally {
    finishingAdoption.value = false
  }
}

const closeCongratulationsModal = () => {
  showCongratulationsModal.value = false
  
  // Reset checklist for demo purposes
  checklistItems.value.forEach(item => item.completed = false)
  earnedBadges.value = []
  
  // TODO: Navigate back to forum or post page
  // navigateTo('/forum/main')
  
  // Mock: For demo, just log
  console.log('Returning to forum...')
}

const getConfettiStyle = (index) => {
  return {
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 3}s`,
    backgroundColor: ['#FFB74D', '#FF9800', '#F57C00', '#E91E63', '#9C27B0', '#2196F3'][Math.floor(Math.random() * 6)]
  }
}

const getOrdinalSuffix = (num) => {
  const j = num % 10
  const k = num % 100
  if (j === 1 && k !== 11) return 'st'
  if (j === 2 && k !== 12) return 'nd'
  if (j === 3 && k !== 13) return 'rd'
  return 'th'
}

onMounted(async () => {
  if (typeof window === 'undefined') return;

  console.log('Component mounted');
  console.log('Base URL:', base_url);
  
  // Set initial window width
  windowWidth.value = window.innerWidth
  
  // --- Load cat post data from route query or use mock data for testing ---
  catPostData.value = {
    title: route.query.title || 'Friendly Orange Tabby Looking for Home',
    location: route.query.location || 'Block 123 Ang Mo Kio Ave 3',
    image: route.query.image || '/uniform_cat1.png'
  }
  
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
  padding-bottom: 40px;
}

/* Hero Section - Matches Forum Style */
.hero-section {
  background: linear-gradient(135deg, #FFB74D 0%, #FFA726 50%, #FF9800 100%);
  padding: 40px 0 70px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(255, 183, 77, 0.3);
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

/* Wave Decoration */
.wave-decoration {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 80px;
  overflow: hidden;
}

.wave-decoration::before,
.wave-decoration::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 200%;
  height: 100%;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRas='none'%3E%3Cpath d='M0,50 Q150,20 300,50 T600,50 T900,50 T1200,50 L1200,120 L0,120 Z' fill='%23FFF5E6' fill-opacity='0.4'/%3E%3C/svg%3E") repeat-x;
  background-size: 1200px 100%;
  animation: wave-flow 20s linear infinite;
}

.wave-decoration::after {
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M0,70 Q200,40 400,70 T800,70 T1200,70 L1200,120 L0,120 Z' fill='%23FFF5E6' fill-opacity='0.7'/%3E%3C/svg%3E") repeat-x;
  background-size: 1200px 100%;
  animation: wave-flow 15s linear infinite reverse;
}

@keyframes wave-flow {
  0% { transform: translateX(0); }
  100% { transform: translateX(-1200px); }
}

/* Container */
.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

.content-container {
  margin-top: -40px;
  position: relative;
  z-index: 10;
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

/* Congratulations Modal */
.congratulations-overlay {
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
}

.congratulations-modal {
  position: relative;
  background: white;
  border-radius: 30px;
  padding: 0;
  max-width: 600px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  animation: modalZoomIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  overflow: hidden;
}

@keyframes modalZoomIn {
  from {
    opacity: 0;
    transform: scale(0.5) rotate(-5deg);
  }
  to {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

.confetti-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

.confetti {
  position: absolute;
  width: 10px;
  height: 10px;
  top: -10px;
  opacity: 0;
  animation: confettiFall 3s ease-in-out infinite;
}

@keyframes confettiFall {
  0% {
    top: -10px;
    opacity: 1;
    transform: rotate(0deg);
  }
  100% {
    top: 100%;
    opacity: 0;
    transform: rotate(720deg);
  }
}

.congrats-content {
  padding: 50px 40px;
  text-align: center;
  position: relative;
  z-index: 1;
}

.congrats-icon {
  width: 120px;
  height: 120px;
  margin: 0 auto 30px;
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 40px rgba(255, 215, 0, 0.4);
  animation: iconBounce 0.8s ease 0.3s;
}

@keyframes iconBounce {
  0%, 100% { transform: scale(1); }
  25% { transform: scale(1.2); }
  50% { transform: scale(0.9); }
  75% { transform: scale(1.1); }
}

.congrats-icon i {
  font-size: 4rem;
  color: white;
  animation: iconSpin 2s ease-in-out infinite;
}

@keyframes iconSpin {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(20deg); }
}

.congrats-title {
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 20px;
  animation: titlePulse 2s ease-in-out infinite;
}

@keyframes titlePulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.congrats-message {
  font-size: 1.2rem;
  color: #5D4E37;
  line-height: 1.6;
  margin-bottom: 25px;
}

.congrats-highlight {
  background: linear-gradient(135deg, #FFF4E6 0%, #FFE8D6 100%);
  border-left: 5px solid #4CAF50;
  padding: 20px;
  border-radius: 15px;
  margin: 25px 0;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1rem;
  color: #4CAF50;
  font-weight: 600;
  text-align: left;
}

.congrats-highlight i {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.congrats-submessage {
  font-size: 1rem;
  color: #7A7265;
  line-height: 1.6;
  margin-bottom: 30px;
}

.congrats-close-btn {
  background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
  color: white;
  border: none;
  padding: 18px 45px;
  border-radius: 50px;
  font-weight: 700;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 10px 30px rgba(255, 152, 0, 0.4);
  display: inline-flex;
  align-items: center;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.congrats-close-btn:hover {
  transform: translateY(-5px) scale(1.05);
  box-shadow: 0 15px 40px rgba(255, 152, 0, 0.6);
  background: linear-gradient(135deg, #F57C00 0%, #E65100 100%);
}

.congrats-close-btn i {
  transition: transform 0.3s;
}

.congrats-close-btn:hover i {
  transform: scale(1.2);
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

/* Cat Info in Progress Card */
.cat-info-section {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: linear-gradient(135deg, #FFF8F0 0%, #FFE8D6 100%);
  border-radius: 12px;
  margin-bottom: 20px;
  border-left: 5px solid #FF9800;
  box-shadow: 0 2px 8px rgba(255, 152, 0, 0.1);
}

.cat-thumbnail-progress {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 12px;
  border: 3px solid #FFB74D;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.cat-details-progress {
  flex: 1;
  min-width: 0;
}

.cat-title-progress {
  font-size: 1.15rem;
  font-weight: 700;
  color: #5D4E37;
  margin: 0 0 6px 0;
  line-height: 1.3;
}

.cat-location-progress {
  color: #FF6B6B;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.95rem;
}

.cat-location-progress i {
  font-size: 0.9rem;
}

/* Cards */
.card {
  background: white;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  border: none;
  animation: cardFadeIn 0.6s ease;
  overflow: hidden;
}

/* Orange Header for Cards */
.card-header-orange {
  background: linear-gradient(135deg, #FFB74D 0%, #FFA726 100%);
  color: white;
  padding: 18px 20px;
  font-weight: 700;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 5px rgba(255, 152, 0, 0.2);
  flex-wrap: wrap;
  gap: 10px;
}

.card-header-orange i {
  font-size: 1.1rem;
}

.header-left {
  display: flex;
  align-items: center;
}

.cat-name-badge {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.25);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.95rem;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(10px);
}

.cat-name-badge i {
  font-size: 1rem;
}

.checklist-card .card-body,
.trophy-card .card-body {
  background: white;
  padding: 25px;
}

.progress-card .card-body {
  padding: 20px 20px 15px 20px;
}

/* Progress Card with Orange Header */
.progress-card {
  overflow: hidden;
}

.progress-card-header {
  background: linear-gradient(135deg, #FFB74D 0%, #FFA726 100%);
  color: white;
  padding: 18px 20px;
  font-weight: 700;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 5px rgba(255, 152, 0, 0.2);
  flex-wrap: wrap;
  gap: 10px;
}

.progress-card-header i {
  font-size: 1rem;
}

.adoption-counter {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.95rem;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.3);
  animation: fadeIn 0.6s ease;
  background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
  color: white;
}

.adoption-counter i {
  color: #f21010;
  animation: heartBeat 1.5s ease-in-out infinite;
}

.progress-card .card-body {
  background: white;
}

@keyframes cardFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.mb-4 {
  margin-bottom: 1.5rem;
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
  top: -200px;
  width: 400px;
  height: 400px;
  z-index: 2;
  transition: left 0.5s ease;
}

@media (max-width: 991px) {
  .cat-container {
    width: 300px;
    height: 300px;
    top: -150px;
  }
}

@media (max-width: 767px) {
  .cat-container {
    width: 200px;
    height: 200px;
    top: -100px;
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

@media (max-width: 991px) {
  .progress-container {
    margin-top: 45px;
  }
}

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
  justify-content: center;
  padding: 0 20px;
  color: white;
  font-weight: bold;
  font-size: 18px;
  border-radius: 22px;
  transition: width 0.5s ease, opacity 0.5s ease;
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
  background: #FFF8F0;
  border-left: 5px solid #2196F3;
  color: #5D4E37;
  padding: 15px 20px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.checklist-item:nth-child(1) .item-text {
  border-left-color: #2196F3;
}

.checklist-item:nth-child(2) .item-text {
  border-left-color: #E91E63;
}

.checklist-item:nth-child(3) .item-text {
  border-left-color: #FBC02D;
}

.checklist-item:nth-child(4) .item-text {
  border-left-color: #9C27B0;
}

.checklist-item:nth-child(5) .item-text {
  border-left-color: #009688;
}

.checklist-item:nth-child(6) .item-text {
  border-left-color: #FF9800;
}

.checklist-item.completed .item-text {
  opacity: 0.7;
  text-decoration: line-through;
  background: #F1F8E9;
  border-left-color: #4CAF50;
}

.checklist-item:hover .item-text {
  transform: translateX(5px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
}

/* Finish Adoption Section */
.finish-adoption-section {
  margin-top: 30px;
  text-align: center;
  animation: slideIn 0.6s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.finish-adoption-btn {
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: white;
  border: none;
  padding: 18px 40px;
  border-radius: 50px;
  font-weight: 700;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.4s ease;
  box-shadow: 0 10px 30px rgba(76, 175, 80, 0.4);
  display: inline-flex;
  align-items: center;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.finish-adoption-btn:hover:not(:disabled) {
  transform: translateY(-5px) scale(1.05);
  box-shadow: 0 15px 40px rgba(76, 175, 80, 0.6);
  background: linear-gradient(135deg, #45a049 0%, #388e3c 100%);
}

.finish-adoption-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.finish-adoption-btn i:first-child {
  animation: heartBeat 1.5s ease-in-out infinite;
}

.finish-adoption-btn i:last-child {
  transition: transform 0.3s;
}

.finish-adoption-btn:hover:not(:disabled) i:last-child {
  transform: translateX(5px);
}

@keyframes heartBeat {
  0%, 100% { transform: scale(1); }
  25% { transform: scale(1.2); }
  50% { transform: scale(1); }
  75% { transform: scale(1.2); }
}

/* Responsive */
.row { 
  display: flex; 
  flex-wrap: wrap; 
  margin: -12px; 
}

.g-4 > * { 
  padding: 12px; 
}

.col-lg-7,
.col-lg-5 {
  width: 100%;
}

@media (min-width: 992px) {
  .col-lg-7 {
    width: 58.333333%;
  }
  
  .col-lg-5 {
    width: 41.666667%;
  }
}

.h-100 {
  height: 100%;
}

.text-center {
  text-align: center;
}

.py-5 {
  padding-top: 3rem;
  padding-bottom: 3rem;
}

.me-3 {
  margin-right: 1rem;
}

.me-2 {
  margin-right: 0.5rem;
}

.me-1 {
  margin-right: 0.25rem;
}

.ms-2 {
  margin-left: 0.5rem;
}

@media (max-width: 768px) {
  .hero-section {
    padding: 20px 0 60px;
  }

  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 0.9rem;
  }

  .content-container {
    margin-top: -40px;
  }

  .card-body {
    padding: 20px;
  }

  .congrats-content {
    padding: 30px 20px;
  }

  .congrats-icon {
    width: 100px;
    height: 100px;
  }

  .congrats-icon i {
    font-size: 3rem;
  }

  .congrats-title {
    font-size: 2rem;
  }

  .congrats-message {
    font-size: 1rem;
  }

  .congrats-highlight {
    padding: 15px;
    font-size: 0.9rem;
  }

  .congrats-close-btn {
    padding: 15px 35px;
    font-size: 1rem;
  }

  .finish-adoption-btn {
    padding: 15px 30px;
    font-size: 1rem;
  }
  
  .adoption-counter,
  .cat-name-badge {
    font-size: 0.85rem;
    padding: 6px 12px;
  }
  
  .cat-info-section {
    gap: 12px;
    padding: 12px;
    margin-bottom: 15px;
  }
  
  .cat-thumbnail-progress {
    width: 70px;
    height: 70px;
  }
  
  .cat-title-progress {
    font-size: 1rem;
  }
  
  .cat-location-progress {
    font-size: 0.85rem;
  }
}
</style>