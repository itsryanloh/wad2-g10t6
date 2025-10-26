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
      <div class="row">
        <!-- Community Sidebar -->
        <div class="col-lg-3 col-md-4 mb-4">
          <CommunitySidebar
            :userCommunities="userCommunities"
            :loading="loadingCommunities"
            :selectedId="selectedCommunityId"
            @select-community="handleCommunitySelect"
            @browse-communities="showBrowseModal = true"
          />
        </div>

        <!-- Main Posts Area -->
        <div class="col-lg-9 col-md-8">
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
            </div>
          </div>

          <!-- Posts Grid -->
          <div v-if="loading" class="loading-state">
            <div class="spinner"></div>
            <p>Loading posts...</p>
          </div>

          <div v-else-if="filteredPosts.length > 0" class="posts-grid">
            <div
              v-for="post in filteredPosts"
              :key="post.id"
              class="post-card"
              @click="navigateTo(`/forum/${post.id}`)"
            >
              <!-- Post Header -->
              <div class="post-header">
                <div class="user-info">
                  <div class="user-avatar">
                    <img
                      v-if="post.users?.avatar_url"
                      :src="post.users.avatar_url"
                      :alt="post.users.name"
                      @error="handleImageError"
                    />
                    <i v-else class="fas fa-user"></i>
                  </div>
                  <div class="user-details">
                    <span class="user-name">{{ post.users?.name || 'Anonymous' }}</span>
                    <span class="post-time">{{ formatDate(post.created_at) }}</span>
                  </div>
                </div>
                <div :class="`post-type-badge ${post.post_type}`">
                  {{ post.post_type }}
                </div>
              </div>

              <!-- Post Image -->
              <div v-if="post.image_urls?.length" class="post-image-wrapper">
                <img
                  :src="post.image_urls[0]"
                  :alt="post.title"
                  class="post-image"
                  @error="handleImageError"
                />
                <div v-if="post.image_urls.length > 1" class="image-count-badge">
                  <i class="fas fa-images me-1"></i>
                  {{ post.image_urls.length }}
                </div>
              </div>

              <!-- Post Content -->
              <div class="post-content">
                <h3 class="post-title">{{ post.title }}</h3>
                <p class="post-text">{{ truncateText(post.content, 150) }}</p>

                <!-- Location -->
                <div v-if="post.location_name" class="location-tag">
                  <i class="fas fa-map-marker-alt me-1"></i>
                  {{ post.location_name }}
                </div>

                <!-- Tags -->
                <div v-if="post.tags?.length" class="tags-container">
                  <span v-for="tag in post.tags.slice(0, 3)" :key="tag" class="tag-badge">
                    #{{ tag }}
                  </span>
                  <span v-if="post.tags.length > 3" class="more-tags">
                    +{{ post.tags.length - 3 }} more
                  </span>
                </div>
              </div>

              <!-- Post Footer -->
              <div class="post-footer">
                <div class="stat-group">
                  <span class="stat">
                    <i class="fas fa-heart"></i>
                    {{ post.reaction_count || 0 }}
                  </span>
                  <span class="stat">
                    <i class="fas fa-comment"></i>
                    {{ post.comment_count || 0 }}
                  </span>
                  <span class="stat">
                    <i class="fas fa-eye"></i>
                    {{ post.view_count || 0 }}
                  </span>
                </div>
                <button class="view-btn">
                  View Post <i class="fas fa-arrow-right ms-1"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="empty-state">
            <i class="fas fa-inbox"></i>
            <h3>No posts found</h3>
            <p>Try adjusting your filters or create a new post</p>
            <button class="btn btn-primary-custom" @click="navigateTo('/forum/createPost')">
              <i class="fas fa-plus me-2"></i>Create First Post
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Browse Communities Modal -->
    <div v-if="showBrowseModal" class="modal-overlay" @click="showBrowseModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3><i class="fas fa-compass me-2"></i>Browse Communities</h3>
          <button class="close-btn" @click="showBrowseModal = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div v-if="loadingAllCommunities" class="loading-state">
            <div class="spinner"></div>
            <p>Loading communities...</p>
          </div>
          
          <div v-else-if="availableCommunities.length > 0" class="communities-list-modal">
            <div
              v-for="community in availableCommunities"
              :key="community.id"
              class="community-card"
            >
              <div class="community-card-content">
                <div class="community-icon-large">
                  <i class="fas fa-map-marker-alt"></i>
                </div>
                <div class="community-details">
                  <h4>{{ community.name }}</h4>
                  <p>{{ community.description || 'No description available' }}</p>
                  <div class="community-meta">
                    <span><i class="fas fa-users"></i> {{ community.member_count || 0 }} members</span>
                    <span><i class="fas fa-newspaper"></i> {{ community.post_count || 0 }} posts</span>
                  </div>
                </div>
              </div>
              <button
                v-if="!isMemberOfCommunity(community.id)"
                @click="handleJoinCommunity(community.id)"
                :disabled="joiningCommunity === community.id"
                class="btn-join"
              >
                <i class="fas fa-plus me-2"></i>
                {{ joiningCommunity === community.id ? 'Joining...' : 'Join' }}
              </button>
              <button
                v-else
                @click="handleLeaveCommunity(community.id)"
                :disabled="leavingCommunity === community.id"
                class="btn-leave"
              >
                <i class="fas fa-check me-2"></i>
                {{ leavingCommunity === community.id ? 'Leaving...' : 'Joined' }}
              </button>
            </div>
          </div>
          
          <div v-else class="empty-state-modal">
            <i class="fas fa-users-slash"></i>
            <p>No communities available</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Floating Action Button -->
    <button class="fab" @click="navigateTo('/forum/createPost')" title="Create New Post">
      <i class="fas fa-plus"></i>
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useForum } from '~/composables/useForum'
import { useCommunities } from '~/composables/useCommunities'
import CommunitySidebar from '~/components/CommunitySidebar.vue'

// Composables
const { posts, loading, fetchPosts } = useForum()
const {
  communities,
  loading: loadingAllCommunities,
  fetchCommunities,
  joinCommunity,
  leaveCommunity,
  fetchUserCommunities,
  fetchCommunityPosts
} = useCommunities()

const token = useCookie('token')
const base_url = import.meta.env.VITE_BASE_URL

// State
const searchQuery = ref('')
const selectedType = ref(null)
const selectedCommunityId = ref(null)
const userCommunities = ref([])
const loadingCommunities = ref(false)
const currentUserId = ref(null)
const showBrowseModal = ref(false)
const joiningCommunity = ref(null)
const leavingCommunity = ref(null)

const postTypes = [
  { value: 'adoption', label: 'Adoption', icon: 'fas fa-heart' },
  { value: 'sighting', label: 'Sighting', icon: 'fas fa-eye' },
  { value: 'lost', label: 'Lost', icon: 'fas fa-exclamation-triangle' },
  { value: 'found', label: 'Found', icon: 'fas fa-check-circle' },
  { value: 'discussion', label: 'Discussion', icon: 'fas fa-comments' },
]

// Get current user from token
const getCurrentUser = async () => {
  if (!token.value) return null
  
  try {
    const response = await fetch(`${base_url}/auth/me`, {
      headers: { Authorization: `Bearer ${token.value}` }
    })
    
    if (!response.ok) return null
    
    const tokenData = await response.json()
    
    // Fetch user details from database
    const usersResponse = await fetch(`${base_url}/users`)
    const users = await usersResponse.json()
    
    const user = users.find(u => u.username === tokenData.username)
    return user || null
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

// Computed
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

const availableCommunities = computed(() => {
  return communities.value || []
})

// Methods
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

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)

  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const navigateTo = (path) => {
  window.location.href = path
}

// Community Functions
const handleCommunitySelect = async (community) => {
  if (!community) {
    // Show all posts
    selectedCommunityId.value = null
    await fetchPosts()
  } else {
    // Filter by community
    selectedCommunityId.value = community.id
    const communityPosts = await fetchCommunityPosts(community.id)
    posts.value = communityPosts
  }
}

const isMemberOfCommunity = (communityId) => {
  return userCommunities.value.some(
    membership => membership.communities?.id === communityId
  )
}

const handleJoinCommunity = async (communityId) => {
  if (!currentUserId.value) {
    alert('Please sign in to join communities')
    return
  }

  joiningCommunity.value = communityId

  try {
    const success = await joinCommunity(communityId, currentUserId.value)
    
    if (success) {
      // Refresh user communities
      await loadUserCommunities()
      alert('Successfully joined community!')
    } else {
      alert('Failed to join community')
    }
  } catch (error) {
    console.error('Error joining community:', error)
    alert('Failed to join community')
  } finally {
    joiningCommunity.value = null
  }
}

const handleLeaveCommunity = async (communityId) => {
  if (!currentUserId.value) return

  if (!confirm('Are you sure you want to leave this community?')) return

  leavingCommunity.value = communityId

  try {
    const success = await leaveCommunity(communityId, currentUserId.value)
    
    if (success) {
      // Refresh user communities
      await loadUserCommunities()
      
      // If user was viewing this community, switch to all posts
      if (selectedCommunityId.value === communityId) {
        selectedCommunityId.value = null
        await fetchPosts()
      }
      
      alert('Successfully left community')
    } else {
      alert('Failed to leave community')
    }
  } catch (error) {
    console.error('Error leaving community:', error)
    alert('Failed to leave community')
  } finally {
    leavingCommunity.value = null
  }
}

const loadUserCommunities = async () => {
  if (!currentUserId.value) {
    userCommunities.value = []
    return
  }

  try {
    loadingCommunities.value = true
    userCommunities.value = await fetchUserCommunities(currentUserId.value)
  } catch (error) {
    console.error('Error loading user communities:', error)
    userCommunities.value = []
  } finally {
    loadingCommunities.value = false
  }
}

// Initialize
onMounted(async () => {
  // Get current user
  const user = await getCurrentUser()
  if (user) {
    currentUserId.value = user.id
    // Load user's communities
    await loadUserCommunities()
  }
  
  // Fetch all posts
  await fetchPosts()
  
  // Fetch all communities for browse modal
  await fetchCommunities()
})
</script>

<style scoped>
.forum-page {
  background: linear-gradient(135deg, #FFF5E6 0%, #FFE8D6 50%, #FFF0E0 100%);
  min-height: 100vh;
  padding-bottom: 80px;
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, #FFB74D 0%, #FFA726 50%, #FF9800 100%);
  padding: 40px 0 60px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(255, 183, 77, 0.3);
}

.wave-animation {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100px;
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
  0% { 
    transform: translateX(0);
  }
  100% { 
    transform: translateX(-1200px);
  }
}

.hero-title {
  color: white;
  font-size: 3rem;
  font-weight: 800;
  text-align: center;
  margin-bottom: 10px;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.2);
  animation: fadeInDown 1s ease;
  letter-spacing: 1px;
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
  color: rgba(255, 255, 255, 0.95);
  font-size: 1.2rem;
  text-align: center;
  margin: 0;
  font-weight: 500;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.1);
  animation: fadeIn 1.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.content-container {
  margin-top: -30px;
  position: relative;
  z-index: 1;
  max-width: 1400px; /* ✅ CHANGED: Reduced from default 1920px */
}

/* Search Card */
.search-card {
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
  animation: slideUp 0.6s ease;
  max-width: 1000px; /* ✅ CHANGED: Added max width */
  margin-left: auto;
  margin-right: auto;
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
}

.search-icon {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: #FF9800;
  font-size: 1.2rem;
}

.search-input {
  width: 100%;
  padding: 15px 55px 15px 55px;
  border: 2px solid #FFE0B2;
  border-radius: 50px;
  font-size: 1rem;
  transition: all 0.3s;
  background: linear-gradient(135deg, #FFFBF5 0%, #FFF8F0 100%);
}

.search-input:focus {
  outline: none;
  border-color: #FF9800;
  box-shadow: 0 0 0 4px rgba(255, 152, 0, 0.1);
}

.clear-btn {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #999;
  font-size: 1.2rem;
  cursor: pointer;
  transition: color 0.3s;
}

.clear-btn:hover {
  color: #FF9800;
}

.filter-section {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.filter-label {
  font-weight: 700;
  color: #5D4E37;
  font-size: 1.05rem;
  white-space: nowrap;
}

.filter-chips {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  flex: 1;
}

.filter-chip {
  padding: 10px 20px;
  border: 2px solid #FFE0B2;
  background: linear-gradient(135deg, #FFF8F0 0%, #FFFAF5 100%);
  border-radius: 50px;
  color: #5D4E37;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.filter-chip:hover {
  border-color: #FF9800;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 152, 0, 0.2);
}

.filter-chip.active {
  background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
  color: white;
  border-color: #FF9800;
  box-shadow: 0 4px 15px rgba(255, 152, 0, 0.3);
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 60px 20px;
  animation: fadeIn 0.5s ease;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #FFE0B2;
  border-top-color: #FF9800;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Posts Grid */
.posts-grid {
  display: grid;
  gap: 25px;
  animation: fadeIn 0.6s ease;
  max-width: 1000px; /* ✅ CHANGED: Added max width */
  margin-left: auto;
  margin-right: auto;
}

.post-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border: 2px solid transparent;
}

.post-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 50px rgba(255, 152, 0, 0.2);
  border-color: #FFB74D;
}

.post-header {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #f9f9f9;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FFB74D 0%, #FF9800 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 3px solid #FFE0B2;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-avatar i {
  color: white;
  font-size: 1.2rem;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 700;
  color: #5D4E37;
  font-size: 1rem;
}

.post-time {
  font-size: 0.85rem;
  color: #7A7265;
}

.post-type-badge {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: capitalize;
}

.post-type-badge.adoption {
  background: linear-gradient(135deg, #FFE5EC 0%, #FFD6E0 100%);
  color: #E91E63;
}

.post-type-badge.sighting {
  background: linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%);
  color: #2196F3;
}

.post-type-badge.lost {
  background: linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%);
  color: #FF9800;
}

.post-type-badge.found {
  background: linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%);
  color: #4CAF50;
}

.post-type-badge.discussion {
  background: linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%);
  color: #9C27B0;
}

.post-image-wrapper {
  position: relative;
  width: 100%;
  height: 300px;
  overflow: hidden;
  background: #f5f5f5;
}

.post-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.post-card:hover .post-image {
  transform: scale(1.05);
}

.image-count-badge {
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px 15px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  backdrop-filter: blur(10px);
}

.post-content {
  padding: 25px;
}

.post-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #5D4E37;
  margin-bottom: 12px;
  line-height: 1.4;
}

.post-text {
  color: #7A7265;
  line-height: 1.6;
  margin-bottom: 15px;
  font-size: 1rem;
}

/* ✅ CHANGED: Updated location tag colors to match orange theme */
.location-tag {
  display: inline-flex;
  align-items: center;
  padding: 8px 15px;
  background: linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%);
  color: #F57C00;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 15px;
  border: 1px solid #FFB74D;
}

.tags-container {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 15px;
}

.tag-badge {
  padding: 6px 12px;
  background: linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%);
  color: #7B1FA2;
  border-radius: 15px;
  font-size: 0.85rem;
  font-weight: 600;
}

.more-tags {
  padding: 6px 12px;
  background: #f5f5f5;
  color: #999;
  border-radius: 15px;
  font-size: 0.85rem;
  font-weight: 600;
}

.post-footer {
  padding: 20px 25px;
  border-top: 2px solid #f9f9f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-group {
  display: flex;
  gap: 20px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #7A7265;
  font-weight: 600;
  font-size: 0.95rem;
}

.stat i {
  color: #FF9800;
}

.view-btn {
  padding: 10px 20px;
  background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
  color: white;
  border: none;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.view-btn:hover {
  transform: translateX(5px);
  box-shadow: 0 4px 15px rgba(255, 152, 0, 0.3);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  animation: fadeIn 0.6s ease;
}

.empty-state i {
  font-size: 5rem;
  color: #FFB74D;
  margin-bottom: 25px;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 1.8rem;
  color: #5D4E37;
  margin-bottom: 15px;
  font-weight: 700;
}

.empty-state p {
  color: #7A7265;
  font-size: 1.1rem;
  margin-bottom: 30px;
}

.btn-primary-custom {
  padding: 15px 35px;
  background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
  color: white;
  border: none;
  border-radius: 50px;
  font-weight: 700;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 5px 20px rgba(255, 152, 0, 0.3);
}

.btn-primary-custom:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(255, 152, 0, 0.4);
}

/* Floating Action Button */
.fab {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 65px;
  height: 65px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
  color: white;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: 0 8px 25px rgba(255, 152, 0, 0.4);
  transition: all 0.3s;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fab:hover {
  transform: translateY(-5px) rotate(90deg);
  box-shadow: 0 12px 35px rgba(255, 152, 0, 0.5);
}

/* Browse Communities Modal */
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
  max-width: 800px;
  width: 100%;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease;
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
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 5px 10px;
  transition: transform 0.3s;
}

.close-btn:hover {
  transform: rotate(90deg);
}

.modal-body {
  padding: 25px 30px;
  overflow-y: auto;
  flex: 1;
}

.communities-list-modal {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.community-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border: 2px solid #FFE0B2;
  border-radius: 15px;
  transition: all 0.3s;
  background: linear-gradient(135deg, #FFFBF5 0%, #FFF8F0 100%);
}

.community-card:hover {
  border-color: #FF9800;
  box-shadow: 0 5px 20px rgba(255, 152, 0, 0.15);
  transform: translateY(-2px);
}

.community-card-content {
  display: flex;
  align-items: center;
  gap: 15px;
  flex: 1;
}

.community-icon-large {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #FFB74D 0%, #FF9800 100%);
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.8rem;
  flex-shrink: 0;
}

.community-details {
  flex: 1;
  min-width: 0;
}

.community-details h4 {
  margin: 0 0 8px 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: #5D4E37;
}

.community-details p {
  margin: 0 0 10px 0;
  color: #7A7265;
  font-size: 0.95rem;
}

.community-meta {
  display: flex;
  gap: 15px;
  font-size: 0.9rem;
  color: #999;
}

.community-meta span {
  display: flex;
  align-items: center;
  gap: 5px;
}

.btn-join,
.btn-leave {
  padding: 12px 25px;
  border: none;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.btn-join {
  background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
  color: white;
}

.btn-join:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 152, 0, 0.3);
}

.btn-join:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-leave {
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: white;
}

.btn-leave:hover {
  background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
}

.btn-leave:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.empty-state-modal {
  text-align: center;
  padding: 60px 20px;
}

.empty-state-modal i {
  font-size: 4rem;
  color: #FFB74D;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-state-modal p {
  color: #7A7265;
  font-size: 1.1rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .search-card {
    padding: 20px;
  }

  .filter-section {
    flex-direction: column;
    align-items: flex-start;
  }

  .filter-chips {
    width: 100%;
  }

  .post-card {
    margin-bottom: 20px;
  }

  .fab {
    bottom: 20px;
    right: 20px;
    width: 55px;
    height: 55px;
    font-size: 1.3rem;
  }

  .modal-content {
    max-width: 100%;
    max-height: 90vh;
  }

  .community-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .btn-join,
  .btn-leave {
    width: 100%;
  }
}
</style>