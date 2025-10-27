<template>
  <div class="badges-section">
    <h3>Your Adoption Badges 🏆</h3>
    
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

    <!-- Next Badge Progress -->
    <div v-if="nextBadge" class="next-badge">
      <div class="next-badge-header">Next Badge:</div>
      <div class="next-badge-info">
        <div class="next-badge-icon">{{ nextBadge.emoji }}</div>
        <div class="next-badge-details">
          <div class="next-badge-name">{{ nextBadge.name }}</div>
          <div class="next-badge-remaining">
            {{ nextBadge.remaining }} more task{{ nextBadge.remaining === 1 ? '' : 's' }} to go! 🐾
          </div>
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
defineProps({
  allBadges: {
    type: Array,
    required: true
  },
  nextBadge: {
    type: Object,
    default: null
  }
});
</script>

<style scoped>
.badges-section {
  margin-top: 40px;
  padding-top: 30px;
  border-top: 2px solid #FFD9B3;
}

.badges-section h3 {
  text-align: center;
  color: #FF8243;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 25px;
  font-family: Georgia, serif;
}

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

/* Next Badge */
.next-badge {
  background: linear-gradient(135deg, #FFF5E6, #FFE8D6);
  padding: 20px;
  border-radius: 12px;
  border: 2px dashed #FFD9B3;
}

.next-badge-header {
  font-weight: bold;
  color: #D97539;
  margin-bottom: 10px;
  font-size: 16px;
}

.next-badge-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.next-badge-icon {
  font-size: 2.5em;
  filter: grayscale(50%);
}

.next-badge-details {
  flex: 1;
}

.next-badge-name {
  font-weight: bold;
  color: #FF8243;
  margin-bottom: 5px;
  font-size: 16px;
}

.next-badge-remaining {
  color: #D97539;
  font-size: 14px;
  font-weight: 600;
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