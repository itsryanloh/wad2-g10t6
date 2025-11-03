<template>
  <div v-if="show" class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>
          <i class="fas fa-search me-2"></i>Discover Communities
        </h2>
        <button @click="$emit('close')" class="modal-close">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="modal-body">
        <!-- Loading state -->
        <div v-if="loading" class="text-center py-4">
          <div class="spinner-border text-warning" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2">Loading communities...</p>
        </div>

        <!-- Communities list -->
        <div v-else-if="availableCommunities.length > 0" class="communities-grid">
          <div
            v-for="community in availableCommunities"
            :key="community.id"
            class="community-card"
          >
            <div class="community-card-icon">
              <i class="fas fa-map-marker-alt"></i>
            </div>
            <div class="community-card-info">
              <h3>{{ community.name }}</h3>
              <p>{{ community.description || 'No description available' }}</p>
              <div class="community-card-meta">
                <span>
                  <i class="fas fa-map-marker-alt"></i> 
                  {{ community.location_name || 'Unknown' }}
                </span>
              </div>
            </div>
            <button
              v-if="isUserInCommunity(community.id)"
              @click="handleLeaveCommunity(community.id)"
              class="btn-leave"
              :disabled="processingCommunity === community.id"
            >
              <i v-if="processingCommunity !== community.id" class="fas fa-minus me-1"></i>
              <span v-if="processingCommunity === community.id">Leaving...</span>
              <span v-else>Leave</span>
            </button>
            <button
              v-else
              @click="handleJoinCommunity(community.id)"
              class="btn-join"
              :disabled="processingCommunity === community.id"
            >
              <i v-if="processingCommunity !== community.id" class="fas fa-plus me-1"></i>
              <span v-if="processingCommunity === community.id">Joining...</span>
              <span v-else>Join</span>
            </button>
          </div>
        </div>

        <!-- Empty state -->
        <div v-else class="text-center py-4">
          <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
          <p>No communities available</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useCommunities } from '~/composables/useCommunities'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  userId: {
    type: String,
    required: true
  },
  userCommunities: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'community-updated'])

const { 
  allCommunities, 
  loading, 
  fetchAllCommunities,
  joinCommunity,
  leaveCommunity
} = useCommunities()

const processingCommunity = ref(null)

//Get communities user hasn't joined
const availableCommunities = computed(() => {
  if (!allCommunities.value) return []
  return allCommunities.value
})

const isUserInCommunity = (communityId) => {
  return props.userCommunities.some(m => m.community_id === communityId)
}

const handleJoinCommunity = async (communityId) => {
  if (!props.userId) {
    alert('Please log in to join communities')
    return
  }

  processingCommunity.value = communityId
  
  try {
    const success = await joinCommunity(props.userId, communityId)
    
    if (success) {
      emit('community-updated')
      //Show success message (you can use a toast library instead)
      alert('Successfully joined community!')
    } else {
      alert('Failed to join community. Please try again.')
    }
  } catch (error) {
    console.error('Error joining community:', error)
    alert('An error occurred while joining the community.')
  } finally {
    processingCommunity.value = null
  }
}

const handleLeaveCommunity = async (communityId) => {
  if (!props.userId) {
    alert('Please log in to leave communities')
    return
  }

  //Confirm before leaving
  if (!confirm('Are you sure you want to leave this community?')) {
    return
  }

  processingCommunity.value = communityId
  
  try {
    const success = await leaveCommunity(props.userId, communityId)
    
    if (success) {
      emit('community-updated')
      alert('Successfully left community!')
    } else {
      alert('Failed to leave community. Please try again.')
    }
  } catch (error) {
    console.error('Error leaving community:', error)
    alert('An error occurred while leaving the community.')
  } finally {
    processingCommunity.value = null
  }
}

//Load communities when modal opens
watch(() => props.show, async (newVal) => {
  if (newVal && allCommunities.value.length === 0) {
    await fetchAllCommunities()
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: white;
  border-radius: 25px;
  max-width: 900px;
  width: 100%;
  max-height: 85vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  padding: 25px 30px;
  background: linear-gradient(135deg, #FFB74D 0%, #FF9800 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
  display: flex;
  align-items: center;
}

.modal-close {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.modal-body {
  padding: 30px;
  overflow-y: auto;
  flex: 1;
}

.communities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.community-card {
  background: linear-gradient(135deg, #FFF5E6 0%, #FFE8D6 100%);
  border: 2px solid #FFB74D;
  border-radius: 20px;
  padding: 20px;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.community-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(255, 152, 0, 0.2);
  border-color: #FF9800;
}

.community-card-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #FFB74D 0%, #FF9800 100%);
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.8rem;
  box-shadow: 0 4px 15px rgba(255, 152, 0, 0.3);
}

.community-card-info h3 {
  font-size: 1.2rem;
  font-weight: 700;
  color: #5D4E37;
  margin: 0 0 8px 0;
}

.community-card-info p {
  font-size: 0.9rem;
  color: #7A7265;
  margin: 0 0 12px 0;
  line-height: 1.5;
}

.community-card-meta {
  display: flex;
  gap: 15px;
  font-size: 0.85rem;
  color: #999;
}

.community-card-meta span {
  display: flex;
  align-items: center;
  gap: 5px;
}

.community-card-meta i {
  color: #FF9800;
}

.btn-join, .btn-leave {
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-join {
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
}

.btn-join:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
}

.btn-leave {
  background: linear-gradient(135deg, #FF6B6B 0%, #EE5A6F 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
}

.btn-leave:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
}

.btn-join:disabled,
.btn-leave:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner-border {
  width: 3rem;
  height: 3rem;
  border: 0.25em solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spinner-border 0.75s linear infinite;
}

@keyframes spinner-border {
  to { transform: rotate(360deg); }
}

.text-warning {
  color: #FF9800;
}

.text-center {
  text-align: center;
}

.py-4 {
  padding-top: 1.5rem;
  padding-bottom: 1.5rem;
}

.mt-2 {
  margin-top: 0.5rem;
}

.fa-3x {
  font-size: 3em;
}

.text-muted {
  color: #6c757d;
}

.mb-3 {
  margin-bottom: 1rem;
}

@media (max-width: 768px) {
  .communities-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-content {
    max-height: 90vh;
  }
}
</style>