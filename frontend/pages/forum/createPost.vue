<template>
  <div class="create-page">
    <div class="container">
      <!-- Back Button -->
      <button class="back-btn" @click="navigateTo('/forum')">
        <i class="fas fa-arrow-left me-2"></i>Back to Forum
      </button>

      <!-- Page Header -->
      <div class="page-header">
        <h1 class="page-title">
          <i class="fas fa-pen-fancy me-3"></i>Create New Post
        </h1>
        <p class="page-subtitle">Share your story with the community</p>
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
            <div v-if="form.image_urls?.length" class="image-preview">
              <div
                v-for="(url, index) in form.image_urls.slice(0, 5)"
                :key="index"
                class="preview-item"
              >
                <img :src="url" alt="Preview" @error="(e) => e.target.style.display = 'none'" />
              </div>
              <div v-if="form.image_urls.length > 5" class="preview-more">
                +{{ form.image_urls.length - 5 }} more
              </div>
            </div>
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
            <button type="button" class="btn btn-secondary-custom" @click="navigateTo('/forum')">
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
import { ref, computed, watch } from 'vue'
import { useForum } from '~/composables/useForum'

const { createPost } = useForum()

const submitting = ref(false)

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

const imageUrlsText = ref('')
const tagsText = ref('')

watch(imageUrlsText, (newVal) => {
  form.value.image_urls = newVal
    .split('\n')
    .map(url => url.trim())
    .filter(url => url.length > 0)
})

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

const handleSubmit = async () => {
  if (!isFormValid.value) return

  submitting.value = true

  try {
    const userId = 'current-user-id' // Replace with actual auth

    const result = await createPost({
      ...form.value,
      user_id: userId
    })

    if (result) {
      await navigateTo(`/forum/${result.id}`)
    }
  } catch (error) {
    console.error('Error creating post:', error)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.create-page {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  padding: 40px 0 80px;
}

.container {
  max-width: 900px;
}

.back-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  padding: 12px 25px;
  border-radius: 50px;
  font-weight: 600;
  transition: all 0.3s;
  margin-bottom: 30px;
  cursor: pointer;
}

.back-btn:hover {
  background: white;
  color: #667eea;
  transform: translateX(-5px);
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
  color: white;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.page-subtitle {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.1rem;
}

.form-card {
  background: white;
  border-radius: 25px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
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
  color: #2d3748;
  margin-bottom: 15px;
  font-size: 1.1rem;
}

.required {
  color: #e53e3e;
  margin-left: 5px;
}

.type-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
}

.type-card {
  border: 3px solid #e2e8f0;
  border-radius: 15px;
  padding: 25px 15px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background: white;
}

.type-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  border-color: #cbd5e0;
}

.type-card.active {
  border-color: #667eea;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  transform: scale(1.05);
  animation: pulse 0.5s;
}

@keyframes pulse {
  0%, 100% { transform: scale(1.05); }
  50% { transform: scale(1.1); }
}

.type-icon {
  font-size: 2.5rem;
  margin-bottom: 10px;
  transition: transform 0.3s;
}

.type-card:hover .type-icon {
  transform: scale(1.2) rotate(5deg);
}

.type-card.active .type-icon {
  animation: bounce 0.6s;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
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
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s;
  font-family: inherit;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
  transform: translateY(-2px);
}

.form-textarea {
  resize: vertical;
}

.char-counter {
  text-align: right;
  font-size: 0.875rem;
  color: #718096;
  margin-top: 5px;
}

.form-hint {
  display: block;
  color: #718096;
  font-size: 0.875rem;
  margin-top: 8px;
}

.image-preview {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 15px;
}

.preview-item {
  width: 80px;
  height: 80px;
  border-radius: 10px;
  overflow: hidden;
  border: 2px solid #e2e8f0;
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.8);
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

.preview-more {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: #f7fafc;
  border: 2px dashed #cbd5e0;
  border-radius: 10px;
  color: #718096;
  font-weight: 600;
}

.tag-preview {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 15px;
}

.tag-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 8px 15px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  animation: fadeIn 0.3s;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  padding-top: 30px;
  border-top: 2px solid #e2e8f0;
  margin-top: 40px;
}

.btn {
  padding: 15px 40px;
  border-radius: 50px;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.3s;
  cursor: pointer;
  border: none;
}

.btn-secondary-custom {
  background: #e2e8f0;
  color: #4a5568;
}

.btn-secondary-custom:hover {
  background: #cbd5e0;
  transform: translateY(-2px);
}

.btn-primary-custom {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
}

.btn-primary-custom:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 15px 40px rgba(102, 126, 234, 0.4);
}

.btn-primary-custom:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Responsive */
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