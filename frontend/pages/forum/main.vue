<template>
  <div class="forum-page">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="container">
        <h1 class="hero-title">
          <i class="fas fa-comments me-3"></i>Community Forum
        </h1>
        <p class="hero-subtitle">Share, discover, and connect with fellow cat lovers</p>
      </div>
      <div class="wave-animation"></div>
    </div>

    <!-- Main Content -->
    <div class="container content-container">
      <!-- Search & Filter Card -->
      <div class="search-card">
        <div class="row g-4">
          <!-- Search Bar -->
          <div class="col-lg-12">
            <div class="search-wrapper">
              <i class="fas fa-search search-icon"></i>
              <input
                v-model="searchQuery"
                type="text"
                class="search-input"
                placeholder="Search posts by title, content, or tags..."
              />
              <button
                v-if="searchQuery"
                @click="searchQuery = ''"
                class="clear-btn"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>

          <!-- Filter Chips -->
          <div class="col-12">
            <div class="filter-section">
              <span class="filter-label">
                <i class="fas fa-filter me-2"></i>Filter by:
              </span>
              <div class="filter-chips">
                <button
                  v-for="type in postTypes"
                  :key="type.value"
                  @click="toggleFilter(type.value)"
                  :class="['filter-chip', { active: selectedType === type.value }]"
                >
                  <i :class="type.icon" class="me-2"></i>
                  {{ type.label }}
                </button>
              </div>
            </div>
          </div>

          <!-- Active Filters Display -->
          <div v-if="selectedType || searchQuery" class="col-12">
            <div class="active-filters">
              <span class="me-2">Active filters:</span>
              <span v-if="searchQuery" class="filter-tag">
                Search: "{{ searchQuery }}"
                <i @click="searchQuery = ''" class="fas fa-times ms-2"></i>
              </span>
              <span v-if="selectedType" class="filter-tag">
                Type: {{ selectedType }}
                <i @click="selectedType = null" class="fas fa-times ms-2"></i>
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="row g-4 mt-4">
        <div v-for="i in 6" :key="i" class="col-md-6 col-lg-4">
          <div class="skeleton-card"></div>
        </div>
      </div>

      <!-- Posts Grid -->
      <div v-else-if="filteredPosts.length > 0" class="row g-4 mt-4 posts-grid">
        <div
          v-for="(post, index) in filteredPosts"
          :key="post.id"
          class="col-md-6 col-lg-4 post-col"
          :style="{ animationDelay: `${index * 0.1}s` }"
        >
          <div class="post-card" @click="navigateTo(`/forum/${post.id}`)">
            <!-- Image Container -->
            <div class="post-image-wrapper">
              <img
                v-if="post.image_urls && post.image_urls[0]"
                :src="post.image_urls[0]"
                :alt="post.title"
                class="post-image"
                @error="handleImageError"
              />
              <div v-else class="post-image-placeholder">
                <i class="fas fa-image"></i>
              </div>

              <!-- Post Type Badge -->
              <span :class="['post-badge', `badge-${post.post_type}`]">
                {{ post.post_type }}
              </span>

              <!-- Resolved Badge -->
              <span v-if="post.is_resolved" class="resolved-badge">
                <i class="fas fa-check-circle me-1"></i>Resolved
              </span>
            </div>

            <!-- Card Body -->
            <div class="post-body">
              <h3 class="post-title">{{ post.title }}</h3>
              <p class="post-excerpt">{{ truncateText(post.content, 100) }}</p>

              <!-- Location -->
              <div v-if="post.location_name" class="post-location">
                <i class="fas fa-map-marker-alt text-danger"></i>
                <span>{{ post.location_name }}</span>
              </div>

              <!-- Tags -->
              <div v-if="post.tags && post.tags.length" class="post-tags">
                <span
                  v-for="tag in post.tags.slice(0, 3)"
                  :key="tag"
                  class="tag"
                >
                  #{{ tag }}
                </span>
                <span v-if="post.tags.length > 3" class="tag">
                  +{{ post.tags.length - 3 }}
                </span>
              </div>
            </div>

            <!-- Card Footer -->
            <div class="post-footer">
              <div class="author-info">
                <img
                  :src="post.users?.avatar_url || 'https://i.pravatar.cc/150?img=1'"
                  :alt="post.users?.name"
                  class="author-avatar"
                />
                <span class="author-name">{{ post.users?.name || 'Anonymous' }}</span>
              </div>

              <div class="post-stats">
                <span class="stat-item">
                  <i class="fas fa-eye"></i>
                  {{ post.view_count || 0 }}
                </span>
                <span class="stat-item">
                  <i class="fas fa-heart"></i>
                  {{ post.reaction_count || 0 }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <i class="fas fa-inbox"></i>
        <h3>No posts found</h3>
        <p>Try adjusting your filters or create a new post</p>
        <button class="btn btn-primary-custom" @click="navigateTo('/forum/create')">
          <i class="fas fa-plus me-2"></i>Create First Post
        </button>
      </div>
    </div>

    <!-- Floating Action Button -->
    <button class="fab" @click="navigateTo('/forum/create')" title="Create New Post">
      <i class="fas fa-plus"></i>
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useForum } from '~/composables/useForum'

const { posts, loading, fetchPosts } = useForum()

const searchQuery = ref('')
const selectedType = ref(null)

const postTypes = [
  { value: 'adoption', label: 'Adoption', icon: 'fas fa-heart' },
  { value: 'sighting', label: 'Sighting', icon: 'fas fa-eye' },
  { value: 'lost', label: 'Lost', icon: 'fas fa-exclamation-triangle' },
  { value: 'found', label: 'Found', icon: 'fas fa-check-circle' },
  { value: 'discussion', label: 'Discussion', icon: 'fas fa-comments' },
]

const filteredPosts = computed(() => {
  let result = posts.value || []

  if (selectedType.value) {
    result = result.filter(post => post.post_type === selectedType.value)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(post => {
      return (
        post.title?.toLowerCase().includes(query) ||
        post.content?.toLowerCase().includes(query) ||
        post.tags?.some(tag => tag.toLowerCase().includes(query))
      )
    })
  }

  return result
})

const toggleFilter = (type) => {
  selectedType.value = selectedType.value === type ? null : type
}

const truncateText = (text, length) => {
  if (!text) return ''
  return text.length > length ? text.substring(0, length) + '...' : text
}

const handleImageError = (e) => {
  e.target.style.display = 'none'
}

onMounted(async () => {
  await fetchPosts()
})
</script>

<style scoped>
.forum-page {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
  padding-bottom: 80px;
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60px 0 80px;
  position: relative;
  overflow: hidden;
}

.wave-animation {
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 80px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%23f5f7fa' d='M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E") no-repeat bottom;
  background-size: cover;
  animation: wave 15s ease-in-out infinite;
}

@keyframes wave {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(-50px); }
}

.hero-title {
  color: white;
  font-size: 3rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  animation: fadeInDown 1s ease;
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

.hero-subtitle {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.2rem;
  text-align: center;
  margin: 0;
}

.content-container {
  margin-top: -40px;
  position: relative;
  z-index: 10;
}

/* Search Card */
.search-card {
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  animation: slideUp 0.8s ease;
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

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 20px;
  color: #a0aec0;
  font-size: 18px;
}

.search-input {
  width: 100%;
  padding: 15px 50px 15px 50px;
  border: 2px solid #e2e8f0;
  border-radius: 50px;
  font-size: 16px;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
  transform: translateY(-2px);
}

.clear-btn {
  position: absolute;
  right: 15px;
  background: none;
  border: none;
  color: #a0aec0;
  cursor: pointer;
  padding: 8px;
  transition: all 0.3s;
}

.clear-btn:hover {
  color: #667eea;
  transform: rotate(90deg);
}

/* Filter Section */
.filter-section {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.filter-label {
  font-weight: 600;
  color: #4a5568;
}

.filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.filter-chip {
  padding: 10px 20px;
  border: 2px solid #e2e8f0;
  background: white;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  color: #4a5568;
}

.filter-chip:hover {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.filter-chip.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
  animation: pulse 0.5s;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.active-filters {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  padding: 15px;
  background: #f7fafc;
  border-radius: 12px;
  font-size: 14px;
  color: #4a5568;
}

.filter-tag {
  background: #667eea;
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-tag i {
  cursor: pointer;
  transition: transform 0.2s;
}

.filter-tag i:hover {
  transform: scale(1.2);
}

/* Posts Grid */
.posts-grid {
  animation: fadeIn 0.8s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.post-col {
  animation: slideUpFade 0.6s ease forwards;
  opacity: 0;
}

@keyframes slideUpFade {
  to {
    opacity: 1;
    transform: translateY(0);
  }
  from {
    opacity: 0;
    transform: translateY(20px);
  }
}

.post-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.post-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
}

.post-image-wrapper {
  position: relative;
  height: 250px;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.post-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}

.post-card:hover .post-image {
  transform: scale(1.1);
}

.post-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 4rem;
  opacity: 0.5;
}

.post-badge {
  position: absolute;
  top: 15px;
  right: 15px;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 12px;
  text-transform: uppercase;
  backdrop-filter: blur(10px);
  animation: bounceIn 0.8s;
}

@keyframes bounceIn {
  0% { transform: scale(0); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.badge-adoption { background: rgba(66, 153, 225, 0.9); color: white; }
.badge-sighting { background: rgba(237, 137, 54, 0.9); color: white; }
.badge-lost { background: rgba(245, 101, 101, 0.9); color: white; }
.badge-found { background: rgba(72, 187, 120, 0.9); color: white; }
.badge-discussion { background: rgba(159, 122, 234, 0.9); color: white; }

.resolved-badge {
  position: absolute;
  top: 15px;
  left: 15px;
  padding: 8px 16px;
  background: rgba(72, 187, 120, 0.9);
  color: white;
  border-radius: 20px;
  font-weight: 600;
  font-size: 12px;
  backdrop-filter: blur(10px);
}

.post-body {
  padding: 20px;
  flex: 1;
}

.post-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 10px;
  transition: color 0.3s;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-card:hover .post-title {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.post-excerpt {
  color: #718096;
  font-size: 14px;
  margin-bottom: 15px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-location {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #718096;
  font-size: 14px;
  margin-bottom: 10px;
}

.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.tag {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  padding: 5px 12px;
  border-radius: 15px;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.3s;
}

.tag:hover {
  background: rgba(102, 126, 234, 0.2);
  transform: scale(1.05);
}

.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-top: 1px solid #e2e8f0;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.author-avatar {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #667eea;
}

.author-name {
  font-weight: 600;
  color: #4a5568;
  font-size: 14px;
}

.post-stats {
  display: flex;
  gap: 15px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #718096;
  font-size: 14px;
}

/* Skeleton Loading */
.skeleton-card {
  height: 450px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 20px;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  animation: fadeIn 0.8s ease;
}

.empty-state i {
  font-size: 5rem;
  color: #cbd5e0;
  margin-bottom: 20px;
}

.empty-state h3 {
  font-size: 1.8rem;
  color: #4a5568;
  margin-bottom: 10px;
}

.empty-state p {
  color: #718096;
  font-size: 1.1rem;
  margin-bottom: 30px;
}

.btn-primary-custom {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 15px 40px;
  border-radius: 50px;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.3s;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
}

.btn-primary-custom:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 40px rgba(102, 126, 234, 0.4);
}

/* Floating Action Button */
.fab {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
  font-size: 24px;
  cursor: pointer;
  transition: all 0.3s;
  z-index: 999;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.fab:hover {
  transform: scale(1.1) rotate(90deg);
  box-shadow: 0 15px 40px rgba(102, 126, 234, 0.6);
}

/* Responsive */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }

  .search-card {
    padding: 20px;
  }

  .filter-section {
    flex-direction: column;
    align-items: flex-start;
  }

  .fab {
    width: 60px;
    height: 60px;
    font-size: 20px;
    bottom: 20px;
    right: 20px;
  }
}
</style>