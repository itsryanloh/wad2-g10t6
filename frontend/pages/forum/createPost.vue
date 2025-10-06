<template>
  <div class="create-page">
    <div class="container">
      <!-- Back Button -->
      <button class="back-btn" @click="navigateTo('/forum/main')">
        <i class="fas fa-arrow-left me-2"></i>Back to Forum
      </button>

      <!-- Page Header -->
      <div class="page-header">
        <h1 class="page-title">
          <i class="fas fa-pen-fancy me-3"></i>Create New Post
        </h1>
        <p class="page-subtitle">Share your cat story with the community</p>
      </div>

      <!-- Form Card -->
      <div class="form-card">
        <form @submit.prevent="handleSubmit">
          <!-- Post Type Selection -->
          <div class="form-section">
            <label class="section-label">
              <i class="fas fa-layer-group me-2"></i>Post Type
              <span class="required">*</span>
            </label>
            <div class="type-grid">
              <div
                v-for="type in postTypes"
                :key="type.value"
                @click="form.post_type = type.value"
                :class="['type-card', { active: form.post_type === type.value }]"
              >
                <i :class="type.icon" class="type-icon"></i>
                <div class="type-label">{{ type.label }}</div>
                <div class="type-desc">{{ type.description }}</div>
              </div>
            </div>
          </div>

          <!-- Title -->
          <div class="form-section">
            <label class="section-label">
              <i class="fas fa-heading me-2"></i>Title
              <span class="required">*</span>
            </label>
            <input
              v-model="form.title"
              type="text"
              class="form-input"
              placeholder="Give your post a descriptive title..."
              maxlength="255"
              required
            />
            <div class="char-counter">{{ form.title?.length || 0 }}/255</div>
          </div>

          <!-- Content -->
          <div class="form-section">
            <label class="section-label">
              <i class="fas fa-align-left me-2"></i>Content
              <span class="required">*</span>
            </label>
            <textarea
              v-model="form.content"
              class="form-textarea"
              placeholder="Share details about your sighting, adoption story, or question..."
              rows="8"
              required
            ></textarea>
            <small class="form-hint">Be as descriptive as possible</small>
          </div>

          <!-- Image Upload -->
          <div class="form-section">
            <label class="section-label">
              <i class="fas fa-images me-2"></i>Images (Optional)
            </label>
            
            <!-- Drag and Drop Area -->
            <div 
              class="upload-area"
              :class="{ 'dragging': isDragging, 'uploading': uploading }"
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              @drop.prevent="handleDrop"
              @click="$refs.fileInput.click()"
            >
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                multiple
                @change="handleFileSelect"
                style="display: none;"
              />
              
              <div v-if="!uploading" class="upload-content">
                <i class="fas fa-cloud-upload-alt upload-icon"></i>
                <p class="upload-text">Drag & drop images here</p>
                <p class="upload-subtext">or click to browse</p>
                <small class="upload-hint">PNG, JPG, GIF up to 5MB each (Max 5 images)</small>
              </div>
              
              <div v-else class="upload-loading">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Uploading images...</p>
              </div>
            </div>
            
            <!-- Image Preview -->
            <div v-if="form.image_urls?.length" class="image-preview">
              <div
                v-for="(url, index) in form.image_urls"
                :key="index"
                class="preview-item"
              >
                <img :src="url" alt="Preview" />
                <button 
                  type="button" 
                  class="remove-image" 
                  @click.stop="removeImage(index)"
                  title="Remove image"
                >
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
            
            <small v-if="uploadError" class="upload-error">{{ uploadError }}</small>
          </div>

          <!-- Location -->
          <div class="form-section">
            <label class="section-label">
              <i class="fas fa-map-marker-alt me-2"></i>Location
            </label>
            <input
              v-model="form.location_name"
              type="text"
              class="form-input"
              placeholder="e.g., Block 123 Ang Mo Kio Ave 3"
            />
            <small class="form-hint">Where did you spot the cat?</small>
          </div>

          <!-- Tags -->
          <div class="form-section">
            <label class="section-label">
              <i class="fas fa-tags me-2"></i>Tags
            </label>
            <input
              v-model="tagsText"
              type="text"
              class="form-input"
              placeholder="e.g., tabby, friendly, orange, young"
            />
            <small class="form-hint">Comma separated tags</small>
            
            <!-- Tag Preview -->
            <div v-if="form.tags?.length" class="tag-preview">
              <span v-for="tag in form.tags" :key="tag" class="tag-badge">
                #{{ tag }}
              </span>
            </div>
          </div>

          <!-- Submit Buttons -->
          <div class="form-actions">
            <button type="button" class="btn btn-secondary-custom" @click="navigateTo('/forum/main')">
              <i class="fas fa-times me-2"></i>Cancel
            </button>
            <button
              type="submit"
              class="btn btn-primary-custom"
              :disabled="!isFormValid || submitting"
            >
              <i class="fas fa-paper-plane me-2"></i>
              {{ submitting ? 'Publishing...' : 'Publish Post' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useForum } from '~/composables/useForum'
import { useRouter } from 'vue-router'

const { createPost } = useForum()
const router = useRouter()

const submitting = ref(false)
const isDragging = ref(false)
const uploading = ref(false)
const uploadError = ref('')
const fileInput = ref(null)

// Get current user ID from database
const currentUserId = ref(null)

onMounted(async () => {
  try {
    const response = await fetch('http://localhost:3000/api/users')
    const users = await response.json()
    
    // Find David Chen or use first user
    const davidChen = users.find(user => 
      user.username === 'davidchen' || user.name.toLowerCase().includes('david chen')
    )
    
    const targetUser = davidChen || users[0]
    
    if (targetUser) {
      currentUserId.value = targetUser.id
    }
  } catch (error) {
    console.error('Error fetching user:', error)
  }
})

const postTypes = [
  {
    value: 'adoption',
    label: 'Adoption',
    icon: 'fas fa-heart',
    description: 'Cat needs home'
  },
  {
    value: 'sighting',
    label: 'Sighting',
    icon: 'fas fa-eye',
    description: 'Spotted a cat'
  },
  {
    value: 'lost',
    label: 'Lost',
    icon: 'fas fa-exclamation-triangle',
    description: 'Missing pet'
  },
  {
    value: 'found',
    label: 'Found',
    icon: 'fas fa-check-circle',
    description: 'Found a cat'
  },
  {
    value: 'discussion',
    label: 'Discussion',
    icon: 'fas fa-comments',
    description: 'General talk'
  }
]

const form = ref({
  post_type: 'sighting',
  title: '',
  content: '',
  location_name: '',
  image_urls: [],
  tags: []
})

const tagsText = ref('')

watch(tagsText, (newVal) => {
  form.value.tags = newVal
    .split(',')
    .map(tag => tag.trim().toLowerCase())
    .filter(tag => tag.length > 0)
})

const isFormValid = computed(() => {
  return form.value.post_type &&
         form.value.title?.trim() &&
         form.value.content?.trim()
})

const handleFileSelect = async (event) => {
  const files = Array.from(event.target.files)
  await uploadFiles(files)
  event.target.value = ''
}

const handleDrop = async (event) => {
  isDragging.value = false
  const files = Array.from(event.dataTransfer.files).filter(file => 
    file.type.startsWith('image/')
  )
  
  if (files.length === 0) {
    uploadError.value = 'Please drop image files only'
    setTimeout(() => uploadError.value = '', 3000)
    return
  }
  
  await uploadFiles(files)
}

const uploadFiles = async (files) => {
  if (files.length + form.value.image_urls.length > 5) {
    uploadError.value = 'Maximum 5 images allowed'
    setTimeout(() => uploadError.value = '', 3000)
    return
  }
  
  const maxSize = 5 * 1024 * 1024
  const oversizedFiles = files.filter(file => file.size > maxSize)
  if (oversizedFiles.length > 0) {
    uploadError.value = 'Some files exceed 5MB limit'
    setTimeout(() => uploadError.value = '', 3000)
    return
  }
  
  uploadError.value = ''
  uploading.value = true
  
  try {
    const formData = new FormData()
    files.forEach(file => {
      formData.append('images', file)
    })
    
    const response = await fetch('http://localhost:3000/api/upload-images', {
      method: 'POST',
      body: formData
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || 'Upload failed')
    }
    
    form.value.image_urls = [...form.value.image_urls, ...data.urls]
    
  } catch (error) {
    console.error('Error uploading images:', error)
    uploadError.value = error.message || 'Failed to upload images'
    setTimeout(() => uploadError.value = '', 5000)
  } finally {
    uploading.value = false
  }
}

const removeImage = (index) => {
  form.value.image_urls.splice(index, 1)
}

const handleSubmit = async () => {
  if (!isFormValid.value) return
  
  if (!currentUserId.value) {
    uploadError.value = 'User not loaded. Please refresh the page.'
    return
  }

  submitting.value = true

  try {
    const postData = {
      user_id: currentUserId.value,
      title: form.value.title.trim(),
      content: form.value.content.trim(),
      post_type: form.value.post_type,
      location_name: form.value.location_name?.trim() || null,
      image_urls: form.value.image_urls.length > 0 ? form.value.image_urls : [],
      tags: form.value.tags.length > 0 ? form.value.tags : []
    }

    console.log('Creating post with data:', postData)

    const result = await createPost(postData)

    if (result) {
      console.log('Post created successfully:', result)
      await router.push(`/forum/${result.id}`)
    }
  } catch (error) {
    console.error('Error creating post:', error)
    uploadError.value = 'Failed to create post. Please try again.'
    setTimeout(() => uploadError.value = '', 5000)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.create-page {
  background: linear-gradient(135deg, #FFF5E6 0%, #FFE8D6 50%, #FFF0E0 100%);
  min-height: 100vh;
  padding: 40px 0 80px;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 20px;
}

.back-btn {
  background: rgba(255, 183, 77, 0.15);
  color: #FF9800;
  border: 2px solid rgba(255, 183, 77, 0.3);
  padding: 12px 25px;
  border-radius: 50px;
  font-weight: 600;
  transition: all 0.3s;
  margin-bottom: 30px;
  cursor: pointer;
}

.back-btn:hover {
  background: #FF9800;
  color: white;
  transform: translateX(-5px);
  box-shadow: 0 5px 20px rgba(255, 152, 0, 0.3);
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
  animation: fadeInDown 0.8s ease;
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

.page-title {
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 10px;
}

.page-subtitle {
  color: #7A7265;
  font-size: 1.1rem;
  font-weight: 500;
}

.form-card {
  background: white;
  border-radius: 25px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  animation: slideUp 0.8s ease;
  border: 2px solid rgba(255, 152, 0, 0.1);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-section {
  margin-bottom: 30px;
}

.section-label {
  display: flex;
  align-items: center;
  font-weight: 700;
  color: #5D4E37;
  margin-bottom: 15px;
  font-size: 1.1rem;
}

.required {
  color: #FF6B6B;
  margin-left: 5px;
}

.type-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
}

.type-card {
  border: 3px solid #FFE8D6;
  border-radius: 15px;
  padding: 25px 15px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background: white;
}

.type-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(255, 152, 0, 0.15);
  border-color: #FFB74D;
}

.type-card.active {
  border-color: #FF9800;
  background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
  color: white;
  transform: scale(1.05);
  box-shadow: 0 10px 30px rgba(255, 152, 0, 0.3);
}

.type-icon {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.type-label {
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 5px;
}

.type-desc {
  font-size: 0.875rem;
  opacity: 0.8;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 15px 20px;
  border: 2px solid #FFB74D;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s;
  font-family: inherit;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #FF9800;
  box-shadow: 0 0 0 4px rgba(255, 152, 0, 0.1);
  transform: translateY(-2px);
}

.form-textarea {
  resize: vertical;
}

.char-counter {
  text-align: right;
  font-size: 0.875rem;
  color: #7A7265;
  margin-top: 5px;
}

.form-hint {
  display: block;
  color: #7A7265;
  font-size: 0.875rem;
  margin-top: 8px;
}

.upload-area {
  border: 3px dashed #FFB74D;
  border-radius: 15px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background: linear-gradient(135deg, #FFF5E6 0%, #FFE8D6 100%);
}

.upload-area:hover {
  border-color: #FF9800;
  background: linear-gradient(135deg, #FFE8D6 0%, #FFD9B3 100%);
  transform: translateY(-2px);
}

.upload-area.dragging {
  border-color: #FF9800;
  background: linear-gradient(135deg, #FFD9B3 0%, #FFC999 100%);
  transform: scale(1.02);
  box-shadow: 0 10px 30px rgba(255, 152, 0, 0.2);
}

.upload-area.uploading {
  pointer-events: none;
  opacity: 0.7;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.upload-icon {
  font-size: 4rem;
  color: #FF9800;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.upload-text {
  font-size: 1.2rem;
  font-weight: 700;
  color: #5D4E37;
  margin: 0;
}

.upload-subtext {
  font-size: 1rem;
  color: #7A7265;
  margin: 0;
}

.upload-hint {
  color: #7A7265;
  font-size: 0.875rem;
}

.upload-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  color: #FF9800;
}

.upload-loading i {
  font-size: 3rem;
}

.upload-error {
  display: block;
  color: #FF6B6B;
  font-size: 0.875rem;
  margin-top: 8px;
  font-weight: 600;
}

.image-preview {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 15px;
}

.preview-item {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 10px;
  overflow: hidden;
  border: 2px solid #FFB74D;
  box-shadow: 0 4px 10px rgba(255, 152, 0, 0.1);
}

.preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-image {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(255, 107, 107, 0.95);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  font-size: 0.75rem;
}

.remove-image:hover {
  background: #FF6B6B;
  transform: scale(1.1);
}

.tag-preview {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 15px;
}

.tag-badge {
  background: linear-gradient(135deg, #88D8F7 0%, #A8E6CF 100%);
  color: white;
  padding: 8px 15px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  box-shadow: 0 4px 10px rgba(136, 216, 247, 0.2);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  padding-top: 30px;
  border-top: 2px solid #FFF5E6;
  margin-top: 40px;
}

.btn {
  padding: 15px 40px;
  border-radius: 50px;
  font-weight: 700;
  font-size: 16px;
  transition: all 0.3s;
  cursor: pointer;
  border: none;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-secondary-custom {
  background: rgba(122, 114, 101, 0.1);
  color: #7A7265;
  border: 2px solid rgba(122, 114, 101, 0.2);
}

.btn-secondary-custom:hover {
  background: #7A7265;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(122, 114, 101, 0.3);
}

.btn-primary-custom {
  background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
  color: white;
  box-shadow: 0 10px 30px rgba(255, 152, 0, 0.3);
}

.btn-primary-custom:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 15px 40px rgba(255, 152, 0, 0.5);
}

.btn-primary-custom:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

@media (max-width: 768px) {
  .form-card {
    padding: 25px;
  }

  .page-title {
    font-size: 2rem;
  }

  .type-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .form-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>