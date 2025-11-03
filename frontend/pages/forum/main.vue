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
      <div class="forum-layout">
        <!-- Left Sidebar - Communities -->
        <div class="sidebar-column">
          <CommunitySidebar 
            :userCommunities="userCommunities"
            :loading="loadingCommunities"
            :selectedId="selectedCommunityId"
            @select-community="handleCommunitySelect"
          />
          
          <!-- Find More Communities Button -->
          <button class="find-communities-btn" @click="showCommunityBrowser = true">
            <i class="fas fa-search me-2"></i>
            Find More Communities
          </button>
        </div>

        <!-- Main Content Area -->
        <div class="main-column">
          <!-- Search & Filter Card -->
          <div class="search-card">
            <div class="row g-4">
              <!-- Community Info Banner (when community selected) -->
              <div v-if="selectedCommunity" class="col-12">
                <div class="community-banner">
                  <div class="community-banner-content">
                    <i class="fas fa-map-marker-alt me-2"></i>
                    <span class="community-banner-name">{{ selectedCommunity.name }}</span>
                    <span class="community-banner-desc">{{ selectedCommunity.description }}</span>
                  </div>
                  <button @click="handleCommunitySelect(null)" class="clear-community-btn">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>

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
                  <button v-if="searchQuery" @click="searchQuery = ''" class="clear-btn">
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
              <div v-if="selectedType || searchQuery || selectedCommunity" class="col-12">
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
                  <span v-if="selectedCommunity" class="filter-tag">
                    Community: {{ selectedCommunity.name }}
                    <i @click="handleCommunitySelect(null)" class="fas fa-times ms-2"></i>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="posts-grid mt-4">
            <div v-for="i in 6" :key="i" class="skeleton-card"></div>
          </div>

          <!-- Posts Grid -->
          <div v-else-if="filteredPosts.length > 0" class="posts-grid mt-4">
            <div
              v-for="(post, index) in filteredPosts"
              :key="post.id"
              class="post-col"
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
                    <i class="fas fa-map-marker-alt"></i>
                    <span>{{ post.location_name }}</span>
                  </div>

                  <!-- Tags -->
                  <div v-if="post.tags && post.tags.length" class="post-tags">
                    <span v-for="tag in post.tags.slice(0, 3)" :key="tag" class="tag">
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
                    <span class="stat-item reaction-like">
                      <i class="fas fa-thumbs-up"></i>
                      {{ post.reaction_counts?.like || 0 }}
                    </span>
                    <span class="stat-item reaction-heart">
                      <i class="fas fa-heart"></i>
                      {{ post.reaction_counts?.heart || 0 }}
                    </span>
                    <span class="stat-item reaction-helpful">
                      <i class="fas fa-star"></i>
                      {{ post.reaction_counts?.helpful || 0 }}
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
            <p v-if="selectedCommunity">
              No posts found in {{ selectedCommunity.name }}. Try selecting a different community or create a post!
            </p>
            <p v-else>Try adjusting your filters or create a new post</p>
            <button class="btn btn-primary-custom" @click="navigateTo('/forum/createPost')">
              <i class="fas fa-plus me-2"></i>Create First Post
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Community Browser Modal -->
    <CommunityBrowser 
      :show="showCommunityBrowser"
      :userId="currentUserId"
      :userCommunities="userCommunities"
      @close="showCommunityBrowser = false"
      @community-updated="handleCommunityUpdated"
    />

    <!-- Floating Action Button -->
    <button class="fab" @click="navigateTo('/forum/createPost')" title="Create New Post">
      <i class="fas fa-plus"></i>
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onActivated } from 'vue'
import { useForum } from '~/composables/useForum'
import { useCommunities } from '~/composables/useCommunities'
import CommunitySidebar from '~/components/CommunitySidebar.vue'
import CommunityBrowser from '~/components/CommunityBrowser.vue'

const { posts, loading, fetchPosts } = useForum()
const { 
  userCommunities, 
  loading: loadingCommunities, 
  fetchUserCommunities
} = useCommunities()

const token = useCookie("token")
const searchQuery = ref('')
const selectedType = ref(null)
const selectedCommunity = ref(null)
const selectedCommunityId = ref(null)
const currentUserId = ref(null)
const showCommunityBrowser = ref(false)

const postTypes = [
  { value: 'adoption', label: 'Adoption', icon: 'fas fa-heart' },
  { value: 'sighting', label: 'Sighting', icon: 'fas fa-eye' },
  { value: 'lost', label: 'Lost', icon: 'fas fa-exclamation-triangle' },
  { value: 'found', label: 'Found', icon: 'fas fa-check-circle' },
  { value: 'discussion', label: 'Discussion', icon: 'fas fa-comments' },
]

//Filter posts by community_id, type, and search query
const filteredPosts = computed(() => {
  let result = posts.value || []
  
  if (selectedCommunity.value && selectedCommunity.value.id) {
    const communityId = selectedCommunity.value.id
    result = result.filter(post => post.community_id === communityId)
  }

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

const handleCommunitySelect = (community) => {
  if (community) {
    selectedCommunity.value = community
    selectedCommunityId.value = community.id
  } else {
    selectedCommunity.value = null
    selectedCommunityId.value = null
  }
}

const handleCommunityUpdated = async () => {
  if (currentUserId.value) {
    await fetchUserCommunities(currentUserId.value)
  }
}

const truncateText = (text, length) => {
  if (!text) return ''
  return text.length > length ? text.substring(0, length) + '...' : text
}

const handleImageError = (e) => {
  e.target.style.display = 'none'
}

onMounted(async () => {
  if (!token.value) {
    return await navigateTo("/login")
  }

  try {
    const base_url = import.meta.env.VITE_BASE_URL
    
    //Get token data
    const tokenResponse = await fetch(`${base_url}/auth/me`, { 
      headers: { Authorization: `Bearer ${token.value}` } 
    })
    const tokenData = await tokenResponse.json()
    if (tokenData.user_id) 
    {
      currentUserId.value = tokenData.user_id
      
      //Fetch user's communities using the user_id
      await fetchUserCommunities(tokenData.user_id)
    } 
  
  } catch (error) {
    console.error('Error loading user data:', error)
  }

  await fetchPosts()
})

//Refresh posts when navigating back to this page
onActivated(async () => {
  await fetchPosts()
})
</script>

<style scoped>
/* Page Layout */
.forum-page {
  background: linear-gradient(135deg, #FFF5E6 0%, #FFE8D6 50%, #FFF0E0 100%);
  min-height: 100vh;
  padding-bottom: 80px;
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, #FFB74D 0%, #FFA726 50%, #FF9800 100%);
  padding: 40px 0 70px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(255, 183, 77, 0.3);
}

.hero-title {
  color: white;
  font-size: 2.5rem;
  font-weight: 800;
  text-align: center;
  margin-bottom: 10px;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.2);
  animation: fadeInDown 1s ease;
  letter-spacing: 1px;
}

.hero-subtitle {
  color: rgba(255, 255, 255, 0.95);
  font-size: 1.1rem;
  text-align: center;
  margin: 0;
  font-weight: 500;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.1);
}

.wave-animation {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 80px;
  overflow: hidden;
}

.wave-animation::before,
.wave-animation::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 200%;
  height: 100%;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M0,50 Q150,20 300,50 T600,50 T900,50 T1200,50 L1200,120 L0,120 Z' fill='%23FFF5E6' fill-opacity='0.4'/%3E%3C/svg%3E") repeat-x;
  background-size: 1200px 100%;
  animation: wave-flow 20s linear infinite;
}

.wave-animation::after {
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M0,70 Q200,40 400,70 T800,70 T1200,70 L1200,120 L0,120 Z' fill='%23FFF5E6' fill-opacity='0.7'/%3E%3C/svg%3E") repeat-x;
  background-size: 1200px 100%;
  animation: wave-flow 15s linear infinite reverse;
}

@keyframes wave-flow {
  0% { transform: translateX(0); }
  100% { transform: translateX(-1200px); }
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

/* Main Container */
.content-container {
  margin-top: -40px;
  position: relative;
  z-index: 10;
}

.forum-layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 25px;
  align-items: start;
}

.sidebar-column {
  position: relative;
}

.main-column {
  min-width: 0;
}

/* Find Community Button */
.find-communities-btn {
  width: 100%;
  margin-top: 15px;
  padding: 15px 20px;
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: white;
  border: none;
  border-radius: 15px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.find-communities-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
  background: linear-gradient(135deg, #45a049 0%, #3d8b40 100%);
}

/* Community Banner */
.community-banner {
  background: linear-gradient(135deg, #FFB74D 0%, #FFA726 100%);
  padding: 12px 18px; 
  border-radius: 12px; 
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 3px 12px rgba(255, 152, 0, 0.2); 
  animation: slideIn 0.3s ease;
}

.community-banner-content {
  display: flex;
  align-items: center;
  gap: 8px; 
  color: white;
  flex: 1;
}

.community-banner-name {
  font-weight: 700;
  font-size: 1rem; 
}

.community-banner-desc {
  font-size: 0.85rem; 
  opacity: 0.9;
  margin-left: auto;
}

.clear-community-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  width: 28px; 
  height: 28px; 
  border-radius: 50%;
  color: white;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem; 
}

.clear-community-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Search & Filter */
.search-card {
  background: white;
  border-radius: 25px;
  padding: 30px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  animation: slideUp 0.8s ease;
  border: 2px solid rgba(255, 152, 0, 0.1);
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
  color: #FF9800;
  font-size: 18px;
}

.search-input {
  width: 100%;
  padding: 15px 50px 15px 50px;
  border: 2px solid #FFB74D;
  border-radius: 50px;
  font-size: 16px;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #FF9800;
  box-shadow: 0 0 0 4px rgba(255, 152, 0, 0.1);
  transform: translateY(-2px);
}

.clear-btn {
  position: absolute;
  right: 15px;
  background: none;
  border: none;
  color: #FFB74D;
  cursor: pointer;
  padding: 8px;
  transition: all 0.3s;
}

.clear-btn:hover {
  color: #FF9800;
  transform: rotate(90deg);
}

.filter-section {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.filter-label {
  font-weight: 700;
  color: #5D4E37;
}

.filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.filter-chip {
  padding: 10px 20px;
  border: 2px solid #FFB74D;
  background: white;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  color: #5D4E37;
}

.filter-chip:hover {
  border-color: #FF9800;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 152, 0, 0.2);
}

.filter-chip.active {
  background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
  color: white;
  border-color: transparent;
  box-shadow: 0 5px 20px rgba(255, 152, 0, 0.3);
}

.active-filters {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  padding: 15px;
  background: linear-gradient(135deg, #FFF5E6 0%, #FFE8D6 100%);
  border-radius: 15px;
  font-size: 14px;
  color: #5D4E37;
  border: 2px solid rgba(255, 152, 0, 0.2);
}

.filter-tag {
  background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.filter-tag i {
  cursor: pointer;
  transition: transform 0.3s;
}

.filter-tag i:hover {
  transform: rotate(90deg);
}

/* Posts */
.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
}

.post-col {
  animation: slideUpStagger 0.6s ease backwards;
}

@keyframes slideUpStagger {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.post-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  cursor: pointer;
  border: 2px solid transparent;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.post-card:hover {
  transform: translateY(-12px);
  box-shadow: 0 20px 50px rgba(255, 152, 0, 0.2);
  border-color: #FFB74D;
}

.post-image-wrapper {
  position: relative;
  width: 100%;
  height: 220px;
  overflow: hidden;
}

.post-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #FFF5E6 0%, #FFE8D6 100%);
  color: #FFB74D;
  font-size: 4rem;
}

.post-badge {
  position: absolute;
  top: 15px;
  left: 15px;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.badge-adoption { background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%); color: white; }
.badge-sighting { background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); color: white; }
.badge-lost { background: linear-gradient(135deg, #FF6B6B 0%, #EE5A6F 100%); color: white; }
.badge-found { background: linear-gradient(135deg, #A8E6CF 0%, #88D8F7 100%); color: white; }
.badge-discussion { background: linear-gradient(135deg, #B8A4E8 0%, #9B7FD4 100%); color: white; }

.resolved-badge {
  position: absolute;
  top: 15px;
  right: 15px;
  background: linear-gradient(135deg, #A8E6CF 0%, #88D8F7 100%);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 5px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.post-body {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.post-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #5D4E37;
  margin-bottom: 10px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-excerpt {
  color: #7A7265;
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 15px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.post-location {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #FF6B6B;
  font-size: 0.85rem;
  margin-bottom: 10px;
  font-weight: 500;
}

.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 15px;
}

.tag {
  padding: 4px 12px;
  background: linear-gradient(135deg, #88D8F7 0%, #A8E6CF 100%);
  color: white;
  border-radius: 15px;
  font-size: 0.75rem;
  font-weight: 600;
}

.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-top: 2px solid #FFF5E6;
  margin-top: auto;
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
  border: 2px solid #FFB74D;
}

.author-name {
  font-weight: 600;
  color: #5D4E37;
  font-size: 0.9rem;
}

.post-stats {
  display: flex;
  gap: 12px;
  color: #7A7265;
  font-size: 0.8rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
  transition: all 0.3s;
}

.stat-item i {
  font-size: 0.9rem;
}

/* Individual reaction colors */
.reaction-like {
  color: #3498db;
}

.reaction-heart {
  color: #e74c3c;
}

.reaction-helpful {
  color: #f39c12;
}

/* Loading & Empty State */
.skeleton-card {
  height: 450px;
  background: linear-gradient(90deg, #FFF5E6 25%, #FFE8D6 50%, #FFF5E6 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 20px;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-state i {
  font-size: 5rem;
  background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 20px;
}

.empty-state h3 {
  font-size: 1.8rem;
  color: #5D4E37;
  margin-bottom: 10px;
  font-weight: 700;
}

.empty-state p {
  color: #7A7265;
  font-size: 1.1rem;
  margin-bottom: 30px;
}

.btn-primary-custom {
  background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
  color: white;
  border: none;
  padding: 15px 40px;
  border-radius: 50px;
  font-weight: 700;
  font-size: 16px;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 10px 30px rgba(255, 152, 0, 0.3);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.btn-primary-custom:hover {
  transform: translateY(-5px) scale(1.05);
  box-shadow: 0 15px 40px rgba(255, 152, 0, 0.5);
}

/* Floating Action Button (FAB +) */
.fab {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
  color: white;
  border: none;
  box-shadow: 0 10px 40px rgba(255, 152, 0, 0.4);
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
  transform: scale(1.15) rotate(90deg);
  box-shadow: 0 15px 50px rgba(255, 152, 0, 0.6);
}

/* Responsiveness related */
@media (max-width: 1024px) {
  .forum-layout { grid-template-columns: 1fr; }
  .sidebar-column { position: static; order: 2; }
  .main-column { order: 1; }
}

@media (max-width: 768px) {
  .hero-title { font-size: 2rem; }
  .search-card { padding: 20px; }
  .filter-section { flex-direction: column; align-items: flex-start; }
  .posts-grid { grid-template-columns: 1fr; }
  .fab { width: 60px; height: 60px; font-size: 20px; bottom: 20px; right: 20px; }
  .community-banner-desc { display: none; }
  
  .post-stats {
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .stat-item {
    font-size: 0.75rem;
  }
}

.row { display: flex; flex-wrap: wrap; margin: -12px; }
.g-4 > * { padding: 12px; }
.col-12, .col-lg-12 { width: 100%; }
.mt-4 { margin-top: 1.5rem; }
.me-1 { margin-right: 0.25rem; }
.me-2 { margin-right: 0.5rem; }
.me-3 { margin-right: 1rem; }
.ms-2 { margin-left: 0.5rem; }
</style>