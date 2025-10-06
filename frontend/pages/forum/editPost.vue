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
        <button class="back-btn" @click="navigateTo(`/forum/${route.params.postId}`)">
          <i class="fas fa-arrow-left me-2"></i>Back to Post
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
              <input
                v-model="editForm.title"
                type="text"
                class="form-input"
                placeholder="Give your post a descriptive title..."
                maxlength="255"
                required
              />
              <div class="char-counter">{{ editForm.title?.length || 0 }}/255</div>
            </div>

            <!-- Content -->
            <div class="form-section">
              <label class="section-label">
                <i class="fas fa-align-left me-2"></i>Content
                <span class="required">*</span>
              </label>
              <textarea
                v-model="editForm.content"
                class="form-textarea"
                placeholder="Share details about your post..."
                rows="10"
                required
              ></textarea>
              <small class="form-hint">Be as descriptive as possible</small>
            </div>

            <!-- Location -->
            <div class="form-section">
              <label class="section-label">
                <i class="fas fa-map-marker-alt me-2"></i>Location (Optional)
              </label>
              <input
                v-model="editForm.location_name"
                type="text"
                class="form-input"
                placeholder="e.g., Block 123 Ang Mo Kio Ave 3"
              />
            </div>

            <!-- Image URLs -->
            <div class="form-section">
              <label class="section-label">
                <i class="fas fa-images me-2"></i>Images (Optional)
              </label>
              <textarea
                v-model="imageUrlsText"
                class="form-textarea"
                placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                rows="4"
              ></textarea>
              <small class="form-hint">Enter image URLs, one per line</small>
              
              <!-- Image Preview -->
              <div v-if="editForm.image_urls?.length" class="image-preview">
                <div
                  v-for="(url, index) in editForm.image_urls.slice(0, 5)"
                  :key="index"
                  class="preview-item"
                >
                  <img :src="url" alt="Preview" @error="(e) => e.target.style.display = 'none'" />
                </div>
                <div v-if="editForm.image_urls.length > 5" class="preview-more">
                  +{{ editForm.image_urls.length - 5 }} more
                </div>
              </div>
            </div>

            <!-- Tags -->
            <div class="form-section">
              <label class="section-label">
                <i class="fas fa-tags me-2"></i>Tags (Optional)
              </label>
              <input
                v-model="tagsText"
                type="text"
                class="form-input"
                placeholder="e.g., tabby, friendly, orange"
              />
              <small class="form-hint">Comma separated tags</small>
              
              <!-- Tags Preview -->
              <div v-if="editForm.tags?.length" class="tags-preview">
                <span
                  v-for="tag in editForm.tags"
                  :key="tag"
                  class="tag-preview-item"
                >
                  #{{ tag }}
                </span>
              </div>
            </div>

            <!-- Mark as Resolved -->
            <div 
              v-if="['lost', 'found', 'adoption'].includes(currentPost.post_type)"
              class="form-section"
            >
              <label class="section-label">
                <i class="fas fa-check-circle me-2"></i>Status
              </label>
              <div class="toggle-wrapper">
                <label class="toggle-container">
                  <input 
                    type="checkbox" 
                    v-model="editForm.is_resolved"
                    class="toggle-input"
                  />
                  <span class="toggle-slider"></span>
                </label>
                <span class="toggle-label">Mark this post as resolved</span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="action-buttons">
              <!-- Delete Button -->
              <button
                type="button"
                class="btn-delete"
                @click="showDeleteConfirm = true"
              >
                <i class="fas fa-trash-alt me-2"></i>Delete Post
              </button>

              <!-- Save/Cancel Buttons -->
              <div class="save-buttons">
                <button
                  type="button"
                  class="btn-cancel"
                  @click="navigateTo(`/forum/${route.params.postId}`)"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="btn-save"
                  :disabled="!isFormValid || updating"
                >
                  <i class="fas fa-check me-2"></i>
                  {{ updating ? 'Saving...' : 'Save Changes' }}
                </button>
              </div>
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

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteConfirm" class="modal-overlay" @click="showDeleteConfirm = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <i class="fas fa-exclamation-triangle"></i>
          <h3>Delete Post</h3>
        </div>
        
        <p class="modal-body">
          Are you sure you want to delete this post? This action cannot be undone.
        </p>
        
        <div class="modal-footer">
          <button
            class="modal-btn-cancel"
            @click="showDeleteConfirm = false"
          >
            Cancel
          </button>
          <button
            class="modal-btn-delete"
            @click="handleDelete"
            :disabled="deleting"
          >
            <i class="fas fa-trash-alt me-2"></i>
            {{ deleting ? 'Deleting...' : 'Delete Permanently' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useForum } from '~/composables/useForum'

const route = useRoute()
const { currentPost, loading, fetchPostById, updatePost, deletePost } = useForum()

const updating = ref(false)
const deleting = ref(false)
const showDeleteConfirm = ref(false)

const editForm = ref({
  title: '',
  content: '',
  location_name: '',
  image_urls: [],
  tags: [],
  is_resolved: false
})

const imageUrlsText = ref('')
const tagsText = ref('')

watch(imageUrlsText, (newVal) => {
  editForm.value.image_urls = newVal
    .split('\n')
    .map(url => url.trim())
    .filter(url => url.length > 0)
})

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

const handleSubmit = async () => {
  if (!isFormValid.value) return

  updating.value = true

  try {
    await updatePost(route.params.postId, editForm.value)
    await navigateTo(`/forum/${route.params.postId}`)
  } catch (error) {
    console.error('Error updating post:', error)
  } finally {
    updating.value = false
  }
}

const handleDelete = async () => {
  deleting.value = true

  try {
    await deletePost(route.params.postId)
    await navigateTo('/forum')
  } catch (error) {
    console.error('Error deleting post:', error)
  } finally {
    deleting.value = false
  }
}

onMounted(async () => {
  const postId = route.params.postId
  await fetchPostById(postId)

  if (currentPost.value) {
    editForm.value = {
      title: currentPost.value.title,
      content: currentPost.value.content,
      location_name: currentPost.value.location_name || '',
      image_urls: currentPost.value.image_urls || [],
      tags: currentPost.value.tags || [],
      is_resolved: currentPost.value.is_resolved || false
    }

    imageUrlsText.value = currentPost.value.image_urls?.join('\n') || ''
    tagsText.value = currentPost.value.tags?.join(', ') || ''
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

/* Back Button */
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

/* Page Header */
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

/* Form Card */
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

/* Type Display */
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

/* Form Inputs */
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

/* Image Preview */
.image-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 15px;
}

.preview-item {
  width: 100px;
  height: 100px;
  border-radius: 12px;
  overflow: hidden;
  border: 3px solid #FFB88C;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-more {
  width: 100px;
  height: 100px;
  border-radius: 12px;
  background: linear-gradient(135deg, #FFB88C 0%, #FF9B85 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1.1rem;
}

/* Tags Preview */
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

/* Toggle Switch */
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

.toggle-input:checked + .toggle-slider {
  background: linear-gradient(135deg, #A8E6CF 0%, #88D8F7 100%);
}

.toggle-input:checked + .toggle-slider:before {
  transform: translateX(26px);
}

.toggle-label {
  color: #5D4E37;
  font-weight: 500;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 30px;
  margin-top: 30px;
  border-top: 2px solid #FFF4E6;
}

.btn-delete {
  background: rgba(255, 107, 107, 0.1);
  color: #FF6B6B;
  border: 2px solid rgba(255, 107, 107, 0.3);
  padding: 12px 25px;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-delete:hover {
  background: #FF6B6B;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 107, 107, 0.3);
}

.save-buttons {
  display: flex;
  gap: 15px;
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

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: white;
  border-radius: 25px;
  padding: 40px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalSlideUp 0.3s ease;
}

@keyframes modalSlideUp {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.modal-header i {
  font-size: 2.5rem;
  color: #FF6B6B;
}

.modal-header h3 {
  font-size: 1.8rem;
  font-weight: 700;
  color: #5D4E37;
  margin: 0;
}

.modal-body {
  color: #7A7265;
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 30px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
}

.modal-btn-cancel {
  background: rgba(122, 114, 101, 0.1);
  color: #7A7265;
  border: 2px solid rgba(122, 114, 101, 0.3);
  padding: 12px 30px;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.modal-btn-cancel:hover {
  background: #7A7265;
  color: white;
}

.modal-btn-delete {
  background: linear-gradient(135deg, #FF6B6B 0%, #EE5A6F 100%);
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.modal-btn-delete:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(255, 107, 107, 0.4);
}

.modal-btn-delete:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Loading State */
.loading-skeleton {
  height: 600px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 25px;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Error State */
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

/* Responsive */
@media (max-width: 768px) {
  .form-card {
    padding: 25px;
  }

  .page-title {
    font-size: 2rem;
  }

  .action-buttons {
    flex-direction: column;
    gap: 15px;
  }

  .save-buttons {
    width: 100%;
    flex-direction: column;
  }

  .btn-cancel,
  .btn-save,
  .btn-delete {
    width: 100%;
  }

  .modal-content {
    padding: 30px 20px;
  }

  .modal-footer {
    flex-direction: column;
  }

  .modal-btn-cancel,
  .modal-btn-delete {
    width: 100%;
  }
}
</style>