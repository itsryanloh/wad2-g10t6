<template>
  <div v-if="show" class="modal-overlay" @click="handleClose">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3><i class="fas fa-plus-circle me-2"></i>Create New Community</h3>
        <button class="close-btn" @click="handleClose">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <form @submit.prevent="handleSubmit" class="modal-body">
        <!-- Community Name -->
        <div class="form-group">
          <label for="community-name">
            <i class="fas fa-users me-2"></i>Community Name *
          </label>
          <input
            id="community-name"
            v-model="formData.name"
            type="text"
            placeholder="e.g., Ang Mo Kio Cat Lovers"
            maxlength="100"
            required
            class="form-input"
          />
          <small class="form-hint">A unique name for your community</small>
        </div>

        <!-- Location -->
        <div class="form-group">
          <label for="location-name">
            <i class="fas fa-map-marker-alt me-2"></i>Location *
          </label>
          <input
            id="location-name"
            v-model="formData.location_name"
            type="text"
            placeholder="e.g., Ang Mo Kio, Bishan, Tampines"
            maxlength="255"
            required
            class="form-input"
          />
          <small class="form-hint">The area or neighborhood this community represents</small>
        </div>

        <!-- Description -->
        <div class="form-group">
          <label for="description">
            <i class="fas fa-align-left me-2"></i>Description (Optional)
          </label>
          <textarea
            id="description"
            v-model="formData.description"
            placeholder="Describe what this community is about..."
            rows="4"
            maxlength="500"
            class="form-textarea"
          ></textarea>
          <small class="form-hint">{{ formData.description.length }}/500 characters</small>
        </div>

        <!-- Info Box -->
        <div class="info-box">
          <i class="fas fa-info-circle"></i>
          <div>
            <strong>About Communities:</strong>
            <p>Communities are location-based groups where members can share posts about cats in their area. Posts with matching locations will automatically be linked to your community!</p>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="error-message">
          <i class="fas fa-exclamation-circle me-2"></i>
          {{ errorMessage }}
        </div>

        <!-- Actions -->
        <div class="modal-actions">
          <button type="button" @click="handleClose" class="btn-cancel">
            Cancel
          </button>
          <button 
            type="submit" 
            :disabled="loading || !isFormValid"
            class="btn-submit"
          >
            <i class="fas fa-check me-2"></i>
            {{ loading ? 'Creating...' : 'Create Community' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useCommunities } from '~/composables/useCommunities'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  userId: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['close', 'created'])

const { createCommunity } = useCommunities()

//Form state
const formData = ref({
  name: '',
  location_name: '',
  description: ''
})

const loading = ref(false)
const errorMessage = ref('')

const isFormValid = computed(() => {
  return formData.value.name.trim().length > 0 && 
         formData.value.location_name.trim().length > 0
})

const handleClose = () => {
  if (!loading.value) {
    resetForm()
    emit('close')
  }
}

const resetForm = () => {
  formData.value = {
    name: '',
    location_name: '',
    description: ''
  }
  errorMessage.value = ''
}

const handleSubmit = async () => {
  if (!isFormValid.value) return
  
  loading.value = true
  errorMessage.value = ''
  
  try {
    const communityData = {
      name: formData.value.name.trim(),
      location_name: formData.value.location_name.trim(),
      description: formData.value.description.trim() || undefined,
      created_by: props.userId || undefined
    }
    
    const result = await createCommunity(communityData)
    
    if (result) {
      emit('created', result)
      handleClose()
    } else {
      errorMessage.value = 'Failed to create community. Please try again.'
    }
  } catch (error) {
    console.error('Error creating community:', error)
    
    //Handle specific error cases
    if (error.message?.includes('duplicate') || error.message?.includes('unique')) {
      errorMessage.value = 'A community with this name already exists. Please choose a different name.'
    } else {
      errorMessage.value = error.message || 'Failed to create community. Please try again.'
    }
  } finally {
    loading.value = false
  }
}

//Reset form when modal closes
watch(() => props.show, (newValue) => {
  if (!newValue) {
    resetForm()
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
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
  animation: fadeIn 0.3s ease;
}

.modal-content {
  background: white;
  border-radius: 25px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  padding: 25px 30px;
  border-bottom: 2px solid #f5f5f5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #FFB74D 0%, #FF9800 100%);
  color: white;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  display: flex;
  align-items: center;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 5px 10px;
  transition: transform 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  transform: rotate(90deg);
}

.modal-body {
  padding: 30px;
  overflow-y: auto;
  flex: 1;
}

.form-group {
  margin-bottom: 25px;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: #5D4E37;
  margin-bottom: 8px;
  font-size: 0.95rem;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #E8DCC4;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s;
  font-family: inherit;
  background: #FFFBF5;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #FF9800;
  box-shadow: 0 0 0 3px rgba(255, 152, 0, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.form-hint {
  display: block;
  margin-top: 6px;
  font-size: 0.85rem;
  color: #9E8B6F;
}

.info-box {
  background: linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%);
  border-left: 4px solid #2196F3;
  padding: 16px;
  border-radius: 12px;
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.info-box i {
  color: #2196F3;
  font-size: 1.2rem;
  margin-top: 2px;
}

.info-box strong {
  display: block;
  color: #1976D2;
  margin-bottom: 4px;
}

.info-box p {
  margin: 0;
  font-size: 0.9rem;
  color: #0D47A1;
  line-height: 1.5;
}

.error-message {
  background: linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 100%);
  border-left: 4px solid #F44336;
  color: #C62828;
  padding: 12px 16px;
  border-radius: 12px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  font-size: 0.9rem;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 2px solid #f5f5f5;
}

.btn-cancel,
.btn-submit {
  padding: 12px 28px;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-cancel {
  background: #F5F5F5;
  color: #757575;
}

.btn-cancel:hover {
  background: #E0E0E0;
}

.btn-submit {
  background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(255, 152, 0, 0.3);
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 152, 0, 0.4);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
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

@media (max-width: 768px) {
  .modal-content {
    max-width: 100%;
    border-radius: 20px;
  }

  .modal-header {
    padding: 20px;
  }

  .modal-header h3 {
    font-size: 1.3rem;
  }

  .modal-body {
    padding: 20px;
  }

  .modal-actions {
    flex-direction: column;
  }

  .btn-cancel,
  .btn-submit {
    width: 100%;
  }
}
</style>