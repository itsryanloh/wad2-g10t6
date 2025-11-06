<template>
  <div class="edit-post-page">
    <div class="container">
      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <div class="loading-skeleton"></div>
      </div>

      <!-- Edit Form -->
      <div v-else-if="currentPost" class="edit-wrapper">
        <!-- Back Button -->
        <button class="back-btn" @click="router.back">
          <i class="fas fa-arrow-left me-2"></i>Back to Previous Page
        </button>

        <!-- Page Header -->
        <div class="page-header">
          <h1 class="page-title">
            <i class="fas fa-pen-fancy me-3"></i>Edit Your Post
          </h1>
          <p class="page-subtitle">Make changes to your post</p>
        </div>

        <!-- Form Card -->
        <div class="form-card">
          <form @submit.prevent="handleSubmit">
            <!-- Post Type (Read-only) -->
            <div class="form-section">
              <label class="section-label">
                <i class="fas fa-layer-group me-2"></i>Post Type
              </label>
              <div class="type-display">
                <span :class="['type-badge-large', `type-${currentPost.post_type}`]">
                  <i :class="getPostTypeIcon(currentPost.post_type)" class="me-2"></i>
                  {{ currentPost.post_type }}
                </span>
                <small class="type-hint">Post type cannot be changed after creation</small>
              </div>
            </div>

            <!-- Title -->
            <div class="form-section">
              <label class="section-label">
                <i class="fas fa-heading me-2"></i>Title
                <span class="required">*</span>
              </label>
              <input v-model="editForm.title" type="text" class="form-input"
                placeholder="Give your post a descriptive title..." maxlength="255" required />
              <div class="char-counter">{{ editForm.title?.length || 0 }}/255</div>
            </div>

            <!-- Content -->
            <div class="form-section">
              <label class="section-label">
                <i class="fas fa-align-left me-2"></i>Content
                <span class="required">*</span>
              </label>
              <textarea v-model="editForm.content" class="form-textarea" placeholder="Share details about your post..."
                rows="10" required></textarea>
              <small class="form-hint">Be as descriptive as possible</small>
            </div>

            <!-- Location -->
            <LocationSearch v-model="editForm.location" />

            <!-- Images Section -->
            <div class="form-section">
              <label class="section-label">
                <i class="fas fa-images me-2"></i>Images (Optional)
              </label>

              <!-- Upload Area -->
              <div class="upload-area" :class="{ dragging: isDragging, uploading: uploading }"
                @click="() => fileInput?.click()" @drop.prevent="handleDrop" @dragover.prevent="isDragging = true"
                @dragleave.prevent="isDragging = false">
                <input ref="fileInput" type="file" accept="image/*" multiple @change="handleFileSelect"
                  style="display: none;" />

                <div v-if="!uploading" class="upload-content">
                  <i class="fas fa-cloud-upload-alt upload-icon"></i>
                  <p class="upload-text">Drag & drop images here</p>
                  <p class="upload-subtext">or click to browse</p>
                  <small class="upload-hint">PNG, JPG, GIF up to 5MB each (Max 5 images total)</small>
                </div>

                <div v-else class="upload-loading">
                  <i class="fas fa-spinner fa-spin"></i>
                  <p>Uploading images...</p>
                </div>
              </div>

              <!-- Image Preview with Remove -->
              <div v-if="editForm.image_urls?.length" class="image-preview">
                <div v-for="(url, index) in editForm.image_urls" :key="index" class="preview-item">
                  <img :src="url" alt="Preview" @error="(e) => e.target.style.display = 'none'" />
                  <button type="button" class="remove-image" @click.stop="removeImage(index)" title="Remove image">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>

              <small v-if="uploadError" class="upload-error">{{ uploadError }}</small>
              <small v-else class="form-hint">
                {{ editForm.image_urls?.length || 0 }}/5 images added
              </small>
            </div>

            <!-- Tags -->
            <div class="form-section">
              <label class="section-label">
                <i class="fas fa-tags me-2"></i>Tags (Optional)
              </label>
              <input v-model="tagsText" type="text" class="form-input" placeholder="e.g., tabby, friendly, orange" />
              <small class="form-hint">Comma separated tags</small>

              <!-- Tags Preview -->
              <div v-if="editForm.tags?.length" class="tags-preview">
                <span v-for="tag in editForm.tags" :key="tag" class="tag-preview-item">
                  #{{ tag }}
                </span>
              </div>
            </div>

            <!-- Mark as Resolved -->
            <div v-if="['lost', 'found', 'adoption'].includes(currentPost.post_type)" class="form-section">
              <label class="section-label">
                <i class="fas fa-check-circle me-2"></i>Status
              </label>
              <div class="toggle-wrapper">
                <label class="toggle-container">
                  <input type="checkbox" v-model="editForm.is_resolved" class="toggle-input" />
                  <span class="toggle-slider"></span>
                </label>
                <span class="toggle-label">Mark this post as resolved</span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="action-buttons">
              <button type="button" class="btn-cancel" @click="navigateTo(`/profile/myPost`)">
                Cancel
              </button>
              <button type="submit" class="btn-save" :disabled="!isFormValid || updating">
                <i class="fas fa-check me-2"></i>
                {{ updating ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Error State -->
      <div v-else class="error-state">
        <div class="error-icon">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <h2>Post not found</h2>
        <p>Post not found or you don't have permission to edit</p>
        <button class="back-home-btn" @click="navigateTo('/forum/main')">
          <i class="fas fa-home me-2"></i>Back to Forum
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useForum } from '~/composables/useForum'
import LocationSearch from '~/components/LocationSearch.vue'

const route = useRoute()
const router = useRouter()
const { currentPost, loading, fetchPostById, updatePost } = useForum()

const updating = ref(false)
const isDragging = ref(false)
const uploading = ref(false)
const uploadError = ref('')
const fileInput = ref(null)
const base_url = import.meta.env.VITE_BASE_URL;

const editForm = ref({
  title: '',
  content: '',
  location: {
    name: '',
    lat: 0,
    lng: 0,
  },
  image_urls: [],
  tags: [],
  is_resolved: false
})

const tagsText = ref('')

watch(tagsText, (newVal) => {
  editForm.value.tags = newVal
    .split(',')
    .map(tag => tag.trim().toLowerCase())
    .filter(tag => tag.length > 0)
})

const isFormValid = computed(() => {
  return editForm.value.title?.trim() && editForm.value.content?.trim()
})

const getPostTypeIcon = (type) => {
  const icons = {
    adoption: 'fas fa-heart',
    sighting: 'fas fa-eye',
    lost: 'fas fa-exclamation-triangle',
    found: 'fas fa-check-circle',
    discussion: 'fas fa-comments',
    update: 'fas fa-sync'
  }
  return icons[type] || 'fas fa-circle'
}

//Handle file selection
const handleFileSelect = async (event) => {
  const files = Array.from(event.target.files)
  await uploadFiles(files)
}

//Handle drag and drop
const handleDrop = async (event) => {
  isDragging.value = false
  const files = Array.from(event.dataTransfer.files).filter(file =>
    file.type.startsWith('image/')
  )

  if (files.length === 0) {
    uploadError.value = 'Please drop image files only'
    return
  }

  await uploadFiles(files)
}

//Upload files to backend data bucket
const uploadFiles = async (files) => {
  if (files.length + (editForm.value.image_urls?.length || 0) > 5) {
    uploadError.value = 'Maximum 5 images allowed'
    return
  }

  uploadError.value = ''
  uploading.value = true

  try {
    const formData = new FormData()
    files.forEach(file => {
      formData.append('images', file)
    })

    //Upload to backend data bucket
    const response = await fetch(`${base_url}/upload-images`, {
      method: 'POST',
      body: formData
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Upload failed')
    }

    //Add uploaded URLs to form
    editForm.value.image_urls = [...(editForm.value.image_urls || []), ...data.urls]

  } catch (error) {
    console.error('Error uploading images:', error)
    uploadError.value = error.message || 'Failed to upload images'
  } finally {
    uploading.value = false
  }
}

//Remove image
const removeImage = (index) => {
  editForm.value.image_urls.splice(index, 1)
}

const handleSubmit = async () => {
  if (!isFormValid.value) return

  updating.value = true

  try {
    const postId = route.query.postId
    //Debug logging
    console.log('=== SUBMITTING UPDATE ===')
    console.log('Post ID:', postId)
    console.log('Form data being sent:', {
      title: editForm.value.title,
      content: editForm.value.content,
      location_name: editForm.value.location_name,
      image_urls: editForm.value.image_urls,
      tags: editForm.value.tags,
      is_resolved: editForm.value.is_resolved
    })
    console.log('Number of images:', editForm.value.image_urls?.length)
    console.log('Image URLs:', editForm.value.image_urls)
    console.log('Tags:', editForm.value.tags)

    const result = await updatePost(postId, {
      ...editForm.value,
      location_lat: editForm.value.location.lat,
      location_lng: editForm.value.location.lng,
      location_name: editForm.value.location.name
    })

    console.log('Update result:', result)

    await navigateTo(`/forum/${postId}`)
  } catch (error) {
    console.error('Error updating post:', error)
    alert('Failed to update post. Check console for details.')
  } finally {
    updating.value = false
  }
}

onMounted(async () => {
  const postId = route.query.postId

  console.log('EditPost mounted with postId:', postId)

  if (!postId) {
    console.error('No postId found in query parameters')
    await navigateTo('/forum')
    return
  }

  await fetchPostById(postId)

  if (currentPost.value) {
    editForm.value = {
      title: currentPost.value.title,
      content: currentPost.value.content,
      location: {
        name: currentPost.value.location_name,
        lat: currentPost.value.location_lat,
        lng: currentPost.value.location_lng
      },
      image_urls: currentPost.value.image_urls || [],
      tags: currentPost.value.tags || [],
      is_resolved: currentPost.value.is_resolved || false
    }

    tagsText.value = currentPost.value.tags?.join(', ') || ''

    console.log('Form populated with:', editForm.value)
  }
})
</script>

<style scoped>
.edit-post-page {
  background: linear-gradient(135deg, #FFF4E6 0%, #FFE4E1 50%, #E6F3FF 100%);
  min-height: 100vh;
  padding: 40px 0 80px;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 20px;
}

.back-btn {
  background: rgba(255, 155, 133, 0.15);
  color: #FF9B85;
  border: 2px solid rgba(255, 155, 133, 0.3);
  padding: 12px 25px;
  border-radius: 50px;
  font-weight: 600;
  transition: all 0.3s;
  margin-bottom: 30px;
  cursor: pointer;
}

.back-btn:hover {
  background: #FF9B85;
  color: white;
  transform: translateX(-5px);
  box-shadow: 0 5px 20px rgba(255, 155, 133, 0.3);
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
  background: linear-gradient(135deg, #FF9B85 0%, #88D8F7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 10px;
}

.page-subtitle {
  color: #7A7265;
  font-size: 1.1rem;
}

.form-card {
  background: white;
  border-radius: 25px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  animation: slideUp 0.8s ease;
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
  margin-bottom: 12px;
  font-size: 1.1rem;
}

.required {
  color: #FF6B6B;
  margin-left: 5px;
}

.type-display {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.type-badge-large {
  display: inline-flex;
  align-items: center;
  padding: 15px 30px;
  border-radius: 50px;
  font-weight: 700;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  width: fit-content;
}

.type-adoption {
  background: linear-gradient(135deg, #FFB88C 0%, #FF9B85 100%);
  color: white;
}

.type-sighting {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  color: white;
}

.type-lost {
  background: linear-gradient(135deg, #FF6B6B 0%, #EE5A6F 100%);
  color: white;
}

.type-found {
  background: linear-gradient(135deg, #A8E6CF 0%, #88D8F7 100%);
  color: white;
}

.type-discussion {
  background: linear-gradient(135deg, #B8A4E8 0%, #9B7FD4 100%);
  color: white;
}

.type-hint {
  color: #7A7265;
  font-style: italic;
}

.form-input {
  width: 100%;
  padding: 15px 20px;
  border: 2px solid #FFB88C;
  border-radius: 15px;
  font-size: 1rem;
  transition: all 0.3s;
  font-family: inherit;
}

.form-input:focus {
  outline: none;
  border-color: #FF9B85;
  box-shadow: 0 0 0 4px rgba(255, 155, 133, 0.1);
  transform: translateY(-2px);
}

.form-textarea {
  width: 100%;
  padding: 15px 20px;
  border: 2px solid #FFB88C;
  border-radius: 15px;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  transition: all 0.3s;
}

.form-textarea:focus {
  outline: none;
  border-color: #FF9B85;
  box-shadow: 0 0 0 4px rgba(255, 155, 133, 0.1);
}

.char-counter {
  text-align: right;
  color: #7A7265;
  font-size: 0.9rem;
  margin-top: 5px;
}

.form-hint {
  display: block;
  color: #7A7265;
  font-size: 0.9rem;
  margin-top: 8px;
}

.upload-area {
  border: 3px dashed #FFB88C;
  border-radius: 15px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background: linear-gradient(135deg, #FFF5E6 0%, #FFE8D6 100%);
}

.upload-area:hover {
  border-color: #FF9B85;
  background: linear-gradient(135deg, #FFE8D6 0%, #FFD9B3 100%);
  transform: translateY(-2px);
}

.upload-area.dragging {
  border-color: #FF9B85;
  background: linear-gradient(135deg, #FFD9B3 0%, #FFC999 100%);
  transform: scale(1.02);
  box-shadow: 0 10px 30px rgba(255, 155, 133, 0.2);
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
  color: #FF9B85;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-10px);
  }
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
  color: #FF9B85;
}

.upload-loading i {
  font-size: 3rem;
}

.upload-error {
  display: block;
  color: #FF6B6B;
  font-size: 0.9rem;
  margin-top: 8px;
  font-weight: 600;
}

.image-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 15px;
}

.preview-item {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 12px;
  overflow: hidden;
  border: 3px solid #FFB88C;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
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
  background: rgba(255, 107, 107, 0.95);
  color: white;
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.remove-image:hover {
  background: #FF6B6B;
  transform: scale(1.1);
}

.tags-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 15px;
}

.tag-preview-item {
  padding: 8px 18px;
  background: linear-gradient(135deg, #88D8F7 0%, #A8E6CF 100%);
  color: white;
  border-radius: 50px;
  font-weight: 600;
  font-size: 0.9rem;
}

.toggle-wrapper {
  display: flex;
  align-items: center;
  gap: 15px;
}

.toggle-container {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.toggle-input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 34px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

.toggle-input:checked+.toggle-slider {
  background: linear-gradient(135deg, #A8E6CF 0%, #88D8F7 100%);
}

.toggle-input:checked+.toggle-slider:before {
  transform: translateX(26px);
}

.toggle-label {
  color: #5D4E37;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  padding-top: 30px;
  margin-top: 30px;
  border-top: 2px solid #FFF4E6;
}

.btn-cancel {
  background: rgba(122, 114, 101, 0.1);
  color: #7A7265;
  border: 2px solid rgba(122, 114, 101, 0.3);
  padding: 12px 30px;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-cancel:hover {
  background: #7A7265;
  color: white;
  transform: translateY(-2px);
}

.btn-save {
  background: linear-gradient(135deg, #FF9B85 0%, #FFB88C 100%);
  color: white;
  border: none;
  padding: 12px 35px;
  border-radius: 50px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 10px 30px rgba(255, 155, 133, 0.3);
}

.btn-save:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 15px 40px rgba(255, 155, 133, 0.4);
}

.btn-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.loading-skeleton {
  height: 600px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 25px;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}

.error-state {
  text-align: center;
  padding: 80px 20px;
  animation: fadeIn 0.8s ease;
}

.error-icon {
  width: 120px;
  height: 120px;
  margin: 0 auto 30px;
  background: linear-gradient(135deg, #FFB88C 0%, #FF9B85 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-icon i {
  font-size: 4rem;
  color: white;
}

.error-state h2 {
  font-size: 2rem;
  color: #5D4E37;
  margin-bottom: 15px;
}

.error-state p {
  color: #7A7265;
  font-size: 1.1rem;
  margin-bottom: 30px;
}

.back-home-btn {
  background: linear-gradient(135deg, #FF9B85 0%, #FFB88C 100%);
  color: white;
  border: none;
  padding: 15px 40px;
  border-radius: 50px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.back-home-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(255, 155, 133, 0.4);
}

@media (max-width: 768px) {
  .form-card {
    padding: 25px;
  }

  .page-title {
    font-size: 2rem;
  }

  .action-buttons {
    flex-direction: column;
  }

  .btn-cancel,
  .btn-save {
    width: 100%;
  }
}
</style>
