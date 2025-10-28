<template>
  <div class="badges-section">
    
    <!-- Badges Grid (stays as original) -->
    <div class="badges-container">
      <div 
        v-for="badge in allBadges" 
        :key="badge.id"
        :class="['badge-item', { 
          'badge-earned': badge.earned, 
          'badge-locked': !badge.earned,
          'special': badge.special && badge.earned
        }]"
      >
        <div class="badge-paw">
          <div class="paw-background">🐾</div>
          <div class="badge-emoji">{{ badge.emoji }}</div>
        </div>
        <div class="badge-name">{{ badge.name }}</div>
      </div>
    </div>

    <!-- Next Badge Progress with Carousel -->
    <div v-if="unearnedBadges.length > 0" class="next-badge">
      <div class="next-badge-header">Upcoming Badges:</div>
      <div class="next-badge-info">
        <!-- Carousel for badge icon and name -->
        <div class="badge-carousel">
          <div class="badge-carousel-track" :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
            <div 
              v-for="badge in unearnedBadges" 
              :key="badge.id"
              class="badge-carousel-slide"
            >
              <div class="next-badge-icon">{{ badge.emoji }}</div>
              <div class="next-badge-name">{{ badge.name }}</div>
            </div>
          </div>
        </div>
        
        <!-- Static task count -->
        <div class="next-badge-remaining">
          {{ unearnedBadges.length }} more badge{{ unearnedBadges.length === 1 ? '' : 's' }} to go! 🐾
        </div>
      </div>
    </div>

    <!-- All Badges Earned -->
    <div v-else class="all-earned">
      <div class="all-earned-icon">🎉</div>
      <div class="all-earned-text">All badges earned!</div>
      <div class="all-earned-subtext">You're ready to adopt! 🐱</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  allBadges: {
    type: Array,
    required: true
  },
  nextBadge: {
    type: Object,
    default: null
  }
});

const currentSlide = ref(0)
let autoplayInterval = null

const unearnedBadges = computed(() => {
  return props.allBadges.filter(badge => !badge.earned)
})

const goToSlide = (index) => {
  currentSlide.value = index
  resetAutoplay()
}

const nextSlide = () => {
  if (unearnedBadges.value.length > 0) {
    currentSlide.value = (currentSlide.value + 1) % unearnedBadges.value.length
  }
}

const startAutoplay = () => {
  if (unearnedBadges.value.length > 1) {
    autoplayInterval = setInterval(nextSlide, 3000) // Change slide every 3 seconds
  }
}

const stopAutoplay = () => {
  if (autoplayInterval) {
    clearInterval(autoplayInterval)
    autoplayInterval = null
  }
}

const resetAutoplay = () => {
  stopAutoplay()
  startAutoplay()
}

onMounted(() => {
  startAutoplay()
})

onBeforeUnmount(() => {
  stopAutoplay()
})
</script>

<style scoped>
.badges-section {
  padding-top: 20px;
}

/* Badges Grid (original) */
.badges-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.badge-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
}

.badge-earned {
  animation: badge-appear 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes badge-appear {
  0% {
    opacity: 0;
    transform: scale(0) rotate(-180deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

.badge-locked {
  opacity: 0.4;
  filter: grayscale(100%);
}

.badge-paw {
  width: 100px;
  height: 100px;
  position: relative;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.paw-background {
  position: absolute;
  font-size: 4em;
  opacity: 0.2;
  z-index: 0;
}

.badge-emoji {
  position: relative;
  font-size: 3em;
  z-index: 1;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
}

.badge-earned .badge-emoji {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}

.badge-name {
  font-size: 13px;
  font-weight: bold;
  color: #D97539;
  margin-top: 5px;
}

/* Special badge sparkle */
.badge-item.special::after {
  content: '✨';
  position: absolute;
  top: -5px;
  right: 5px;
  font-size: 1.5em;
  animation: sparkle 1.5s ease-in-out infinite;
}

@keyframes sparkle {
  0%, 100% { 
    opacity: 1; 
    transform: scale(1) rotate(0deg); 
  }
  50% { 
    opacity: 0.5; 
    transform: scale(1.2) rotate(180deg); 
  }
}

/* Next Badge Section */
.next-badge {
  background: linear-gradient(135deg, #FFF5E6, #FFE8D6);
  padding: 20px;
  border-radius: 12px;
  border: 2px dashed #FFD9B3;
}

.next-badge-header {
  font-weight: bold;
  color: #D97539;
  margin-bottom: 15px;
  font-size: 16px;
}

.next-badge-info {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

/* Badge Carousel in Next Badge Section */
.badge-carousel {
  position: relative;
  overflow: hidden;
  width: 100%;
}

.badge-carousel-track {
  display: flex;
  transition: transform 0.5s ease-in-out;
}

.badge-carousel-slide {
  min-width: 100%;
  display: flex;
  align-items: center;
  gap: 15px;
}

.next-badge-icon {
  font-size: 2.5em;
  filter: grayscale(50%);
  flex-shrink: 0;
}

.next-badge-name {
  font-weight: bold;
  color: #FF8243;
  font-size: 16px;
  flex: 1;
}

.next-badge-remaining {
  color: #D97539;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
}

/* Carousel Indicators */
.carousel-indicators {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 15px;
}

.indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #FFD9B3;
  cursor: pointer;
  transition: all 0.3s ease;
}

.indicator:hover {
  background: #FFB380;
}

.indicator.active {
  background: #FF8243;
  width: 24px;
  border-radius: 4px;
}

/* All Earned */
.all-earned {
  text-align: center;
  padding: 30px;
  background: linear-gradient(135deg, #FFF5E6, #FFE8D6);
  border-radius: 12px;
}

.all-earned-icon {
  font-size: 3em;
  margin-bottom: 10px;
}

.all-earned-text {
  font-weight: bold;
  font-size: 1.2em;
  color: #FF8243;
  margin-bottom: 5px;
}

.all-earned-subtext {
  color: #D97539;
  font-size: 14px;
}

@media (max-width: 768px) {
  .badges-container {
    grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
    gap: 15px;
  }
  
  .badge-paw {
    width: 80px;
    height: 80px;
  }
  
  .badge-emoji {
    font-size: 2.5em;
  }
}
</style>