<template>
  <Teleport to="body">
    <Transition name="notification">
      <div v-if="visible" class="badge-notification">
        <div 
          class="notification-badge"
          :style="{ background: currentBadge?.gradient }"
        >
          {{ currentBadge?.emoji }}
        </div>
        <div class="notification-content">
          <h3>Meow-velous! 🎊</h3>
          <p>You earned: {{ currentBadge?.name }}</p>
        </div>
      </div>
    </Transition>

    <!-- Paw Trail -->
    <div 
      v-for="(paw, index) in pawTrail" 
      :key="paw.id"
      class="paw-trail"
      :style="{ 
        right: (100 + index * 50) + 'px',
        top: '50px'
      }"
    >
      🐾
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue';

const visible = ref(false);
const currentBadge = ref(null);
const pawTrail = ref([]);

let pawIdCounter = 0;

async function show(badge) {
  currentBadge.value = badge;
  visible.value = true;
  
  // Create paw trail
  createPawTrail();
  
  // Hide after 3.5 seconds
  setTimeout(() => {
    visible.value = false;
  }, 3500);
}

function createPawTrail() {
  pawTrail.value = [];
  
  for (let i = 0; i < 3; i++) {
    setTimeout(() => {
      pawTrail.value.push({ id: pawIdCounter++ });
      
      // Remove after animation
      setTimeout(() => {
        pawTrail.value.shift();
      }, 2000);
    }, i * 200);
  }
}

defineExpose({ show });
</script>

<style scoped>
.badge-notification {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: linear-gradient(135deg, #FF8243 0%, #FFA566 100%);
  color: white;
  padding: 25px 30px;
  border-radius: 15px;
  box-shadow: 0 15px 50px rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  gap: 20px;
  z-index: 1000;
  max-width: 400px;
}

.notification-badge {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5em;
  box-shadow: 0 5px 20px rgba(0,0,0,0.3);
  flex-shrink: 0;
  animation: spin-in 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  background: white;
}

@keyframes spin-in {
  0% { 
    transform: rotate(0deg) scale(0);
    opacity: 0;
  }
  100% { 
    transform: rotate(720deg) scale(1);
    opacity: 1;
  }
}

.notification-content h3 {
  margin: 0 0 5px 0;
  font-size: 1.4em;
}

.notification-content p {
  margin: 0;
  opacity: 0.95;
  font-size: 1em;
}

/* Transition */
.notification-enter-active {
  transition: all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateY(-100px);
}

.notification-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Paw Trail */
.paw-trail {
  position: fixed;
  bottom: 20px;
  right: 20px;
  font-size: 2em;
  pointer-events: none;
  animation: fade-fall 2s ease-out forwards;
  z-index: 999;
}

@keyframes fade-fall {
  0% {
    opacity: 1;
    transform: translateY(0) rotate(0deg);
  }
  100% {
    opacity: 0;
    transform: translateY(100px) rotate(45deg);
  }
}

@media (max-width: 768px) {
  .badge-notification {
    right: 10px;
    left: 10px;
    max-width: none;
  }

  .notification-badge {
    width: 60px;
    height: 60px;
    font-size: 2em;
  }
}
</style>